from datetime import datetime, timezone
from types import SimpleNamespace
from uuid import uuid4

import pytest

from services.status_repository import PostgresStatusRepository
from services.status_service import StatusService
from schemas.service_status import ServiceStatusEvent


NOW = datetime(2026, 9, 25, tzinfo=timezone.utc)


class Table:
    def __init__(self, key_fields):
        self.key_fields = key_fields
        self.rows = {}

    def _key(self, values):
        return tuple(values[field] for field in self.key_fields)

    async def find_unique(self, *, where):
        return self.rows.get(self._key(next(iter(where.values()))))

    async def upsert(self, *, where, data):
        key = self._key(next(iter(where.values())))
        values = vars(self.rows[key]) | data["update"] if key in self.rows else data["create"]
        self.rows[key] = SimpleNamespace(**values)
        return self.rows[key]

    async def create(self, *, data):
        row = SimpleNamespace(**data)
        self.rows[self._key(data)] = row
        return row

    async def delete(self, *, where):
        return self.rows.pop(self._key(next(iter(where.values()))))

    async def count(self, *, where):
        return sum(all(getattr(row, field) == value for field, value in where.items()) for row in self.rows.values())

    async def find_many(self, *, where, order=None, skip=0, take=None):
        rows = [row for row in self.rows.values() if all(getattr(row, field) == value for field, value in where.items())]
        if order:
            for criterion in reversed(order):
                field = next(iter(criterion))
                rows.sort(key=lambda row: getattr(row, field), reverse=criterion[field] == "desc")
        return rows[skip:][:take]

    async def delete_many(self, *, where):
        allowed = set(where["operationId"]["in"])
        for key, row in list(self.rows.items()):
            if row.serviceId == where["serviceId"] and row.instanceId == where["instanceId"] and row.operationId in allowed:
                del self.rows[key]

    async def update_many(self, *, where, data):
        for row in self.rows.values():
            if all(getattr(row, field) == value for field, value in where.items()):
                for field, value in data.items():
                    setattr(row, field, value)


class TransactionDatabase:
    def __init__(self):
        self.servicestatus = Table(("serviceId", "instanceId"))
        self.statusactiveoperation = Table(("serviceId", "instanceId", "operationId"))
        self.statusoperationcompletion = Table(("serviceId", "instanceId", "operationId"))
        self.locks = []

    def tx(self):
        return self

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return False

    async def query_raw(self, query, *args):
        self.locks.append((query, args))
        return [{}]


def lifecycle_event(state, phase, sequence):
    return ServiceStatusEvent.model_validate({
        "schemaVersion": 1,
        "eventId": str(uuid4()),
        "sequence": sequence,
        "serviceId": "codex-cli",
        "instanceId": "default",
        "serviceType": "agent",
        "state": state,
        "stateSince": NOW.isoformat(),
        "reportedAt": NOW.isoformat(),
        "lifecycle": {"operationId": "job-1", "phase": phase, "label": "Build" if phase == "started" else None},
    })


@pytest.mark.asyncio
async def test_postgres_transaction_preserves_other_work_and_first_outcome():
    database = TransactionDatabase()
    repository = PostgresStatusRepository(database)
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "first", now=NOW)
    await service.start_operation("core", "one", "agent", "second", now=NOW)
    first = await service.finish_operation("core", "one", "first", outcome="failed", now=NOW)
    retry = await service.finish_operation("core", "one", "first", outcome="succeeded", now=NOW)

    assert (first.state, first.metadata["activeOperationCount"]) == ("working", 1)
    assert (retry.state, retry.metadata["activeOperationCount"]) == ("working", 1)
    assert [(record.operation_id, record.outcome) for record in await repository.list_completions("core", "one")] == [("first", "failed")]
    assert [operation.operation_id for operation in await repository.list_operations("core", "one")] == ["second"]
    assert len(database.locks) == 4
    assert all(
        args == ("core", "one")
        and "pg_advisory_xact_lock" in query
        and "SELECT 1 AS locked" in query
        for query, args in database.locks
    )


@pytest.mark.asyncio
async def test_postgres_lifecycle_events_persist_explicit_terminal_evidence_atomically():
    database = TransactionDatabase()
    service = StatusService(PostgresStatusRepository(database))

    await service.ingest_event(lifecycle_event("working", "started", 1), received_at=NOW)
    await service.ingest_event(lifecycle_event("idle", "succeeded", 2), received_at=NOW)

    assert [(row.operation_id, row.outcome, row.label) for row in await service.repository.list_completions("codex-cli", "default")] == [
        ("job-1", "succeeded", "Build")
    ]
    assert await service.repository.list_operations("codex-cli", "default") == []
    assert (await service.repository.get_status("codex-cli", "default")).state == "idle"
