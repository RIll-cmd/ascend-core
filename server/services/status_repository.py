"""Durable storage boundary for the status shelf.

`StatusActiveOperation` is deliberately a live-work table, not event history.
It is the shared replacement for process-local active-operation counters.
"""

from __future__ import annotations

import base64
import hashlib
import json
import secrets
from dataclasses import dataclass, replace
from datetime import datetime
from typing import Any


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

    async def create_operation(self, operation: ActiveOperation) -> None:
        self.operations[(operation.service_id, operation.instance_id, operation.operation_id)] = replace(operation)

    async def touch_operation(self, service_id: str, instance_id: str, operation_id: str, now: datetime) -> None:
        key = (service_id, instance_id, operation_id)
        if key in self.operations:
            self.operations[key].last_progress_at = now

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
        row = await self.db.servicestatus.upsert(
            where={"serviceId_instanceId": {"serviceId": value.service_id, "instanceId": value.instance_id}},
            data={"create": {"serviceId": value.service_id, "instanceId": value.instance_id, **data}, "update": data},
        )
        return self._status_from_model(row)

    async def create_operation(self, operation: ActiveOperation) -> None:
        await self.db.statusactiveoperation.upsert(
            where={"serviceId_instanceId_operationId": {"serviceId": operation.service_id, "instanceId": operation.instance_id, "operationId": operation.operation_id}},
            data={"create": {"serviceId": operation.service_id, "instanceId": operation.instance_id, "operationId": operation.operation_id, "serviceType": operation.service_type, "startedAt": operation.started_at, "lastProgressAt": operation.last_progress_at, "label": operation.label}, "update": {"lastProgressAt": operation.last_progress_at, "label": operation.label}},
        )

    async def touch_operation(self, service_id: str, instance_id: str, operation_id: str, now: datetime) -> None:
        await self.db.statusactiveoperation.update_many(where={"serviceId": service_id, "instanceId": instance_id, "operationId": operation_id}, data={"lastProgressAt": now})

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
