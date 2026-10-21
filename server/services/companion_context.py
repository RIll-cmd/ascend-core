"""Owner-scoped latest laptop context, with lease expiry and source sequencing."""
from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import datetime, timedelta, timezone
import json
import secrets
import threading
from typing import Any

from schemas.companion_context import CompanionContextPublishRequest


_UNKNOWN = {
    "deskPresence": "unknown", "desktopActivity": "unavailable",
    "foregroundCategory": "unknown", "focusSession": "unavailable", "declaredIntent": "none",
}


def is_dedicated_publisher_credential(credential: str, expected: str,
                                      other_credentials: tuple[str, ...]) -> bool:
    return bool(expected and secrets.compare_digest(credential, expected)
                and not any(secrets.compare_digest(expected, value)
                            for value in other_credentials if value))


def _validate_progress(existing: CompanionContextRecord | None, incoming: CompanionContextRecord) -> None:
    if existing is None:
        if incoming.snapshot_revision != 0:
            raise ValueError("A first context snapshot must start at revision zero")
        return
    if incoming.boot_id == existing.boot_id:
        if incoming.boot_started_at != existing.boot_started_at:
            raise ValueError("Context boot timestamp changed within a boot")
        if incoming.snapshot_revision < existing.snapshot_revision:
            raise ValueError("Stale context revision")
        if any(incoming.source_sequences.get(source, 0) < sequence
               for source, sequence in existing.source_sequences.items()):
            raise ValueError("Context source sequence moved backwards")
        if incoming.snapshot_revision == existing.snapshot_revision:
            if incoming.generated_at < existing.generated_at:
                raise ValueError("Context heartbeat timestamp moved backwards")
            old = existing.snapshot
            new = incoming.snapshot
            stable_fields = ("deviceId", "bootId", "bootStartedAt", "snapshotRevision",
                             "sourceSequences", "snapshotId", "paused")
            if any(old.get(name) != new.get(name) for name in stable_fields):
                raise ValueError("Context revision was reused with different evidence")
            old_fields, new_fields = old.get("fields", {}), new.get("fields", {})
            if set(old_fields) != set(new_fields):
                raise ValueError("Context revision changed its field set")
            for name, previous in old_fields.items():
                current = new_fields[name]
                if current.get("ageSeconds") is not None and previous.get("ageSeconds") is not None:
                    if current["ageSeconds"] < previous["ageSeconds"]:
                        raise ValueError("Context field age moved backwards")
                if current.get("source") == "none" and previous.get("source") == "user_declaration":
                    if (name != "declaredIntent" or previous.get("expiresAt") is None
                            or datetime.fromisoformat(previous["expiresAt"].replace("Z", "+00:00")) > incoming.generated_at
                            or current.get("value") != _UNKNOWN[name]):
                        raise ValueError("Context declaration cannot be cleared before expiry")
                    continue
                for key in ("source", "observedAt", "expiresAt", "evidenceKind"):
                    if current.get(key) != previous.get(key):
                        raise ValueError("Context revision changed evidence provenance")
                old_freshness, new_freshness = previous.get("freshness"), current.get("freshness")
                allowed = {
                    "fresh": {"fresh", "stale"},
                    "stale": {"stale"},
                    "unavailable": {"unavailable"},
                    "paused": {"paused"},
                }
                if new_freshness not in allowed.get(old_freshness, set()):
                    raise ValueError("Context freshness cannot improve at the same revision")
                if current.get("value") != previous.get("value"):
                    expires_at = current.get("expiresAt")
                    if (new_freshness != "stale" or current.get("value") != _UNKNOWN[name]
                            or expires_at is None
                            or datetime.fromisoformat(expires_at.replace("Z", "+00:00")) > incoming.generated_at):
                        raise ValueError("Context revision changed observed evidence")
        return
    if incoming.boot_started_at <= existing.boot_started_at:
        raise ValueError("Context boot identifier is stale")
    if incoming.snapshot_revision != 0:
        raise ValueError("A new context boot must start at revision zero")


@dataclass(frozen=True)
class CompanionContextRecord:
    owner_id: str
    device_id: str
    boot_id: str
    boot_started_at: datetime
    snapshot_revision: int
    source_sequences: dict[str, int]
    snapshot: dict[str, Any]
    generated_at: datetime
    last_seen_at: datetime
    lease_expires_at: datetime


class InMemoryCompanionContextRepository:
    """Deterministic repository for unit tests; production uses PostgreSQL."""

    def __init__(self):
        self.records: dict[tuple[str, str], CompanionContextRecord] = {}
        self._lock = threading.RLock()

    async def get(self, owner_id: str, device_id: str) -> CompanionContextRecord | None:
        with self._lock:
            record = self.records.get((owner_id, device_id))
            return replace(record) if record else None

    async def accept(self, record: CompanionContextRecord) -> CompanionContextRecord:
        with self._lock:
            _validate_progress(self.records.get((record.owner_id, record.device_id)), record)
            self.records[(record.owner_id, record.device_id)] = replace(record)
            return replace(record)

    async def delete_expired(self, now: datetime) -> int:
        with self._lock:
            expired = [key for key, record in self.records.items() if record.lease_expires_at <= now]
            for key in expired:
                del self.records[key]
            return len(expired)


class PostgresCompanionContextRepository:
    """Prisma adapter. Owner-row locking serializes concurrent publisher updates."""

    def __init__(self, database):
        self.db = database

    @staticmethod
    def _record(row) -> CompanionContextRecord:
        return CompanionContextRecord(
            owner_id=row.ownerId, device_id=row.deviceId, boot_id=row.bootId,
            boot_started_at=row.bootStartedAt, snapshot_revision=row.snapshotRevision,
            source_sequences=json.loads(row.sourceSequencesJson),
            snapshot=json.loads(row.snapshotJson), generated_at=row.generatedAt,
            last_seen_at=row.lastSeenAt, lease_expires_at=row.leaseExpiresAt,
        )

    async def get(self, owner_id: str, device_id: str) -> CompanionContextRecord | None:
        row = await self.db.companioncontextrecord.find_unique(
            where={"ownerId_deviceId": {"ownerId": owner_id, "deviceId": device_id}},
        )
        return self._record(row) if row else None

    async def accept(self, record: CompanionContextRecord) -> CompanionContextRecord:
        data = {
            "bootId": record.boot_id, "bootStartedAt": record.boot_started_at,
            "snapshotRevision": record.snapshot_revision,
            "sourceSequencesJson": json.dumps(record.source_sequences, separators=(",", ":")),
            "snapshotJson": json.dumps(record.snapshot, separators=(",", ":"), ensure_ascii=False),
            "generatedAt": record.generated_at, "lastSeenAt": record.last_seen_at,
            "leaseExpiresAt": record.lease_expires_at,
        }
        async with self.db.tx() as tx:
            if not await tx.query_raw('SELECT id FROM "User" WHERE id = $1 FOR UPDATE', record.owner_id):
                raise PermissionError("Context owner is unavailable")
            row = await tx.companioncontextrecord.find_unique(
                where={"ownerId_deviceId": {"ownerId": record.owner_id, "deviceId": record.device_id}},
            )
            _validate_progress(self._record(row) if row else None, record)
            if row:
                row = await tx.companioncontextrecord.update(
                    where={"ownerId_deviceId": {"ownerId": record.owner_id, "deviceId": record.device_id}},
                    data=data,
                )
            else:
                row = await tx.companioncontextrecord.create(
                    data={"ownerId": record.owner_id, "deviceId": record.device_id, **data},
                )
        return self._record(row)

    async def delete_expired(self, now: datetime) -> int:
        result = await self.db.companioncontextrecord.delete_many(where={"leaseExpiresAt": {"lte": now}})
        return getattr(result, "count", result if isinstance(result, int) else 0)


class CompanionContextService:
    def __init__(self, repository, *, owner_id: str, device_id: str,
                 clock=lambda: datetime.now(timezone.utc)):
        if not isinstance(owner_id, str) or not owner_id.strip():
            raise ValueError("context owner is required")
        if not isinstance(device_id, str) or not device_id.strip():
            raise ValueError("context device is required")
        self.repository = repository
        self.owner_id = owner_id.strip()
        self.device_id = device_id.strip()
        self._clock = clock

    async def publish(self, payload: dict | CompanionContextPublishRequest,
                      *, now: datetime | None = None) -> CompanionContextRecord:
        value = (payload if isinstance(payload, CompanionContextPublishRequest)
                 else CompanionContextPublishRequest.model_validate(payload))
        if value.device_id != self.device_id:
            raise PermissionError("Context publisher device is not authorized")
        checked_at = self._aware(now or self._clock())
        generated_at = value.generated_at.astimezone(timezone.utc)
        boot_started_at = value.boot_started_at.astimezone(timezone.utc)
        if generated_at > checked_at + timedelta(seconds=5) or generated_at < checked_at - timedelta(seconds=60):
            raise ValueError("Context snapshot timestamp is outside the accepted window")
        if boot_started_at < generated_at - timedelta(days=365):
            raise ValueError("Context boot timestamp is too old")
        if value.lease_expires_at.astimezone(timezone.utc) <= checked_at:
            raise ValueError("Context lease already expired")

        snapshot = value.model_dump(mode="json", by_alias=True)
        record = CompanionContextRecord(
            owner_id=self.owner_id, device_id=self.device_id, boot_id=value.boot_id,
            boot_started_at=boot_started_at, snapshot_revision=value.snapshot_revision,
            source_sequences=dict(value.source_sequences), snapshot=snapshot,
            generated_at=generated_at, last_seen_at=checked_at,
            lease_expires_at=value.lease_expires_at.astimezone(timezone.utc),
        )
        return await self.repository.accept(record)

    async def read(self, owner_id: str, *, now: datetime | None = None) -> dict[str, Any]:
        checked_at = self._aware(now or self._clock())
        if owner_id != self.owner_id:
            raise PermissionError("Context is not available to this owner")
        record = await self.repository.get(owner_id, self.device_id)
        if record is None:
            return {"available": False, "reason": "never_published", "deviceId": self.device_id,
                    "lastSeenAt": None, "generatedAt": None, "snapshotId": None,
                    "fields": self._empty_fields("unavailable")}
        snapshot = json.loads(json.dumps(record.snapshot))
        lease_valid = record.lease_expires_at > checked_at
        for name, field in snapshot["fields"].items():
            observed_at = field.get("observedAt")
            if observed_at:
                observed = datetime.fromisoformat(observed_at.replace("Z", "+00:00")).astimezone(timezone.utc)
                field["ageSeconds"] = max(0, int((checked_at - observed).total_seconds()))
            field_expiry = field.get("expiresAt")
            expired = not lease_valid
            if field_expiry:
                expiry = datetime.fromisoformat(field_expiry.replace("Z", "+00:00"))
                expired = expired or expiry <= checked_at
            if field.get("freshness") in {"fresh", "stale"} and expired:
                field["freshness"] = "stale"
                field["value"] = _UNKNOWN[name]
        projection = {
            "available": lease_valid,
            "reason": "current" if lease_valid else "laptop_offline",
            "deviceId": record.device_id,
            "bootId": record.boot_id,
            "snapshotId": snapshot["snapshotId"],
            "generatedAt": record.generated_at.isoformat(),
            "lastSeenAt": record.last_seen_at.isoformat(),
            "leaseExpiresAt": record.lease_expires_at.isoformat(),
            "fields": snapshot["fields"],
        }
        if not lease_valid:
            # Preserve the last-seen metadata in this response, then erase the
            # expired context projection as soon as an offline read observes it.
            await self.repository.delete_expired(checked_at)
        return projection

    async def cleanup(self, *, now: datetime | None = None) -> int:
        return await self.repository.delete_expired(self._aware(now or self._clock()))

    @staticmethod
    def _empty_fields(freshness: str) -> dict[str, dict[str, Any]]:
        return {name: {"value": value, "source": "none", "freshness": freshness,
                       "observedAt": None, "expiresAt": None, "ageSeconds": None,
                       "evidenceKind": "user_report" if name == "declaredIntent" else "observation"}
                for name, value in _UNKNOWN.items()}

    @staticmethod
    def _aware(value: datetime) -> datetime:
        if not isinstance(value, datetime) or value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("context clock must return an aware datetime")
        return value.astimezone(timezone.utc)

