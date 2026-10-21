"""Status derivation and producer identity rules for the shelf."""

from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from schemas.service_status import CompletionSummary, SafeActivity, SafeIssue, SafeProvider, ServiceStatusEvent, ShelfServiceStatus, StatusShelfResponse, issue_for_shelf
from services.status_repository import ActiveOperation, PostgresStatusRepository, ProducerCredential, ShelfReadCredential, StoredStatus, hash_secret, verify_secret

DEFAULT_STALE_AFTER_SECONDS = 30


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
        event_id = str(event.event_id)
        status = StoredStatus(
            service_id=event.service_id, instance_id=event.instance_id, service_type=event.service_type,
            state=event.state, state_since=event.state_since, reported_at=event.reported_at,
            received_at=now, last_heartbeat_at=now, stale_after_seconds=DEFAULT_STALE_AFTER_SECONDS,
            last_event_id=event_id, last_sequence=event.sequence,
            activity=event.activity.model_dump(mode="json", by_alias=True) if event.activity else None,
            issue=event.issue.model_dump(by_alias=True) if event.issue else None,
            provider=event.provider.model_dump(by_alias=True) if event.provider else None,
            capabilities=event.capabilities, metadata=event.metadata,
        )
        stored, duplicate, out_of_order = await self.repository.ingest_status_event_atomic(status, event.lifecycle, now)
        return IngestResult(stored, duplicate=duplicate, out_of_order=out_of_order)

    async def start_operation(self, service_id: str, instance_id: str, service_type: str, operation_id: str, *, label: str | None = None, now: datetime | None = None) -> StoredStatus:
        now = now or _now()
        SafeActivity(kind="operation", label=label)
        fallback = StoredStatus(service_id, instance_id, service_type, "idle", now, now, now, now, DEFAULT_STALE_AFTER_SECONDS, capabilities=[], metadata={})
        return await self.repository.start_operation_atomic(ActiveOperation(service_id, instance_id, operation_id, service_type, now, now, label), fallback)

    async def touch_operation(self, service_id: str, instance_id: str, operation_id: str, *, now: datetime | None = None) -> None:
        await self.repository.touch_operation(service_id, instance_id, operation_id, now or _now())

    async def finish_operation(self, service_id: str, instance_id: str, operation_id: str, *, outcome: str, now: datetime | None = None) -> StoredStatus:
        """Complete explicit work with the caller's observed terminal outcome."""
        if outcome not in {"succeeded", "failed", "cancelled"}:
            raise ValueError("Invalid terminal outcome")
        status, _completion = await self.repository.finish_operation_atomic(service_id, instance_id, operation_id, outcome, now or _now())
        return status

    async def record_heartbeat(self, service_id: str, instance_id: str, *, now: datetime | None = None) -> StoredStatus | None:
        now = now or _now()
        return await self.repository.record_heartbeat_atomic(service_id, instance_id, now)

    async def sweep(self, *, now: datetime | None = None) -> None:
        now = now or _now()
        identities = {(operation.service_id, operation.instance_id) for operation in await self.repository.list_all_operations()}
        for service_id, instance_id in identities:
            status = await self.repository.get_status(service_id, instance_id)
            if status:
                await self.repository.mark_stuck_if_needed(service_id, instance_id, now, status.stale_after_seconds)

    async def shelf(self, *, now: datetime | None = None) -> StatusShelfResponse:
        now = now or _now()
        services = []
        for status in await self.repository.list_statuses():
            state = status.state
            if not status.last_heartbeat_at or now - status.last_heartbeat_at >= timedelta(seconds=status.stale_after_seconds):
                state = "offline"
            completions = [
                CompletionSummary(outcome=record.outcome, finishedAt=record.finished_at, label=record.label)
                for record in await self.repository.list_completions(status.service_id, status.instance_id, limit=5)
            ]
            services.append(ShelfServiceStatus(
                serviceId=status.service_id, instanceId=status.instance_id, serviceType=status.service_type, state=state,
                stateSince=status.state_since, lastHeartbeatAt=status.last_heartbeat_at,
                staleAfterSeconds=status.stale_after_seconds,
                activity=SafeActivity.model_validate(status.activity) if status.activity else None,
                issue=issue_for_shelf(status.issue),
                provider=SafeProvider.model_validate(status.provider) if status.provider else None,
                capabilities=status.capabilities or [], metadata=status.metadata or {},
                completions=completions,
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
