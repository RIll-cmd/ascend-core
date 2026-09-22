"""Status derivation and producer identity rules for the shelf."""

from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from schemas.service_status import SafeActivity, SafeIssue, SafeProvider, ServiceStatusEvent, ShelfServiceStatus, StatusShelfResponse
from services.status_repository import ActiveOperation, PostgresStatusRepository, ProducerCredential, ShelfReadCredential, StoredStatus, hash_secret, verify_secret

DEFAULT_STALE_AFTER_SECONDS = 30
STUCK_AFTER_SECONDS = 90


@dataclass
class IngestResult:
    status: StoredStatus
    duplicate: bool = False
    out_of_order: bool = False


def _now() -> datetime:
    return datetime.now(timezone.utc)


class StatusService:
    def __init__(self, repository):
        self.repository = repository

    async def ingest_event(self, event: ServiceStatusEvent, *, received_at: datetime | None = None) -> IngestResult:
        now = received_at or _now()
        current = await self.repository.get_status(event.service_id, event.instance_id)
        event_id = str(event.event_id)
        if current and current.last_event_id == event_id:
            return IngestResult(current, duplicate=True)
        if current and event.sequence is not None and current.last_sequence is not None and event.sequence <= current.last_sequence:
            return IngestResult(current, out_of_order=True)
        status = StoredStatus(
            service_id=event.service_id, instance_id=event.instance_id, service_type=event.service_type,
            state=event.state, state_since=event.state_since, reported_at=event.reported_at,
            received_at=now, last_heartbeat_at=now, stale_after_seconds=DEFAULT_STALE_AFTER_SECONDS,
            last_event_id=event_id, last_sequence=event.sequence if event.sequence is not None else (current.last_sequence if current else None),
            activity=event.activity.model_dump(mode="json", by_alias=True) if event.activity else None,
            issue=event.issue.model_dump(by_alias=True) if event.issue else None,
            provider=event.provider.model_dump(by_alias=True) if event.provider else None,
            capabilities=event.capabilities, metadata=event.metadata,
        )
        return IngestResult(await self.repository.upsert_status(status))

    async def _require_status(self, service_id: str, instance_id: str, service_type: str, now: datetime) -> StoredStatus:
        current = await self.repository.get_status(service_id, instance_id)
        if current:
            return current
        return StoredStatus(service_id, instance_id, service_type, "idle", now, now, now, now, DEFAULT_STALE_AFTER_SECONDS, capabilities=[], metadata={})

    async def start_operation(self, service_id: str, instance_id: str, service_type: str, operation_id: str, *, label: str | None = None, now: datetime | None = None) -> StoredStatus:
        now = now or _now()
        await self.repository.create_operation(ActiveOperation(service_id, instance_id, operation_id, service_type, now, now, label))
        status = await self._require_status(service_id, instance_id, service_type, now)
        active_count = len(await self.repository.list_operations(service_id, instance_id))
        status.state, status.state_since, status.reported_at, status.received_at, status.last_heartbeat_at = "working", now, now, now, now
        status.activity = {"kind": "operation", "label": label, "startedAt": now.isoformat()} if label else {"kind": "operation", "startedAt": now.isoformat()}
        status.metadata = {**(status.metadata or {}), "activeOperationCount": active_count}
        return await self.repository.upsert_status(status)

    async def touch_operation(self, service_id: str, instance_id: str, operation_id: str, *, now: datetime | None = None) -> None:
        await self.repository.touch_operation(service_id, instance_id, operation_id, now or _now())

    async def finish_operation(self, service_id: str, instance_id: str, operation_id: str, *, now: datetime | None = None) -> StoredStatus:
        now = now or _now()
        status = await self._require_status(service_id, instance_id, "agent", now)
        await self.repository.delete_operation(service_id, instance_id, operation_id)
        active_count = len(await self.repository.list_operations(service_id, instance_id))
        status.state = "idle" if active_count == 0 else "working"
        status.state_since = now
        status.reported_at = status.received_at = status.last_heartbeat_at = now
        status.activity = None if active_count == 0 else status.activity
        status.metadata = {**(status.metadata or {}), "activeOperationCount": active_count}
        return await self.repository.upsert_status(status)

    async def record_heartbeat(self, service_id: str, instance_id: str, *, now: datetime | None = None) -> StoredStatus | None:
        now = now or _now()
        status = await self.repository.get_status(service_id, instance_id)
        if not status:
            return None
        status.received_at = status.last_heartbeat_at = now
        return await self.repository.upsert_status(status)

    async def sweep(self, *, now: datetime | None = None) -> None:
        now = now or _now()
        for operation in await self.repository.list_all_operations():
            if now - operation.last_progress_at < timedelta(seconds=STUCK_AFTER_SECONDS):
                continue
            status = await self.repository.get_status(operation.service_id, operation.instance_id)
            if not status or not status.last_heartbeat_at or now - status.last_heartbeat_at >= timedelta(seconds=status.stale_after_seconds):
                continue
            status.state, status.state_since, status.reported_at, status.received_at = "stuck", now, now, now
            status.issue = {"code": "no_progress", "message": "Active operation has not reported progress.", "retryable": True}
            status.metadata = {**(status.metadata or {}), "activeOperationCount": len(await self.repository.list_operations(operation.service_id, operation.instance_id))}
            await self.repository.upsert_status(status)

    async def shelf(self, *, now: datetime | None = None) -> StatusShelfResponse:
        now = now or _now()
        services = []
        for status in await self.repository.list_statuses():
            state = status.state
            if not status.last_heartbeat_at or now - status.last_heartbeat_at >= timedelta(seconds=status.stale_after_seconds):
                state = "offline"
            services.append(ShelfServiceStatus(
                serviceId=status.service_id, instanceId=status.instance_id, serviceType=status.service_type, state=state,
                stateSince=status.state_since, lastHeartbeatAt=status.last_heartbeat_at,
                staleAfterSeconds=status.stale_after_seconds,
                activity=SafeActivity.model_validate(status.activity) if status.activity else None,
                issue=SafeIssue.model_validate(status.issue) if status.issue else None,
                provider=SafeProvider.model_validate(status.provider) if status.provider else None,
                capabilities=status.capabilities or [], metadata=status.metadata or {},
            ))
        return StatusShelfResponse(schemaVersion=1, generatedAt=now, services=services)

    async def provision_producer_credential(self, *, credential_id: str, service_id: str, instance_id: str) -> str:
        if await self.repository.get_active_credential(service_id, instance_id):
            raise ValueError("An active credential already exists for this service instance; use rotate or revoke it first.")
        raw_secret = secrets.token_urlsafe(32)
        await self.repository.save_credential(ProducerCredential(credential_id, service_id, instance_id, hash_secret(raw_secret)))
        return raw_secret

    async def revoke_producer_credential(self, credential_id: str, *, now: datetime | None = None) -> None:
        await self.repository.revoke_credential(credential_id, now or _now())

    async def list_producer_credentials(self) -> list[ProducerCredential]:
        return await self.repository.list_credentials()

    async def rotate_producer_credential(self, *, service_id: str, instance_id: str) -> tuple[str, str]:
        previous = await self.repository.get_active_credential(service_id, instance_id)
        if not previous:
            raise ValueError("No active credential exists for this service instance; use create instead.")
        # The nullable unique activeKey allows only one active producer per
        # instance. Revoke first so a failed create never leaves two active keys.
        await self.revoke_producer_credential(previous.credential_id)
        credential_id = f"{service_id}-{instance_id}-{secrets.token_hex(6)}"[:128]
        secret = await self.provision_producer_credential(credential_id=credential_id, service_id=service_id, instance_id=instance_id)
        return credential_id, secret

    async def authenticate_producer(self, credential: str) -> ProducerCredential:
        try:
            credential_id, raw_secret = credential.split(".", 1)
        except ValueError as error:
            raise PermissionError("Invalid or revoked producer credential") from error
        stored = await self.repository.get_credential(credential_id)
        if not stored or stored.revoked_at or not verify_secret(raw_secret, stored.secret_hash):
            raise PermissionError("Invalid or revoked producer credential")
        return stored

    async def provision_shelf_read_credential(self, *, credential_id: str) -> str:
        if await self.repository.get_active_shelf_read_credential():
            raise ValueError("An active Shelf read credential already exists; revoke it before creating another.")
        raw_secret = secrets.token_urlsafe(32)
        await self.repository.save_shelf_read_credential(ShelfReadCredential(credential_id, hash_secret(raw_secret)))
        return raw_secret

    async def authenticate_shelf_reader(self, credential: str) -> ShelfReadCredential:
        try:
            credential_id, raw_secret = credential.split(".", 1)
        except ValueError as error:
            raise PermissionError("Invalid or revoked Shelf read credential") from error
        stored = await self.repository.get_shelf_read_credential(credential_id)
        if not stored or stored.revoked_at or not verify_secret(raw_secret, stored.secret_hash):
            raise PermissionError("Invalid or revoked Shelf read credential")
        return stored

    async def list_shelf_read_credentials(self) -> list[ShelfReadCredential]:
        return await self.repository.list_shelf_read_credentials()

    async def revoke_shelf_read_credential(self, credential_id: str, *, now: datetime | None = None) -> None:
        await self.repository.revoke_shelf_read_credential(credential_id, now or _now())

    @staticmethod
    def assert_producer_owns_event(producer: ProducerCredential, service_id: str, instance_id: str) -> None:
        if not secrets.compare_digest(producer.service_id, service_id) or not secrets.compare_digest(producer.instance_id, instance_id):
            raise PermissionError("Producer credential is bound to a different service instance")


def get_status_service() -> StatusService:
    from db import db
    return StatusService(PostgresStatusRepository(db))
