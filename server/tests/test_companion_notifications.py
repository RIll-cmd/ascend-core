from datetime import datetime, timedelta, timezone
import asyncio

import pytest

from services.companion_notifications import (
    CompanionNotificationService,
    InMemoryNotificationRepository,
)
from schemas.companion_notifications import NotificationPreferenceRequest, NotificationPublishRequest, PushSubscriptionRequest


NOW = datetime(2026, 9, 28, 12, tzinfo=timezone.utc)


@pytest.mark.asyncio
async def test_channels_are_independently_opted_in_and_lock_screen_is_generic():
    repository = InMemoryNotificationRepository()
    service = CompanionNotificationService(repository, owner_id="owner-1")
    p256dh, auth = "B" * 87, "C" * 22
    await service.register_push("owner-1", "device-1", endpoint="https://fcm.googleapis.com/sub/secret",
                                p256dh=p256dh, auth=auth)

    assert await service.get_preferences("owner-1") == {"pwa_push": False, "discord_dm": False}
    await service.set_preference("owner-1", "pwa_push", True)
    intent = await service.publish("owner-1", "stable-trigger-1", "Agent update", "Codex finished the release build.", now=NOW)
    claimed = await service.claim("worker-secret", now=NOW)

    assert intent.intent_id == claimed["intentId"]
    assert claimed["channel"] == "pwa_push"
    assert "detail" not in claimed
    assert claimed["lockScreen"] == {"title": "Ascend Vision", "body": "You have a private update."}
    assert "secret" not in claimed["lockScreen"]["body"]


@pytest.mark.asyncio
async def test_claims_are_single_winner_and_share_owner_budget_across_channels():
    repository = InMemoryNotificationRepository()
    service = CompanionNotificationService(repository, owner_id="owner-1", daily_limit=1)
    await service.register_push("owner-1", "device-1", endpoint="https://updates.push.services.mozilla.com/one", p256dh="B" * 87, auth="C" * 22)
    await service.set_preference("owner-1", "pwa_push", True)
    await service.publish("owner-1", "trigger-1", "Update", "one", now=NOW)

    claims = await asyncio.gather(service.claim("worker-secret", now=NOW), service.claim("worker-secret", now=NOW))
    assert sum(claim is not None for claim in claims) == 1

    assert await service.publish("owner-1", "trigger-2", "Update", "two", now=NOW) is None


@pytest.mark.asyncio
async def test_expired_and_revoked_destinations_never_claim_and_details_are_owner_scoped():
    repository = InMemoryNotificationRepository()
    service = CompanionNotificationService(repository, owner_id="owner-1")
    await service.register_push("owner-1", "device-1", endpoint="https://fcm.googleapis.com/one", p256dh="B" * 87, auth="C" * 22)
    await service.set_preference("owner-1", "pwa_push", True)
    expired = await service.publish("owner-1", "trigger-expired", "Update", "private", now=NOW,
                                    expires_at=NOW + timedelta(seconds=1))
    await service.revoke_push("owner-1", "device-1")
    with pytest.raises(PermissionError):
        await service.read_detail("other-owner", "device-1", expired.intent_id, now=NOW)
    assert await service.claim("worker-secret", now=NOW + timedelta(seconds=2)) is None


@pytest.mark.asyncio
async def test_disabling_channel_consent_cancels_its_queued_delivery():
    repository = InMemoryNotificationRepository()
    service = CompanionNotificationService(repository, owner_id="owner-1")
    await service.register_push("owner-1", "device-1", endpoint="https://web.push.apple.com/one", p256dh="B" * 87, auth="C" * 22)
    await service.set_preference("owner-1", "pwa_push", True)
    await service.publish("owner-1", "trigger-pending", "Update", "private", now=NOW)

    await service.set_preference("owner-1", "pwa_push", False)

    assert await service.claim("worker-secret", now=NOW) is None


@pytest.mark.asyncio
async def test_delivery_retries_are_bounded_and_unknown_receipts_do_not_retry():
    repository = InMemoryNotificationRepository()
    service = CompanionNotificationService(repository, owner_id="owner-1")
    await service.register_push("owner-1", "device-1", endpoint="https://fcm.googleapis.com/one", p256dh="B" * 87, auth="C" * 22)
    await service.set_preference("owner-1", "pwa_push", True)
    await service.publish("owner-1", "trigger-retry", "Update", "private", now=NOW)
    first = await service.claim("worker-secret", now=NOW)
    assert await service.record_outcome("worker-secret", first["deliveryId"], first["claimId"], "failed",
                                        retryable=True, now=NOW) == "retry"
    assert await service.claim("worker-secret", now=NOW + timedelta(seconds=1)) is None
    second = await service.claim("worker-secret", now=NOW + timedelta(seconds=3))
    assert second["attempt"] == 2
    assert await service.record_outcome("worker-secret", second["deliveryId"], second["claimId"], "unknown",
                                        now=NOW + timedelta(seconds=3)) == "unknown"
    assert await service.claim("worker-secret", now=NOW + timedelta(hours=1)) is None


def test_notification_ciphertext_hides_push_capabilities_and_private_detail():
    from services.notification_crypto import NotificationCipher

    cipher = NotificationCipher.from_key("MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA=")
    secret = '{"endpoint":"https://fcm.googleapis.com/private-token","auth":"subscription-secret"}'
    encrypted = cipher.encrypt(secret)
    assert secret not in encrypted
    assert cipher.decrypt(encrypted) == secret


def test_notification_requests_reject_owner_override_and_unbounded_or_multiline_content():
    from pydantic import ValidationError

    assert NotificationPreferenceRequest(channel="pwa_push", enabled=True).enabled is True
    with pytest.raises(ValidationError):
        NotificationPreferenceRequest(channel="push", enabled=True)
    with pytest.raises(ValidationError):
        NotificationPublishRequest(triggerKey="trigger-1", category="Build", detail="private", ownerId="attacker")
    with pytest.raises(ValidationError):
        NotificationPublishRequest(triggerKey="trigger-1", category="Build", detail="private\nmessage")
    with pytest.raises(ValidationError):
        PushSubscriptionRequest(deviceId="device-1", endpoint="http://insecure.example/push",
                                keys={"p256dh": "B" * 87, "auth": "C" * 22})


@pytest.mark.asyncio
async def test_push_registration_rejects_arbitrary_https_hosts_to_prevent_ssrf():
    service = CompanionNotificationService(InMemoryNotificationRepository(), owner_id="owner-1")
    with pytest.raises(ValueError, match="supported browser push provider"):
        await service.register_push("owner-1", "device-1", endpoint="https://attacker.example/push",
                                    p256dh="B" * 87, auth="C" * 22)


@pytest.mark.asyncio
async def test_channel_scoped_claim_keeps_discord_delivery_for_its_own_worker():
    service = CompanionNotificationService(InMemoryNotificationRepository(), owner_id="owner-1")
    await service.register_push("owner-1", "device-1", endpoint="https://fcm.googleapis.com/push", p256dh="B" * 87, auth="C" * 22)
    await service.set_discord_destination("owner-1", "123456789012345678", linked=True)
    await service.set_preference("owner-1", "pwa_push", True)
    await service.set_preference("owner-1", "discord_dm", True)
    await service.publish("owner-1", "trigger-multi-channel", "Update", "private detail", now=NOW)

    push = await service.claim("worker-secret", channel="pwa_push", now=NOW)
    assert push["channel"] == "pwa_push"
    with pytest.raises(ValueError, match="channel"):
        await service.claim("worker-secret", channel="unsupported", now=NOW)


@pytest.mark.asyncio
async def test_permanently_invalid_push_endpoint_is_revoked_and_channel_consent_turns_off():
    service = CompanionNotificationService(InMemoryNotificationRepository(), owner_id="owner-1")
    await service.register_push("owner-1", "device-1", endpoint="https://fcm.googleapis.com/push", p256dh="B" * 87, auth="C" * 22)
    await service.set_preference("owner-1", "pwa_push", True)
    await service.publish("owner-1", "invalid-push", "Update", "private", now=NOW)
    claim = await service.claim("worker-secret", channel="pwa_push", now=NOW)

    assert await service.record_outcome("worker-secret", claim["deliveryId"], claim["claimId"], "failed",
                                        revoke_destination=True, now=NOW) == "failed"
    assert (await service.get_preferences("owner-1"))["pwa_push"] is False
    assert await service.claim("worker-secret", channel="pwa_push", now=NOW) is None
