"""Lease-based phone-chat queue rules shared by HTTP routes and tests."""
from __future__ import annotations

import secrets
import re
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from schemas.phone_chat import PhoneChatWorkerResult
from services.phone_chat_repository import (
    PhoneChatDevice, PhoneChatJob, PhoneChatTombstone,
)

JOB_TTL = timedelta(hours=24)
TOMBSTONE_TTL = timedelta(hours=24)
LEASE_TTL = timedelta(seconds=60)
MAX_ATTEMPTS = 3
MAX_OWNER_QUEUE = 100


def _now() -> datetime:
    return datetime.now(timezone.utc)


class PhoneChatQueue:
    def __init__(self, repository, *, owner_id: str | None, worker_token: str | None):
        self.repository = repository
        self.owner_id = owner_id.strip() if owner_id and owner_id.strip() else None
        self.worker_token = worker_token or ""

    def _require_owner(self, owner_id: str) -> None:
        if not self.owner_id or not secrets.compare_digest(owner_id, self.owner_id):
            raise PermissionError("Phone chat is not configured for this account")

    def _require_worker(self, credential: str) -> None:
        if not self.worker_token or not secrets.compare_digest(credential or "", self.worker_token):
            raise PermissionError("Invalid phone worker credential")

    async def register_device(self, owner_id: str, *, now: datetime | None = None) -> PhoneChatDevice:
        self._require_owner(owner_id)
        now = now or _now()
        return await self.repository.create_device(PhoneChatDevice(str(uuid4()), owner_id, now))

    async def revoke_device(self, owner_id: str, device_id: str, *, now: datetime | None = None) -> bool:
        self._require_owner(owner_id)
        return await self.repository.revoke_device(owner_id, device_id, now or _now())

    async def _active_device(self, owner_id: str, device_id: str) -> PhoneChatDevice:
        self._require_owner(owner_id)
        device = await self.repository.get_device(device_id)
        if not device or device.owner_id != owner_id:
            raise PermissionError("Device is not owned by this account")
        if device.revoked_at:
            raise PermissionError("Device has been revoked")
        return device

    async def enqueue(self, owner_id: str, device_id: str, message_id: str, session_id: str, text: str,
                      *, now: datetime | None = None) -> PhoneChatJob:
        device = await self._active_device(owner_id, device_id)
        try:
            message_id = str(UUID(message_id))
        except (ValueError, TypeError, AttributeError) as error:
            raise ValueError("Invalid message ID") from error
        if not isinstance(session_id, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", session_id):
            raise ValueError("Invalid session ID")
        if not text or not text.strip() or len(text) > 4_000:
            raise ValueError("Message text must be nonblank and at most 4000 characters")
        now = now or _now()
        await self.repository.cleanup(now)
        existing = await self.repository.get_job(message_id)
        if existing:
            if (existing.owner_id, existing.device_id, existing.session_id, existing.text) != (owner_id, device.id, session_id, text):
                raise ValueError("Message ID was already used with a different payload")
            return existing
        tombstone = await self.repository.get_tombstone(message_id)
        if tombstone:
            if (tombstone.owner_id, tombstone.device_id) != (owner_id, device.id):
                raise PermissionError("Message is not available to this device")
            raise ValueError("Message ID was already acknowledged")
        jobs = await self.repository.list_jobs()
        active_count = sum(job.owner_id == owner_id and job.status in {"queued", "claimed", "processing"} for job in jobs)
        if active_count >= MAX_OWNER_QUEUE:
            raise OverflowError("Phone chat queue is full")
        value = PhoneChatJob(message_id, owner_id, device_id, session_id, text, "queued", 0,
                             now + JOB_TTL, now)
        try:
            return await self.repository.create_job(value)
        except Exception:
            existing = await self.repository.get_job(message_id)
            if existing and (existing.owner_id, existing.device_id, existing.session_id, existing.text) == (owner_id, device_id, session_id, text):
                return existing
            raise ValueError("Message ID was already used with a different payload")

    async def claim(self, credential: str, *, now: datetime | None = None) -> PhoneChatJob | None:
        self._require_worker(credential)
        if not self.owner_id:
            raise PermissionError("Phone chat owner is not configured")
        now = now or _now()
        await self.repository.cleanup(now)
        jobs = sorted(await self.repository.list_jobs(), key=lambda job: (job.created_at, job.message_id))
        for job in jobs:
            if job.status not in {"queued", "claimed", "processing"}:
                continue
            if job.expires_at <= now:
                await self.repository.update_job(job.message_id, {"status": job.status}, {
                    "status": "expired", "text": "", "lease_id": None, "lease_expires_at": None,
                    "completed_at": now,
                })
                continue
            reclaimable = job.status == "queued" or (job.lease_expires_at is not None and job.lease_expires_at <= now)
            if not reclaimable:
                continue
            if job.attempt >= MAX_ATTEMPTS:
                await self.repository.update_job(job.message_id, {
                    "status": job.status, "lease_id": job.lease_id, "lease_expires_at": job.lease_expires_at,
                }, {"status": "failed", "error_code": "attempts_exhausted", "completed_at": now,
                    "lease_id": None, "lease_expires_at": None})
                continue
            lease_id = secrets.token_urlsafe(24)
            lease_expires_at = now + LEASE_TTL
            won = await self.repository.update_job(job.message_id, {
                "status": job.status, "lease_id": job.lease_id, "lease_expires_at": job.lease_expires_at,
                "attempt": job.attempt,
            }, {"status": "claimed", "attempt": job.attempt + 1, "lease_id": lease_id,
                "lease_expires_at": lease_expires_at})
            if won:
                return await self.repository.get_job(job.message_id)
        return None

    async def start(self, credential: str, message_id: str, lease_id: str, *, now: datetime | None = None) -> bool:
        self._require_worker(credential)
        now = now or _now()
        job = await self.repository.get_job(message_id)
        if not job:
            return False
        if job.expires_at <= now and job.status in {"claimed", "processing"} and job.lease_id == lease_id:
            await self.repository.update_job(message_id, {
                "status": job.status, "lease_id": lease_id, "lease_expires_at": job.lease_expires_at,
            }, {"status": "expired", "text": "", "reply": None, "error_code": None,
                "completed_at": now, "lease_id": None, "lease_expires_at": None})
            return False
        if job.status == "processing" and job.lease_id == lease_id and job.lease_expires_at and job.lease_expires_at > now:
            return True
        if job.status != "claimed" or job.lease_id != lease_id or not job.lease_expires_at or job.lease_expires_at <= now:
            return False
        return await self.repository.update_job(message_id, {
            "status": "claimed", "lease_id": lease_id, "lease_expires_at": job.lease_expires_at,
        }, {"status": "processing"})

    async def renew(self, credential: str, message_id: str, lease_id: str, *, now: datetime | None = None) -> bool:
        self._require_worker(credential)
        now = now or _now()
        job = await self.repository.get_job(message_id)
        if not job or job.status not in {"claimed", "processing"} or job.lease_id != lease_id:
            return False
        if not job.lease_expires_at or job.lease_expires_at <= now or job.expires_at <= now:
            return False
        return await self.repository.update_job(message_id, {
            "status": job.status, "lease_id": lease_id, "lease_expires_at": job.lease_expires_at,
        }, {"lease_expires_at": now + LEASE_TTL})

    async def complete(self, credential: str, message_id: str, lease_id: str, result: PhoneChatWorkerResult,
                       *, now: datetime | None = None) -> PhoneChatJob:
        self._require_worker(credential)
        now = now or _now()
        job = await self.repository.get_job(message_id)
        if not job:
            raise LookupError("Phone chat job not found")
        if job.expires_at <= now and job.status in {"claimed", "processing"} and job.lease_id == lease_id:
            expired = await self.repository.update_job(message_id, {
                "status": job.status, "lease_id": lease_id, "lease_expires_at": job.lease_expires_at,
            }, {"status": "expired", "text": "", "reply": None, "error_code": None,
                "completed_at": now, "lease_id": None, "lease_expires_at": None})
            if expired:
                return await self.repository.get_job(message_id)
        if job.status in {"completed", "failed"}:
            if job.reply == result.reply and job.error_code == result.error_code and job.status == result.status:
                return job
            raise PermissionError("Conflicting terminal result")
        if job.status != "processing" or job.lease_id != lease_id or not job.lease_expires_at or job.lease_expires_at <= now:
            raise PermissionError("Phone chat lease is no longer active")
        changes = {"status": result.status, "reply": result.reply, "error_code": result.error_code,
                   "completed_at": now, "lease_id": None, "lease_expires_at": None}
        won = await self.repository.update_job(message_id, {
            "status": "processing", "lease_id": lease_id, "lease_expires_at": job.lease_expires_at,
        }, changes)
        if not won:
            latest = await self.repository.get_job(message_id)
            if latest and latest.status == result.status and latest.reply == result.reply and latest.error_code == result.error_code:
                return latest
            raise PermissionError("Phone chat lease changed")
        return await self.repository.get_job(message_id)

    async def get_for_device(self, owner_id: str, device_id: str, message_id: str) -> PhoneChatJob | PhoneChatTombstone:
        await self._active_device(owner_id, device_id)
        await self.repository.cleanup(_now())
        job = await self.repository.get_job(message_id)
        if job:
            if job.owner_id != owner_id or job.device_id != device_id:
                raise PermissionError("Message is not available to this device")
            return job
        tombstone = await self.repository.get_tombstone(message_id)
        if tombstone and (tombstone.owner_id, tombstone.device_id) == (owner_id, device_id):
            return tombstone
        raise LookupError("Phone chat message not found")

    async def acknowledge(self, owner_id: str, device_id: str, message_id: str, *, now: datetime | None = None) -> PhoneChatTombstone:
        await self._active_device(owner_id, device_id)
        now = now or _now()
        existing = await self.repository.get_tombstone(message_id)
        if existing:
            if (existing.owner_id, existing.device_id) != (owner_id, device_id):
                raise PermissionError("Message is not available to this device")
            return existing
        job = await self.repository.get_job(message_id)
        if not job or (job.owner_id, job.device_id) != (owner_id, device_id):
            raise LookupError("Phone chat message not found")
        if job.status not in {"completed", "failed", "expired"}:
            raise ValueError("Only terminal messages can be acknowledged")
        tombstone = await self.repository.create_tombstone(PhoneChatTombstone(
            message_id, owner_id, device_id, job.status, now + TOMBSTONE_TTL, now,
        ))
        await self.repository.delete_job(message_id)
        return tombstone
