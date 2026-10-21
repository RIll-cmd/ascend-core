"""Storage boundary for the single-owner phone-chat delivery queue."""
from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from typing import Any


@dataclass
class PhoneChatDevice:
    id: str
    owner_id: str
    created_at: datetime
    revoked_at: datetime | None = None


@dataclass
class PhoneChatJob:
    message_id: str
    owner_id: str
    device_id: str
    session_id: str
    text: str
    status: str
    attempt: int
    expires_at: datetime
    created_at: datetime
    lease_id: str | None = None
    lease_expires_at: datetime | None = None
    reply: str | None = None
    error_code: str | None = None
    completed_at: datetime | None = None
    acknowledged_at: datetime | None = None
    audio_data: bytes | None = None
    audio_mime_type: str | None = None


@dataclass
class PhoneChatTombstone:
    message_id: str
    owner_id: str
    device_id: str
    status: str
    expires_at: datetime
    created_at: datetime


class InMemoryPhoneChatRepository:
    """Deterministic repository used by unit/API tests only."""

    def __init__(self):
        self.devices: dict[str, PhoneChatDevice] = {}
        self.jobs: dict[str, PhoneChatJob] = {}
        self.tombstones: dict[str, PhoneChatTombstone] = {}
        import asyncio
        self._lock = asyncio.Lock()

    async def create_device(self, value: PhoneChatDevice) -> PhoneChatDevice:
        async with self._lock:
            self.devices[value.id] = replace(value)
            return replace(value)

    async def get_device(self, device_id: str) -> PhoneChatDevice | None:
        value = self.devices.get(device_id)
        return replace(value) if value else None

    async def revoke_device(self, owner_id: str, device_id: str, now: datetime) -> bool:
        async with self._lock:
            device = self.devices.get(device_id)
            if not device or device.owner_id != owner_id:
                return False
            device.revoked_at = device.revoked_at or now
            for job in self.jobs.values():
                if job.device_id == device_id and job.status in {"queued", "claimed", "processing"}:
                    job.status, job.error_code, job.completed_at = "failed", "device_revoked", now
                    job.text = ""
                    job.audio_data = None
                    job.audio_mime_type = None
                    job.lease_id = job.lease_expires_at = None
            return True

    async def create_job(self, value: PhoneChatJob) -> PhoneChatJob:
        async with self._lock:
            if value.message_id in self.jobs or value.message_id in self.tombstones:
                raise ValueError("duplicate message ID")
            self.jobs[value.message_id] = replace(value)
            return replace(value)

    async def get_job(self, message_id: str) -> PhoneChatJob | None:
        value = self.jobs.get(message_id)
        return replace(value) if value else None

    async def get_tombstone(self, message_id: str) -> PhoneChatTombstone | None:
        value = self.tombstones.get(message_id)
        return replace(value) if value else None

    async def update_job(self, message_id: str, expected: dict[str, Any], changes: dict[str, Any]) -> bool:
        async with self._lock:
            job = self.jobs.get(message_id)
            if not job or any(getattr(job, key) != value for key, value in expected.items()):
                return False
            for key, value in changes.items():
                setattr(job, key, value)
            return True

    async def list_jobs(self) -> list[PhoneChatJob]:
        return [replace(value) for value in self.jobs.values()]

    async def create_tombstone(self, value: PhoneChatTombstone) -> PhoneChatTombstone:
        async with self._lock:
            current = self.tombstones.get(value.message_id)
            if current:
                return replace(current)
            self.tombstones[value.message_id] = replace(value)
            return replace(value)

    async def delete_job(self, message_id: str) -> None:
        async with self._lock:
            self.jobs.pop(message_id, None)

    async def cleanup(self, now: datetime) -> None:
        async with self._lock:
            for message_id, tombstone in list(self.tombstones.items()):
                if tombstone.expires_at <= now:
                    del self.tombstones[message_id]
            for message_id, job in list(self.jobs.items()):
                if job.expires_at <= now and job.status in {"queued", "claimed", "processing"}:
                    job.status, job.text, job.reply = "expired", "", None
                    job.audio_data = None
                    job.audio_mime_type = None
                    job.error_code, job.completed_at = None, now
                    job.lease_id, job.lease_expires_at = None, None
                if job.completed_at and (job.acknowledged_at or job.completed_at) + timedelta(hours=24) <= now:
                    self.tombstones.setdefault(message_id, PhoneChatTombstone(
                        message_id, job.owner_id, job.device_id, job.status,
                        now + timedelta(hours=24), now,
                    ))
                    del self.jobs[message_id]


class PostgresPhoneChatRepository:
    """Prisma/PostgreSQL adapter. Claims use compare-and-set updates."""

    def __init__(self, database):
        self.db = database

    @staticmethod
    def _updated(result) -> bool:
        return getattr(result, "count", result if isinstance(result, int) else 0) > 0

    @staticmethod
    def _device(row) -> PhoneChatDevice:
        return PhoneChatDevice(row.id, row.ownerId, row.createdAt, row.revokedAt)

    @staticmethod
    def _job(row) -> PhoneChatJob:
        return PhoneChatJob(row.messageId, row.ownerId, row.deviceId, row.sessionId, row.text,
                            row.status, row.attempt, row.expiresAt, row.createdAt, row.leaseId,
                            row.leaseExpiresAt, row.reply, row.errorCode, row.completedAt,
                            row.acknowledgedAt, getattr(row, "audioData", None), getattr(row, "audioMimeType", None))

    @staticmethod
    def _tombstone(row) -> PhoneChatTombstone:
        return PhoneChatTombstone(row.messageId, row.ownerId, row.deviceId, row.status,
                                  row.expiresAt, row.createdAt)

    async def create_device(self, value: PhoneChatDevice) -> PhoneChatDevice:
        row = await self.db.phonechatdevice.create(data={"id": value.id, "ownerId": value.owner_id, "createdAt": value.created_at})
        return self._device(row)

    async def get_device(self, device_id: str) -> PhoneChatDevice | None:
        row = await self.db.phonechatdevice.find_unique(where={"id": device_id})
        return self._device(row) if row else None

    async def revoke_device(self, owner_id: str, device_id: str, now: datetime) -> bool:
        async with self.db.tx() as tx:
            if hasattr(tx, "query_raw"):
                await tx.query_raw('SELECT "id" FROM "User" WHERE "id"=$1 FOR UPDATE', owner_id)
            result = await tx.phonechatdevice.update_many(where={"id": device_id, "ownerId": owner_id, "revokedAt": None}, data={"revokedAt": now})
            if not self._updated(result):
                existing = await tx.phonechatdevice.find_first(where={"id": device_id, "ownerId": owner_id, "revokedAt": {"not": None}})
                if not existing:
                    return False
            if hasattr(tx, "companionpushsubscription"):
                await tx.companionpushsubscription.update_many(
                    where={"ownerId": owner_id, "deviceId": device_id, "revokedAt": None},
                    data={"revokedAt": now},
                )
            await tx.phonechatjob.update_many(where={"deviceId": device_id, "status": {"in": ["queued", "claimed", "processing"]}},
                data={"status": "failed", "errorCode": "device_revoked", "text": "", "completedAt": now,
                      "audioData": None, "audioMimeType": None, "leaseId": None, "leaseExpiresAt": None})
            # Browser sessions are revoked in the same transaction as the phone device.
            # Keep an active lease long enough for the outbound worker to receive Stop;
            # all user content and review material is erased immediately.
            await tx.execute_raw(
                '''UPDATE "BrowserRemoteSession" SET "endedAt"=COALESCE("endedAt",$3)
                   WHERE "ownerId"=$1 AND "sourceDeviceId"=$2 AND "endedAt" IS NULL''', owner_id, device_id, now,
            )
            await tx.execute_raw(
                '''UPDATE "BrowserTask" SET
                     "state"=CASE WHEN "state" IN ('queued','claimed') THEN 'cancelled'::"BrowserRemoteTaskState"
                                   WHEN "state" IN ('running','paused','waiting_for_user') THEN 'stopping'::"BrowserRemoteTaskState"
                                   ELSE "state" END,
                     "cancelRequested"=TRUE,"requestedControl"='stop',
                     "goal"=NULL,"resultJson"=NULL,"terminalReason"='device_revoked',
                     "completedAt"=CASE WHEN "state" IN ('queued','claimed') THEN $3 ELSE "completedAt" END,
                     "claimTokenHash"=CASE WHEN "state" IN ('queued','claimed') THEN NULL ELSE "claimTokenHash" END,
                     "leaseExpiresAt"=CASE WHEN "state" IN ('queued','claimed') THEN NULL ELSE "leaseExpiresAt" END
                   WHERE "sessionId" IN (SELECT "id" FROM "BrowserRemoteSession" WHERE "ownerId"=$1 AND "sourceDeviceId"=$2)
                     AND "state" IN ('queued','claimed','running','paused','waiting_for_user','stopping')''',
                owner_id, device_id, now,
            )
            await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "goal"=NULL,"resultJson"=NULL,"currentProposalId"=NULL,"waitingForUserType"=NULL
                   WHERE "sessionId" IN (SELECT "id" FROM "BrowserRemoteSession" WHERE "ownerId"=$1 AND "sourceDeviceId"=$2)''', owner_id, device_id,
            )
            await tx.execute_raw(
                '''DELETE FROM "BrowserTaskEvent" WHERE "taskId" IN
                   (SELECT t."id" FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                    WHERE s."ownerId"=$1 AND s."sourceDeviceId"=$2)''', owner_id, device_id,
            )
            await tx.execute_raw(
                '''DELETE FROM "BrowserTaskReconciliation" WHERE "taskId" IN
                   (SELECT t."id" FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                    WHERE s."ownerId"=$1 AND s."sourceDeviceId"=$2)''', owner_id, device_id,
            )
            await tx.execute_raw(
                '''UPDATE "BrowserActionReview" SET "proposalJson"=NULL,"decision"=NULL WHERE "taskId" IN
                   (SELECT t."id" FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                    WHERE s."ownerId"=$1 AND s."sourceDeviceId"=$2)''', owner_id, device_id,
            )
            await tx.execute_raw(
                '''UPDATE "BrowserReviewAccess" SET "revokedAt"=COALESCE("revokedAt",$3) WHERE "taskId" IN
                   (SELECT t."id" FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                    WHERE s."ownerId"=$1 AND s."sourceDeviceId"=$2)''', owner_id, device_id, now,
            )
        return True

    async def create_job(self, value: PhoneChatJob) -> PhoneChatJob:
        row = await self.db.phonechatjob.create(data={"messageId": value.message_id, "ownerId": value.owner_id,
            "deviceId": value.device_id, "sessionId": value.session_id, "text": value.text,
            "audioData": value.audio_data, "audioMimeType": value.audio_mime_type,
            "status": value.status, "attempt": value.attempt, "expiresAt": value.expires_at,
            "createdAt": value.created_at})
        return self._job(row)

    async def get_job(self, message_id: str) -> PhoneChatJob | None:
        row = await self.db.phonechatjob.find_unique(where={"messageId": message_id})
        return self._job(row) if row else None

    async def get_tombstone(self, message_id: str) -> PhoneChatTombstone | None:
        row = await self.db.phonechattombstone.find_unique(where={"messageId": message_id})
        return self._tombstone(row) if row else None

    _FIELD_MAP = {
        "message_id": "messageId",
        "owner_id": "ownerId",
        "device_id": "deviceId",
        "session_id": "sessionId",
        "lease_id": "leaseId",
        "lease_expires_at": "leaseExpiresAt",
        "expires_at": "expiresAt",
        "error_code": "errorCode",
        "created_at": "createdAt",
        "completed_at": "completedAt",
        "acknowledged_at": "acknowledgedAt",
        "audio_data": "audioData",
        "audio_mime_type": "audioMimeType",
    }

    @classmethod
    def _to_prisma_fields(cls, fields: dict[str, Any]) -> dict[str, Any]:
        return {cls._FIELD_MAP.get(k, k): v for k, v in fields.items()}

    async def update_job(self, message_id: str, expected: dict[str, Any], changes: dict[str, Any]) -> bool:
        where: dict[str, Any] = {"messageId": message_id, **self._to_prisma_fields(expected)}
        result = await self.db.phonechatjob.update_many(where=where, data=self._to_prisma_fields(changes))
        return self._updated(result)

    async def list_jobs(self) -> list[PhoneChatJob]:
        return [self._job(row) for row in await self.db.phonechatjob.find_many()]

    async def create_tombstone(self, value: PhoneChatTombstone) -> PhoneChatTombstone:
        row = await self.db.phonechattombstone.upsert(
            where={"messageId": value.message_id},
            data={"create": {"messageId": value.message_id, "ownerId": value.owner_id, "deviceId": value.device_id,
                              "status": value.status, "expiresAt": value.expires_at, "createdAt": value.created_at},
                  "update": {}},
        )
        return self._tombstone(row)

    async def delete_job(self, message_id: str) -> None:
        await self.db.phonechatjob.delete_many(where={"messageId": message_id})

    async def cleanup(self, now: datetime) -> None:
        await self.db.phonechattombstone.delete_many(where={"expiresAt": {"lte": now}})
        await self.db.phonechatjob.update_many(where={"status": {"in": ["queued", "claimed", "processing"]}, "expiresAt": {"lte": now}},
            data={"status": "expired", "text": "", "reply": None, "audioData": None, "audioMimeType": None,
                  "leaseId": None, "leaseExpiresAt": None, "completedAt": now})
        rows = await self.db.phonechatjob.find_many(where={"completedAt": {"lte": now - timedelta(hours=24)}})
        for row in rows:
            tombstone = PhoneChatTombstone(row.messageId, row.ownerId, row.deviceId, row.status,
                                           now + timedelta(hours=24), now)
            async with self.db.tx() as tx:
                await tx.phonechattombstone.upsert(where={"messageId": row.messageId}, data={
                    "create": {"messageId": row.messageId, "ownerId": row.ownerId, "deviceId": row.deviceId,
                               "status": row.status, "expiresAt": tombstone.expires_at}, "update": {}})
                await tx.phonechatjob.delete_many(where={"messageId": row.messageId})
