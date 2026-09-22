from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest
from pydantic import ValidationError

from schemas.service_status import ServiceStatusEvent
from services.status_repository import InMemoryStatusRepository
from services.status_service import StatusService


def event(**overrides) -> ServiceStatusEvent:
    payload = {
        "schemaVersion": 1,
        "eventId": str(uuid4()),
        "sequence": 1,
        "serviceId": "ascend-core",
        "instanceId": "core-1",
        "serviceType": "agent",
        "state": "working",
        "stateSince": "2026-09-16T00:00:00+00:00",
        "reportedAt": "2026-09-16T00:00:00+00:00",
        "activity": {"kind": "operation", "label": "AIRA request", "startedAt": "2026-09-16T00:00:00+00:00"},
        **overrides,
    }
    return ServiceStatusEvent.model_validate(payload)


@pytest.mark.asyncio
async def test_event_id_retry_is_deduplicated():
    service = StatusService(InMemoryStatusRepository())
    first = event()

    accepted = await service.ingest_event(first)
    duplicate = await service.ingest_event(first)

    assert accepted.duplicate is False
    assert duplicate.duplicate is True
    assert duplicate.status.last_event_id == str(first.event_id)


@pytest.mark.asyncio
async def test_out_of_order_sequence_does_not_replace_latest_state():
    service = StatusService(InMemoryStatusRepository())
    accepted = await service.ingest_event(event(sequence=2, state="working"))
    stale = await service.ingest_event(event(sequence=1, state="idle"))

    assert accepted.status.state == "working"
    assert stale.out_of_order is True
    assert stale.status.state == "working"
    assert stale.status.last_sequence == 2


@pytest.mark.asyncio
async def test_stale_heartbeat_is_derived_as_offline():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    now = datetime(2026, 9, 16, tzinfo=timezone.utc)
    await service.ingest_event(event(state="idle"), received_at=now)

    shelf = await service.shelf(now=now + timedelta(seconds=31))

    assert shelf.services[0].state == "offline"


@pytest.mark.asyncio
async def test_active_operations_only_return_to_idle_after_final_completion():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    now = datetime(2026, 9, 16, tzinfo=timezone.utc)

    await service.start_operation("ascend-core", "core-1", "agent", "op-1", now=now)
    await service.start_operation("ascend-core", "core-1", "agent", "op-2", now=now)
    after_first = await service.finish_operation("ascend-core", "core-1", "op-1", now=now)
    after_final = await service.finish_operation("ascend-core", "core-1", "op-2", now=now)

    assert after_first.state == "working"
    assert after_first.metadata["activeOperationCount"] == 1
    assert after_final.state == "idle"
    assert after_final.metadata["activeOperationCount"] == 0


@pytest.mark.asyncio
async def test_healthy_active_operation_without_progress_becomes_stuck_after_90_seconds():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    now = datetime(2026, 9, 16, tzinfo=timezone.utc)

    await service.start_operation("ascend-core", "core-1", "agent", "op-1", now=now)
    await service.record_heartbeat("ascend-core", "core-1", now=now + timedelta(seconds=89))
    await service.sweep(now=now + timedelta(seconds=90))

    shelf = await service.shelf(now=now + timedelta(seconds=90))
    assert shelf.services[0].state == "stuck"


def test_status_contract_rejects_prohibited_payload_material():
    with pytest.raises(ValidationError, match="prohibited"):
        event(metadata={"terminalOutput": "secret output"})


def test_status_contract_rejects_unknown_payload_fields():
    with pytest.raises(ValidationError):
        event(prompt="do not include me")
