"""Durable storage boundary for the status shelf.

`StatusActiveOperation` is deliberately a live-work table, not event history.
It is the shared replacement for process-local active-operation counters.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import json
import secrets
from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from typing import Any


OPERATION_STUCK_SECONDS = 90


@dataclass
class StoredStatus:
    service_id: str
    instance_id: str
    service_type: str
    state: str
    state_since: datetime
    reported_at: datetime
    received_at: datetime
    last_heartbeat_at: datetime | None
    stale_after_seconds: int
    last_event_id: str | None = None
    last_sequence: int | None = None
    activity: dict[str, Any] | None = None
    issue: dict[str, Any] | None = None
    provider: dict[str, Any] | None = None
    capabilities: list[str] | None = None
    metadata: dict[str, Any] | None = None


@dataclass
class ActiveOperation:
    service_id: str
    instance_id: str
    operation_id: str
    service_type: str
    started_at: datetime
    last_progress_at: datetime
    label: str | None = None


@dataclass
class OperationCompletion:
    service_id: str
    instance_id: str
    operation_id: str
    outcome: str
    started_at: datetime
    finished_at: datetime
    label: str | None = None


def _finished_status(status: StoredStatus, remaining: list[ActiveOperation], now: datetime) -> StoredStatus:
    status.state = "idle" if not remaining else (
        "stuck" if any(now - operation.last_progress_at >= timedelta(seconds=OPERATION_STUCK_SECONDS)
                       for operation in remaining) else "working"
    )
    status.state_since = now
    status.reported_at = status.received_at = status.last_heartbeat_at = now
    if not remaining:
        status.activity = None
    else:
        active = max(remaining, key=lambda operation: (operation.started_at, operation.operation_id))
        status.activity = {"kind": "operation", "startedAt": active.started_at.isoformat()}
        if active.label:
            status.activity["label"] = active.label
    if (status.issue or {}).get("code") == "needs_input":
        # Needs-input belongs to the operation that just left the active set.
        status.issue = None
    status.metadata = {**(status.metadata or {}), "activeOperationCount": len(remaining)}
    if status.state != "stuck" and (status.issue or {}).get("code") == "no_progress":
        status.issue = None
    return status


def _progress_status(status: StoredStatus, operations: list[ActiveOperation], now: datetime) -> StoredStatus:
    status.state = "stuck" if any(now - operation.last_progress_at >= timedelta(seconds=OPERATION_STUCK_SECONDS) for operation in operations) else "working"
    status.state_since = now
    status.reported_at = status.received_at = status.last_heartbeat_at = now
    active = max(operations, key=lambda operation: (operation.started_at, operation.operation_id))
    status.activity = {"kind": "operation", "startedAt": active.started_at.isoformat()}
    if active.label:
        status.activity["label"] = active.label
    status.metadata = {**(status.metadata or {}), "activeOperationCount": len(operations)}
    if status.state == "stuck":
        status.issue = {"code": "no_progress", "message": "Active operation has not reported progress.", "retryable": True}
    elif (status.issue or {}).get("code") == "no_progress":
        status.issue = None
    return status


def _event_status_with_active_work(derived: StoredStatus, incoming: StoredStatus, current: StoredStatus | None, now: datetime) -> StoredStatus:
    derived.service_type = incoming.service_type
    derived.reported_at = incoming.reported_at
    derived.received_at = derived.last_heartbeat_at = now
    derived.last_event_id = incoming.last_event_id
    derived.last_sequence = incoming.last_sequence if incoming.last_sequence is not None else (current.last_sequence if current else None)
    derived.provider = incoming.provider
    derived.capabilities = incoming.capabilities
    active_count = (derived.metadata or {}).get("activeOperationCount", 0)
    derived.metadata = {**(incoming.metadata or {}), "activeOperationCount": active_count}
    if incoming.issue and incoming.issue.get("code") != "no_progress":
        derived.issue = incoming.issue
    elif (derived.issue or {}).get("code") == "needs_input":
        # A producer must keep explicitly reporting the decision request.
        derived.issue = None
    elif derived.state != "stuck" and (derived.issue or {}).get("code") == "no_progress":
        derived.issue = current.issue if current and (current.issue or {}).get("code") != "no_progress" else None
    return derived


@dataclass
class ProducerCredential:
    credential_id: str
    service_id: str
    instance_id: str
    secret_hash: str
    revoked_at: datetime | None = None
    created_at: datetime | None = None


@dataclass
class ShelfReadCredential:
    credential_id: str
    secret_hash: str
    revoked_at: datetime | None = None
    created_at: datetime | None = None


def hash_secret(secret: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(secret.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return base64.urlsafe_b64encode(salt + digest).decode("ascii")


def verify_secret(secret: str, encoded: str) -> bool:
    try:
        raw = base64.urlsafe_b64decode(encoded.encode("ascii"))
        salt, expected = raw[:16], raw[16:]
        actual = hashlib.scrypt(secret.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
        return secrets.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


class InMemoryStatusRepository:
    """Test double only. Production is wired to `PostgresStatusRepository`."""

    def __init__(self):
        self.statuses: dict[tuple[str, str], StoredStatus] = {}
        self.operations: dict[tuple[str, str, str], ActiveOperation] = {}
        self.completions: dict[tuple[str, str, str], OperationCompletion] = {}
        self._mutation_locks: dict[tuple[str, str], asyncio.Lock] = {}
        self.credentials: dict[str, ProducerCredential] = {}
        self.shelf_read_credentials: dict[str, ShelfReadCredential] = {}

    async def get_status(self, service_id: str, instance_id: str) -> StoredStatus | None:
        value = self.statuses.get((service_id, instance_id))
        return replace(value) if value else None

    async def list_statuses(self) -> list[StoredStatus]:
        return [replace(value) for value in self.statuses.values()]

    async def upsert_status(self, value: StoredStatus) -> StoredStatus:
        self.statuses[(value.service_id, value.instance_id)] = replace(value)
        return replace(value)

    async def ingest_status_event_atomic(self, incoming: StoredStatus, lifecycle, now: datetime) -> tuple[StoredStatus, bool, bool]:
        identity = (incoming.service_id, incoming.instance_id)
        async with self._mutation_locks.setdefault(identity, asyncio.Lock()):
            current = self.statuses.get(identity)
            if current and current.last_event_id == incoming.last_event_id:
                return replace(current), True, False
            if current and incoming.last_sequence is not None and current.last_sequence is not None and incoming.last_sequence <= current.last_sequence:
                return replace(current), False, True
            if current and incoming.last_sequence is None:
                incoming = replace(incoming, last_sequence=current.last_sequence)

            status = replace(incoming)
            if lifecycle:
                operation_id, phase = lifecycle.operation_id, lifecycle.phase
                key = (*identity, operation_id)
                if phase == "started":
                    if key in self.completions:
                        raise ValueError("Operation already completed")
                    operation = self.operations.get(key)
                    if operation is None:
                        operation = ActiveOperation(incoming.service_id, incoming.instance_id, operation_id, incoming.service_type, now, now, lifecycle.label)
                        self.operations[key] = operation
                    active = [replace(value) for op_key, value in self.operations.items() if op_key[:2] == identity]
                    status = _progress_status(replace(current or incoming), active, now)
                elif phase == "progress":
                    operation = self.operations.get(key)
                    if operation is None:
                        raise ValueError("No matching active operation")
                    operation.last_progress_at = now
                    active = [replace(value) for op_key, value in self.operations.items() if op_key[:2] == identity]
                    status = _progress_status(replace(current or incoming), active, now)
                else:
                    outcome = phase
                    completion = self.completions.get(key)
                    operation = self.operations.get(key)
                    if completion is not None:
                        return replace(current or incoming), True, False
                    if completion is None:
                        if operation is None:
                            raise ValueError("No matching active operation")
                        completion = OperationCompletion(incoming.service_id, incoming.instance_id, operation_id, outcome, operation.started_at, now, operation.label)
                        self.completions[key] = completion
                        del self.operations[key]
                    remaining = [replace(value) for op_key, value in self.operations.items() if op_key[:2] == identity]
                    status = _finished_status(replace(current or incoming), remaining, now)
                    retained = sorted((item for item in self.completions if item[:2] == identity), key=lambda item: (self.completions[item].finished_at, item[2]), reverse=True)
                    for old_key in retained[20:]:
                        del self.completions[old_key]
                status = _event_status_with_active_work(status, incoming, current, now)
            else:
                active = [replace(value) for op_key, value in self.operations.items() if op_key[:2] == identity]
                if active:
                    status = _event_status_with_active_work(_progress_status(replace(current or incoming), active, now), incoming, current, now)

            return await self.upsert_status(status), False, False

    async def create_operation(self, operation: ActiveOperation) -> None:
        self.operations[(operation.service_id, operation.instance_id, operation.operation_id)] = replace(operation)

    async def start_operation_atomic(self, operation: ActiveOperation, fallback: StoredStatus) -> StoredStatus:
        identity = (operation.service_id, operation.instance_id)
        async with self._mutation_locks.setdefault(identity, asyncio.Lock()):
            key = (*identity, operation.operation_id)
            if key in self.completions:
                raise ValueError("Operation already completed")
            active = self.operations.get(key)
            if active is not None:
                current = self.statuses.get(identity)
                if current:
                    return replace(current)
            else:
                active = replace(operation)
                self.operations[key] = active
            operations = [replace(value) for operation_key, value in self.operations.items() if operation_key[:2] == identity]
            status = _progress_status(replace(self.statuses.get(identity, fallback)), operations, operation.started_at)
            return await self.upsert_status(status)

    async def record_heartbeat_atomic(self, service_id: str, instance_id: str, now: datetime) -> StoredStatus | None:
        identity = (service_id, instance_id)
        async with self._mutation_locks.setdefault(identity, asyncio.Lock()):
            status = self.statuses.get(identity)
            if not status:
                return None
            status = replace(status)
            status.received_at = status.last_heartbeat_at = now
            return await self.upsert_status(status)

    async def mark_stuck_if_needed(self, service_id: str, instance_id: str, now: datetime, stale_after_seconds: int) -> StoredStatus | None:
        identity = (service_id, instance_id)
        async with self._mutation_locks.setdefault(identity, asyncio.Lock()):
            operations = [value for key, value in self.operations.items() if key[:2] == identity]
            status = self.statuses.get(identity)
            if (not status or not operations or not status.last_heartbeat_at
                    or now - status.last_heartbeat_at >= timedelta(seconds=stale_after_seconds)
                    or not any(now - item.last_progress_at >= timedelta(seconds=OPERATION_STUCK_SECONDS) for item in operations)):
                return None
            status = replace(status)
            status.state, status.state_since, status.reported_at, status.received_at = "stuck", now, now, now
            status.issue = {"code": "no_progress", "message": "Active operation has not reported progress.", "retryable": True}
            status.metadata = {**(status.metadata or {}), "activeOperationCount": len(operations)}
            return await self.upsert_status(status)

    async def finish_operation_atomic(self, service_id: str, instance_id: str, operation_id: str, outcome: str, now: datetime) -> tuple[StoredStatus, OperationCompletion]:
        identity = (service_id, instance_id)
        key = (*identity, operation_id)
        async with self._mutation_locks.setdefault(identity, asyncio.Lock()):
            existing = self.completions.get(key)
            if existing:
                return replace(self.statuses[identity]), replace(existing)
            operation = self.operations.get(key)
            if not operation:
                raise ValueError("No matching active operation")
            completion = OperationCompletion(service_id, instance_id, operation_id, outcome, operation.started_at, now, operation.label)
            self.completions[key] = completion
            del self.operations[key]
            remaining = [replace(value) for operation_key, value in self.operations.items() if operation_key[:2] == identity]
            status = _finished_status(replace(self.statuses[identity]), remaining, now)
            await self.upsert_status(status)
            retained = sorted((key for key, value in self.completions.items() if key[:2] == identity), key=lambda key: (self.completions[key].finished_at, key[2]), reverse=True)
            for old_key in retained[20:]:
                del self.completions[old_key]
            return replace(status), replace(completion)

    async def list_completions(self, service_id: str, instance_id: str, *, limit: int = 5) -> list[OperationCompletion]:
        values = [replace(value) for key, value in self.completions.items() if key[:2] == (service_id, instance_id)]
        return sorted(values, key=lambda value: (value.finished_at, value.operation_id), reverse=True)[:limit]

    async def touch_operation(self, service_id: str, instance_id: str, operation_id: str, now: datetime) -> None:
        identity = (service_id, instance_id)
        async with self._mutation_locks.setdefault(identity, asyncio.Lock()):
            key = (*identity, operation_id)
            operation = self.operations.get(key)
            status = self.statuses.get(identity)
            if not operation or not status:
                return
            operation.last_progress_at = now
            remaining = [replace(value) for current_key, value in self.operations.items() if current_key[:2] == identity]
            await self.upsert_status(_progress_status(replace(status), remaining, now))

    async def delete_operation(self, service_id: str, instance_id: str, operation_id: str) -> None:
        self.operations.pop((service_id, instance_id, operation_id), None)

    async def list_operations(self, service_id: str, instance_id: str) -> list[ActiveOperation]:
        return [replace(value) for key, value in self.operations.items() if key[:2] == (service_id, instance_id)]

    async def list_all_operations(self) -> list[ActiveOperation]:
        return [replace(value) for value in self.operations.values()]

    async def save_credential(self, credential: ProducerCredential) -> None:
        if credential.created_at is None:
            credential.created_at = datetime.now().astimezone()
        self.credentials[credential.credential_id] = replace(credential)

    async def get_credential(self, credential_id: str) -> ProducerCredential | None:
        value = self.credentials.get(credential_id)
        return replace(value) if value else None

    async def get_active_credential(self, service_id: str, instance_id: str) -> ProducerCredential | None:
        return next((replace(value) for value in self.credentials.values() if value.service_id == service_id and value.instance_id == instance_id and value.revoked_at is None), None)

    async def list_credentials(self) -> list[ProducerCredential]:
        return [replace(value) for value in self.credentials.values()]

    async def revoke_credential(self, credential_id: str, now: datetime) -> None:
        if credential_id in self.credentials:
            self.credentials[credential_id].revoked_at = now

    async def save_shelf_read_credential(self, credential: ShelfReadCredential) -> None:
        if credential.created_at is None:
            credential.created_at = datetime.now().astimezone()
        self.shelf_read_credentials[credential.credential_id] = replace(credential)

    async def get_shelf_read_credential(self, credential_id: str) -> ShelfReadCredential | None:
        value = self.shelf_read_credentials.get(credential_id)
        return replace(value) if value else None

    async def get_active_shelf_read_credential(self) -> ShelfReadCredential | None:
        return next((replace(value) for value in self.shelf_read_credentials.values() if value.revoked_at is None), None)

    async def list_shelf_read_credentials(self) -> list[ShelfReadCredential]:
        return [replace(value) for value in self.shelf_read_credentials.values()]

    async def revoke_shelf_read_credential(self, credential_id: str, now: datetime) -> None:
        if credential_id in self.shelf_read_credentials:
            self.shelf_read_credentials[credential_id].revoked_at = now


class PostgresStatusRepository:
    """Prisma/Postgres implementation; no status data is held in process memory."""

    def __init__(self, database):
        self.db = database

    @staticmethod
    def _status_from_model(row) -> StoredStatus:
        def decode(value, default):
            return json.loads(value) if value else default
        return StoredStatus(
            service_id=row.serviceId, instance_id=row.instanceId, service_type=row.serviceType,
            state=row.state, state_since=row.stateSince, reported_at=row.reportedAt,
            received_at=row.receivedAt, last_heartbeat_at=row.lastHeartbeatAt,
            stale_after_seconds=row.staleAfterSeconds, last_event_id=row.lastEventId,
            last_sequence=row.lastSequence, activity=decode(row.activityJson, None),
            issue=decode(row.issueJson, None), provider=decode(row.providerJson, None),
            capabilities=decode(row.capabilitiesJson, []), metadata=decode(row.metadataJson, {}),
        )

    async def get_status(self, service_id: str, instance_id: str) -> StoredStatus | None:
        row = await self.db.servicestatus.find_unique(where={"serviceId_instanceId": {"serviceId": service_id, "instanceId": instance_id}})
        return self._status_from_model(row) if row else None

    async def list_statuses(self) -> list[StoredStatus]:
        rows = await self.db.servicestatus.find_many(order={"serviceId": "asc"})
        return [self._status_from_model(row) for row in rows]

    async def upsert_status(self, value: StoredStatus) -> StoredStatus:
        return await self._upsert_status(self.db, value)

    async def _upsert_status(self, client, value: StoredStatus) -> StoredStatus:
        data = {
            "serviceType": value.service_type, "state": value.state, "stateSince": value.state_since,
            "reportedAt": value.reported_at, "receivedAt": value.received_at,
            "lastHeartbeatAt": value.last_heartbeat_at, "staleAfterSeconds": value.stale_after_seconds,
            "lastEventId": value.last_event_id, "lastSequence": value.last_sequence,
            "activityJson": json.dumps(value.activity) if value.activity else None,
            "issueJson": json.dumps(value.issue) if value.issue else None,
            "providerJson": json.dumps(value.provider) if value.provider else None,
            "capabilitiesJson": json.dumps(value.capabilities or []), "metadataJson": json.dumps(value.metadata or {}),
        }
        row = await client.servicestatus.upsert(
            where={"serviceId_instanceId": {"serviceId": value.service_id, "instanceId": value.instance_id}},
            data={"create": {"serviceId": value.service_id, "instanceId": value.instance_id, **data}, "update": data},
        )
        return self._status_from_model(row)

    async def ingest_status_event_atomic(self, incoming: StoredStatus, lifecycle, now: datetime) -> tuple[StoredStatus, bool, bool]:
        service_id, instance_id = incoming.service_id, incoming.instance_id
        identity = {"serviceId": service_id, "instanceId": instance_id}
        async with self.db.tx() as transaction:
            await self._lock_instance(transaction, service_id, instance_id)
            current_row = await transaction.servicestatus.find_unique(where={"serviceId_instanceId": identity})
            current = self._status_from_model(current_row) if current_row else None
            if current and current.last_event_id == incoming.last_event_id:
                return current, True, False
            if current and incoming.last_sequence is not None and current.last_sequence is not None and incoming.last_sequence <= current.last_sequence:
                return current, False, True
            if current and incoming.last_sequence is None:
                incoming = replace(incoming, last_sequence=current.last_sequence)

            status = replace(incoming)
            if lifecycle:
                operation_id, phase = lifecycle.operation_id, lifecycle.phase
                operation_key = {**identity, "operationId": operation_id}
                active_row = await transaction.statusactiveoperation.find_unique(where={"serviceId_instanceId_operationId": operation_key})
                completion_row = await transaction.statusoperationcompletion.find_unique(where={"serviceId_instanceId_operationId": operation_key})
                if phase in {"succeeded", "failed", "cancelled"} and completion_row:
                    return current or self._status_from_model(await transaction.servicestatus.find_unique(where={"serviceId_instanceId": identity})), True, False
                if phase == "started":
                    if completion_row:
                        raise ValueError("Operation already completed")
                    if not active_row:
                        await transaction.statusactiveoperation.create(data={
                            **operation_key, "serviceType": incoming.service_type,
                            "startedAt": now, "lastProgressAt": now, "label": lifecycle.label,
                        })
                elif phase == "progress":
                    if not active_row:
                        raise ValueError("No matching active operation")
                    await transaction.statusactiveoperation.update_many(where=operation_key, data={"lastProgressAt": now})
                else:
                    if not completion_row:
                        if not active_row:
                            raise ValueError("No matching active operation")
                        await transaction.statusoperationcompletion.create(data={
                            **operation_key, "outcome": phase, "startedAt": active_row.startedAt,
                            "finishedAt": now, "label": active_row.label,
                        })
                        await transaction.statusactiveoperation.delete(where={"serviceId_instanceId_operationId": operation_key})
                    stale_records = await transaction.statusoperationcompletion.find_many(
                        where=identity, order=[{"finishedAt": "desc"}, {"operationId": "desc"}], skip=20,
                    )
                    if stale_records:
                        await transaction.statusoperationcompletion.delete_many(where={**identity, "operationId": {"in": [item.operationId for item in stale_records]}})

                active_rows = await transaction.statusactiveoperation.find_many(where=identity)
                active = [ActiveOperation(row.serviceId, row.instanceId, row.operationId, row.serviceType, row.startedAt, row.lastProgressAt, row.label) for row in active_rows]
                base = replace(current or incoming)
                if phase in {"started", "progress"}:
                    status = _progress_status(base, active, now)
                else:
                    status = _finished_status(base, active, now)
                status = _event_status_with_active_work(status, incoming, current, now)
            else:
                active_rows = await transaction.statusactiveoperation.find_many(where=identity)
                if active_rows:
                    active = [ActiveOperation(row.serviceId, row.instanceId, row.operationId, row.serviceType, row.startedAt, row.lastProgressAt, row.label) for row in active_rows]
                    status = _event_status_with_active_work(_progress_status(replace(current or incoming), active, now), incoming, current, now)
            return await self._upsert_status(transaction, status), False, False

    @staticmethod
    def _completion_from_model(row) -> OperationCompletion:
        return OperationCompletion(row.serviceId, row.instanceId, row.operationId, row.outcome, row.startedAt, row.finishedAt, row.label)

    @staticmethod
    async def _lock_instance(transaction, service_id: str, instance_id: str) -> None:
        # Two 32-bit advisory keys serialize all start/finish mutations for this
        # instance, including its first start before a ServiceStatus row exists.
        # Return a supported scalar from Prisma raw query APIs; selecting the
        # advisory-lock function itself exposes PostgreSQL's unsupported `void`.
        await transaction.query_raw(
            "WITH lock_result AS MATERIALIZED (SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))) SELECT 1 AS locked FROM lock_result",
            service_id,
            instance_id,
        )

    async def start_operation_atomic(self, operation: ActiveOperation, fallback: StoredStatus) -> StoredStatus:
        service_id, instance_id = operation.service_id, operation.instance_id
        identity = {"serviceId": service_id, "instanceId": instance_id}
        key = {**identity, "operationId": operation.operation_id}
        async with self.db.tx() as transaction:
            await self._lock_instance(transaction, service_id, instance_id)
            if await transaction.statusoperationcompletion.find_unique(where={"serviceId_instanceId_operationId": key}):
                raise ValueError("Operation already completed")
            existing_operation = await transaction.statusactiveoperation.find_unique(where={"serviceId_instanceId_operationId": key})
            row = await transaction.servicestatus.find_unique(where={"serviceId_instanceId": identity})
            status = self._status_from_model(row) if row else fallback
            if existing_operation and row:
                return status
            await transaction.statusactiveoperation.upsert(
                where={"serviceId_instanceId_operationId": key},
                data={"create": {**key, "serviceType": operation.service_type, "startedAt": operation.started_at, "lastProgressAt": operation.last_progress_at, "label": operation.label}, "update": {}},
            )
            active_rows = await transaction.statusactiveoperation.find_many(where=identity)
            operations = [ActiveOperation(item.serviceId, item.instanceId, item.operationId, item.serviceType, item.startedAt, item.lastProgressAt, item.label) for item in active_rows]
            return await self._upsert_status(transaction, _progress_status(status, operations, operation.started_at))

    async def finish_operation_atomic(self, service_id: str, instance_id: str, operation_id: str, outcome: str, now: datetime) -> tuple[StoredStatus, OperationCompletion]:
        identity = {"serviceId": service_id, "instanceId": instance_id}
        key = {**identity, "operationId": operation_id}
        async with self.db.tx() as transaction:
            await self._lock_instance(transaction, service_id, instance_id)
            existing = await transaction.statusoperationcompletion.find_unique(where={"serviceId_instanceId_operationId": key})
            if existing:
                row = await transaction.servicestatus.find_unique(where={"serviceId_instanceId": identity})
                return self._status_from_model(row), self._completion_from_model(existing)
            operation = await transaction.statusactiveoperation.find_unique(where={"serviceId_instanceId_operationId": key})
            if not operation:
                raise ValueError("No matching active operation")
            row = await transaction.servicestatus.find_unique(where={"serviceId_instanceId": identity})
            if not row:
                raise ValueError("No status for active operation")
            completion = await transaction.statusoperationcompletion.create(data={**key, "outcome": outcome, "startedAt": operation.startedAt, "finishedAt": now, "label": operation.label})
            await transaction.statusactiveoperation.delete(where={"serviceId_instanceId_operationId": key})
            remaining_rows = await transaction.statusactiveoperation.find_many(where=identity)
            remaining = [ActiveOperation(item.serviceId, item.instanceId, item.operationId, item.serviceType, item.startedAt, item.lastProgressAt, item.label) for item in remaining_rows]
            status = await self._upsert_status(transaction, _finished_status(self._status_from_model(row), remaining, now))
            retained = await transaction.statusoperationcompletion.find_many(where=identity, order=[{"finishedAt": "desc"}, {"operationId": "desc"}], skip=20)
            if retained:
                await transaction.statusoperationcompletion.delete_many(where={**identity, "operationId": {"in": [record.operationId for record in retained]}})
            return status, self._completion_from_model(completion)

    async def list_completions(self, service_id: str, instance_id: str, *, limit: int = 5) -> list[OperationCompletion]:
        rows = await self.db.statusoperationcompletion.find_many(where={"serviceId": service_id, "instanceId": instance_id}, order=[{"finishedAt": "desc"}, {"operationId": "desc"}], take=limit)
        return [self._completion_from_model(row) for row in rows]

    async def record_heartbeat_atomic(self, service_id: str, instance_id: str, now: datetime) -> StoredStatus | None:
        async with self.db.tx() as transaction:
            await self._lock_instance(transaction, service_id, instance_id)
            identity = {"serviceId": service_id, "instanceId": instance_id}
            row = await transaction.servicestatus.find_unique(where={"serviceId_instanceId": identity})
            if not row:
                return None
            status = self._status_from_model(row)
            status.received_at = status.last_heartbeat_at = now
            return await self._upsert_status(transaction, status)

    async def mark_stuck_if_needed(self, service_id: str, instance_id: str, now: datetime, stale_after_seconds: int) -> StoredStatus | None:
        async with self.db.tx() as transaction:
            await self._lock_instance(transaction, service_id, instance_id)
            identity = {"serviceId": service_id, "instanceId": instance_id}
            rows = await transaction.statusactiveoperation.find_many(where=identity)
            status_row = await transaction.servicestatus.find_unique(where={"serviceId_instanceId": identity})
            if not rows or not status_row:
                return None
            status = self._status_from_model(status_row)
            last_heartbeat = status.last_heartbeat_at
            if (not last_heartbeat or now - last_heartbeat >= timedelta(seconds=stale_after_seconds)
                    or not any(now - row.lastProgressAt >= timedelta(seconds=OPERATION_STUCK_SECONDS) for row in rows)):
                return None
            status.state, status.state_since, status.reported_at, status.received_at = "stuck", now, now, now
            status.issue = {"code": "no_progress", "message": "Active operation has not reported progress.", "retryable": True}
            status.metadata = {**(status.metadata or {}), "activeOperationCount": len(rows)}
            return await self._upsert_status(transaction, status)

    async def create_operation(self, operation: ActiveOperation) -> None:
        await self.db.statusactiveoperation.upsert(
            where={"serviceId_instanceId_operationId": {"serviceId": operation.service_id, "instanceId": operation.instance_id, "operationId": operation.operation_id}},
            data={"create": {"serviceId": operation.service_id, "instanceId": operation.instance_id, "operationId": operation.operation_id, "serviceType": operation.service_type, "startedAt": operation.started_at, "lastProgressAt": operation.last_progress_at, "label": operation.label}, "update": {"lastProgressAt": operation.last_progress_at, "label": operation.label}},
        )

    async def touch_operation(self, service_id: str, instance_id: str, operation_id: str, now: datetime) -> None:
        async with self.db.tx() as transaction:
            await self._lock_instance(transaction, service_id, instance_id)
            identity = {"serviceId": service_id, "instanceId": instance_id}
            key = {**identity, "operationId": operation_id}
            operation = await transaction.statusactiveoperation.find_unique(where={"serviceId_instanceId_operationId": key})
            status_row = await transaction.servicestatus.find_unique(where={"serviceId_instanceId": identity})
            if not operation or not status_row:
                return
            await transaction.statusactiveoperation.update_many(where=key, data={"lastProgressAt": now})
            rows = await transaction.statusactiveoperation.find_many(where=identity)
            active_operations = [ActiveOperation(row.serviceId, row.instanceId, row.operationId, row.serviceType, row.startedAt, now if row.operationId == operation_id else row.lastProgressAt, row.label) for row in rows]
            status = self._status_from_model(status_row)
            await self._upsert_status(transaction, _progress_status(status, active_operations, now))

    async def delete_operation(self, service_id: str, instance_id: str, operation_id: str) -> None:
        await self.db.statusactiveoperation.delete_many(where={"serviceId": service_id, "instanceId": instance_id, "operationId": operation_id})

    async def list_operations(self, service_id: str, instance_id: str) -> list[ActiveOperation]:
        rows = await self.db.statusactiveoperation.find_many(where={"serviceId": service_id, "instanceId": instance_id})
        return [ActiveOperation(row.serviceId, row.instanceId, row.operationId, row.serviceType, row.startedAt, row.lastProgressAt, row.label) for row in rows]

    async def list_all_operations(self) -> list[ActiveOperation]:
        rows = await self.db.statusactiveoperation.find_many()
        return [ActiveOperation(row.serviceId, row.instanceId, row.operationId, row.serviceType, row.startedAt, row.lastProgressAt, row.label) for row in rows]

    async def save_credential(self, credential: ProducerCredential) -> None:
        active_key = f"{credential.service_id}:{credential.instance_id}" if credential.revoked_at is None else None
        await self.db.statusproducercredential.upsert(where={"credentialId": credential.credential_id}, data={"create": {"credentialId": credential.credential_id, "serviceId": credential.service_id, "instanceId": credential.instance_id, "activeKey": active_key, "secretHash": credential.secret_hash, "revokedAt": credential.revoked_at}, "update": {"serviceId": credential.service_id, "instanceId": credential.instance_id, "activeKey": active_key, "secretHash": credential.secret_hash, "revokedAt": credential.revoked_at}})

    async def get_credential(self, credential_id: str) -> ProducerCredential | None:
        row = await self.db.statusproducercredential.find_unique(where={"credentialId": credential_id})
        return ProducerCredential(row.credentialId, row.serviceId, row.instanceId, row.secretHash, row.revokedAt, row.createdAt) if row else None

    async def get_active_credential(self, service_id: str, instance_id: str) -> ProducerCredential | None:
        row = await self.db.statusproducercredential.find_first(where={"serviceId": service_id, "instanceId": instance_id, "revokedAt": None})
        return ProducerCredential(row.credentialId, row.serviceId, row.instanceId, row.secretHash, row.revokedAt, row.createdAt) if row else None

    async def list_credentials(self) -> list[ProducerCredential]:
        rows = await self.db.statusproducercredential.find_many(order={"createdAt": "asc"})
        return [ProducerCredential(row.credentialId, row.serviceId, row.instanceId, row.secretHash, row.revokedAt, row.createdAt) for row in rows]

    async def revoke_credential(self, credential_id: str, now: datetime) -> None:
        await self.db.statusproducercredential.update_many(where={"credentialId": credential_id}, data={"revokedAt": now, "activeKey": None})

    async def save_shelf_read_credential(self, credential: ShelfReadCredential) -> None:
        active_key = "shelf-read" if credential.revoked_at is None else None
        await self.db.statusshelfreadcredential.upsert(
            where={"credentialId": credential.credential_id},
            data={"create": {"credentialId": credential.credential_id, "activeKey": active_key, "secretHash": credential.secret_hash, "revokedAt": credential.revoked_at}, "update": {"activeKey": active_key, "secretHash": credential.secret_hash, "revokedAt": credential.revoked_at}},
        )

    async def get_shelf_read_credential(self, credential_id: str) -> ShelfReadCredential | None:
        row = await self.db.statusshelfreadcredential.find_unique(where={"credentialId": credential_id})
        return ShelfReadCredential(row.credentialId, row.secretHash, row.revokedAt, row.createdAt) if row else None

    async def get_active_shelf_read_credential(self) -> ShelfReadCredential | None:
        row = await self.db.statusshelfreadcredential.find_first(where={"revokedAt": None})
        return ShelfReadCredential(row.credentialId, row.secretHash, row.revokedAt, row.createdAt) if row else None

    async def list_shelf_read_credentials(self) -> list[ShelfReadCredential]:
        rows = await self.db.statusshelfreadcredential.find_many(order={"createdAt": "asc"})
        return [ShelfReadCredential(row.credentialId, row.secretHash, row.revokedAt, row.createdAt) for row in rows]

    async def revoke_shelf_read_credential(self, credential_id: str, now: datetime) -> None:
        await self.db.statusshelfreadcredential.update_many(where={"credentialId": credential_id}, data={"revokedAt": now, "activeKey": None})
