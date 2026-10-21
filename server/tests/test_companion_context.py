from datetime import datetime, timedelta, timezone
import copy

import pytest

from schemas.companion_context import CompanionContextPublishRequest
from services.companion_context import (
    CompanionContextService, InMemoryCompanionContextRepository,
    is_dedicated_publisher_credential,
)


NOW = datetime(2026, 9, 27, 8, 0, tzinfo=timezone.utc)


def packet(*, revision=0, boot_id="boot-a", boot_started_at=NOW - timedelta(minutes=1),
           generated_at=NOW, lease_expires_at=NOW + timedelta(seconds=30),
           desktop_sequence=1, activity="input_active"):
    return {
        "schemaVersion": 1,
        "source": "local Vision laptop context",
        "deviceId": "laptop-1",
        "bootId": boot_id,
        "bootStartedAt": boot_started_at.isoformat(),
        "snapshotRevision": revision,
        "sourceSequences": {"desktop_activity": desktop_sequence},
        "snapshotId": f"{boot_id}:{revision}",
        "generatedAt": generated_at.isoformat(),
        "leaseExpiresAt": lease_expires_at.isoformat(),
        "paused": False,
        "fields": {
            "deskPresence": {"value": "unknown", "source": "none", "freshness": "unavailable",
                             "observedAt": None, "expiresAt": None, "ageSeconds": None,
                             "evidenceKind": "observation"},
            "desktopActivity": {"value": activity, "source": "desktop_activity", "freshness": "fresh",
                                "observedAt": (generated_at - timedelta(seconds=1)).isoformat(),
                                "expiresAt": (generated_at + timedelta(seconds=9)).isoformat(),
                                "ageSeconds": 1, "evidenceKind": "observation"},
            "foregroundCategory": {"value": "unknown", "source": "none", "freshness": "unavailable",
                                   "observedAt": None, "expiresAt": None, "ageSeconds": None,
                                   "evidenceKind": "observation"},
            "focusSession": {"value": "unavailable", "source": "none", "freshness": "unavailable",
                             "observedAt": None, "expiresAt": None, "ageSeconds": None,
                             "evidenceKind": "observation"},
            "declaredIntent": {"value": "none", "source": "none", "freshness": "unavailable",
                               "observedAt": None, "expiresAt": None, "ageSeconds": None,
                               "evidenceKind": "user_report"},
        },
    }


def test_publish_replaces_latest_record_and_refreshes_identical_heartbeat():
    async def scenario():
        repository = InMemoryCompanionContextRepository()
        service = CompanionContextService(repository, owner_id="owner-1", device_id="laptop-1")

        first = await service.publish(packet(), now=NOW)
        heartbeat = await service.publish(packet(), now=NOW + timedelta(seconds=5))
        latest = await service.publish(
            packet(revision=1, desktop_sequence=2, activity="input_idle"),
            now=NOW + timedelta(seconds=6),
        )

        assert first.last_seen_at == NOW
        assert heartbeat.last_seen_at == NOW + timedelta(seconds=5)
        assert latest.snapshot["snapshotRevision"] == 1
        assert len(repository.records) == 1

    import asyncio
    asyncio.run(scenario())


@pytest.mark.parametrize("updates", [
    {"revision": 0},
    {"revision": 2, "desktop_sequence": 0},
])
def test_old_revision_or_source_sequence_cannot_replace_latest(updates):
    async def scenario():
        repository = InMemoryCompanionContextRepository()
        service = CompanionContextService(repository, owner_id="owner-1", device_id="laptop-1")
        await service.publish(packet(revision=0, desktop_sequence=2), now=NOW)
        await service.publish(packet(revision=2, desktop_sequence=3), now=NOW)

        with pytest.raises(ValueError, match="(?i)stale|sequence"):
            await service.publish(packet(**updates), now=NOW + timedelta(seconds=1))

        assert repository.records[("owner-1", "laptop-1")].snapshot["snapshotRevision"] == 2

    import asyncio
    asyncio.run(scenario())


def test_concurrent_out_of_order_publish_cannot_regress_latest_record():
    async def scenario():
        import asyncio

        repository = InMemoryCompanionContextRepository()
        service = CompanionContextService(repository, owner_id="owner-1", device_id="laptop-1")
        await service.publish(packet(revision=0, desktop_sequence=0), now=NOW)

        async def publish(revision):
            try:
                await service.publish(packet(revision=revision, desktop_sequence=revision), now=NOW)
                return None
            except ValueError as error:
                return error

        await asyncio.gather(
            asyncio.to_thread(lambda: asyncio.run(publish(3))),
            asyncio.to_thread(lambda: asyncio.run(publish(2))),
        )

        assert repository.records[("owner-1", "laptop-1")].snapshot["snapshotRevision"] == 3

    import asyncio
    asyncio.run(scenario())


def test_same_revision_heartbeat_can_age_and_expire_evidence_but_cannot_rewrite_it():
    async def scenario():
        repository = InMemoryCompanionContextRepository()
        service = CompanionContextService(repository, owner_id="owner-1", device_id="laptop-1")
        first = packet()
        await service.publish(first, now=NOW)

        aged = copy.deepcopy(first)
        aged["generatedAt"] = (NOW + timedelta(seconds=5)).isoformat()
        aged["leaseExpiresAt"] = (NOW + timedelta(seconds=35)).isoformat()
        aged["fields"]["desktopActivity"]["ageSeconds"] = 6
        await service.publish(aged, now=NOW + timedelta(seconds=5))

        expired = copy.deepcopy(aged)
        expired["generatedAt"] = (NOW + timedelta(seconds=11)).isoformat()
        expired["leaseExpiresAt"] = (NOW + timedelta(seconds=41)).isoformat()
        expired["fields"]["desktopActivity"].update(
            value="unavailable", freshness="stale", ageSeconds=12,
        )
        await service.publish(expired, now=NOW + timedelta(seconds=11))

        rewritten = copy.deepcopy(expired)
        rewritten["fields"]["desktopActivity"].update(
            value="input_idle", freshness="fresh", ageSeconds=1,
            observedAt=(NOW + timedelta(seconds=11)).isoformat(),
            expiresAt=(NOW + timedelta(seconds=21)).isoformat(),
        )
        with pytest.raises(ValueError, match="(?i)evidence|freshness|age"):
            await service.publish(rewritten, now=NOW + timedelta(seconds=12))

        assert repository.records[("owner-1", "laptop-1")].snapshot["fields"]["desktopActivity"]["freshness"] == "stale"

    import asyncio
    asyncio.run(scenario())


def test_restarted_laptop_requires_newer_boot_timestamp_and_starts_at_revision_zero():
    async def scenario():
        repository = InMemoryCompanionContextRepository()
        service = CompanionContextService(repository, owner_id="owner-1", device_id="laptop-1")
        await service.publish(packet(revision=0, desktop_sequence=0), now=NOW)
        await service.publish(packet(revision=8, desktop_sequence=8), now=NOW)

        with pytest.raises(ValueError, match="boot"):
            await service.publish(packet(boot_id="boot-old", boot_started_at=NOW - timedelta(hours=1),
                                         revision=0, desktop_sequence=0), now=NOW)
        restarted = await service.publish(packet(boot_id="boot-b", boot_started_at=NOW + timedelta(seconds=1),
                                                  revision=0, desktop_sequence=0,
                                                  generated_at=NOW + timedelta(seconds=2),
                                                  lease_expires_at=NOW + timedelta(seconds=32)),
                                          now=NOW + timedelta(seconds=2))
        assert restarted.boot_id == "boot-b"
        assert restarted.snapshot["snapshotRevision"] == 0

    import asyncio
    asyncio.run(scenario())


def test_read_expires_each_field_and_marks_stopped_laptop_unavailable():
    async def scenario():
        repository = InMemoryCompanionContextRepository()
        service = CompanionContextService(repository, owner_id="owner-1", device_id="laptop-1")
        await service.publish(packet(), now=NOW)

        field_expired = await service.read("owner-1", now=NOW + timedelta(seconds=11))
        device_expired = await service.read("owner-1", now=NOW + timedelta(seconds=31))

        assert field_expired["fields"]["desktopActivity"]["freshness"] == "stale"
        assert field_expired["fields"]["desktopActivity"]["value"] == "unavailable"
        assert field_expired["fields"]["desktopActivity"]["ageSeconds"] == 12
        assert device_expired["available"] is False
        assert device_expired["fields"]["desktopActivity"]["freshness"] == "stale"
        assert device_expired["fields"]["desktopActivity"]["ageSeconds"] == 32
        assert device_expired["lastSeenAt"] == NOW.isoformat()
        assert repository.records == {}

    import asyncio
    asyncio.run(scenario())


def test_context_schema_rejects_untrusted_or_oversized_payload_fields():
    value = packet()
    value["fields"]["desktopActivity"]["windowTitle"] = "private document.txt"
    with pytest.raises(Exception):
        CompanionContextPublishRequest.model_validate(value)

    value = packet()
    value["paused"] = "false"
    with pytest.raises(Exception):
        CompanionContextPublishRequest.model_validate(value)

    value = packet()
    value["sourceSequences"]["desktop_activity"] = True
    with pytest.raises(Exception):
        CompanionContextPublishRequest.model_validate(value)


def test_context_publisher_requires_a_dedicated_write_credential():
    assert is_dedicated_publisher_credential("write-token", "write-token", ("reader", "worker"))
    assert not is_dedicated_publisher_credential("reader", "reader", ("reader",))
    assert not is_dedicated_publisher_credential("wrong", "write-token", ())

    value = packet()
    value["snapshotId"] = "wrong"
    with pytest.raises(Exception):
        CompanionContextPublishRequest.model_validate(value)

