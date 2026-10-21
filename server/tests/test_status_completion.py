import asyncio
from datetime import datetime, timedelta, timezone

import pytest

from services.status_repository import InMemoryStatusRepository
from services.status_service import StatusService
from schemas.service_status import ServiceStatusEvent


NOW = datetime(2026, 9, 25, tzinfo=timezone.utc)


def status_event(event_id, state, *, lifecycle=None, sequence=None, state_since=NOW):
    return ServiceStatusEvent.model_validate({
        "schemaVersion": 1,
        "eventId": f"00000000-0000-0000-0000-{event_id:012d}",
        "sequence": sequence,
        "serviceId": "codex-cli",
        "instanceId": "default",
        "serviceType": "agent",
        "state": state,
        "stateSince": state_since.isoformat(),
        "reportedAt": NOW.isoformat(),
        "lifecycle": lifecycle,
    })


@pytest.mark.asyncio
@pytest.mark.parametrize("outcome", ["succeeded", "failed", "cancelled"])
async def test_explicit_terminal_outcome_is_stored_once(outcome):
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "op", label="Safe task", now=NOW)

    status = await service.finish_operation("core", "one", "op", outcome=outcome, now=NOW + timedelta(seconds=3))
    records = await repository.list_completions("core", "one", limit=5)

    assert status.state == "idle"
    assert len(records) == 1
    assert (records[0].outcome, records[0].started_at, records[0].finished_at, records[0].label) == (
        outcome, NOW, NOW + timedelta(seconds=3), "Safe task"
    )


@pytest.mark.asyncio
async def test_retry_keeps_first_terminal_outcome_and_timestamp():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "op", now=NOW)
    await service.finish_operation("core", "one", "op", outcome="failed", now=NOW + timedelta(seconds=1))
    await service.finish_operation("core", "one", "op", outcome="succeeded", now=NOW + timedelta(seconds=2))

    records = await repository.list_completions("core", "one", limit=5)
    assert [(record.outcome, record.finished_at) for record in records] == [("failed", NOW + timedelta(seconds=1))]


@pytest.mark.asyncio
async def test_unknown_operation_cannot_be_completed():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    with pytest.raises(ValueError, match="active operation"):
        await service.finish_operation("core", "one", "missing", outcome="succeeded", now=NOW)
    assert await repository.list_completions("core", "one", limit=5) == []


@pytest.mark.asyncio
async def test_one_completion_preserves_other_active_operation():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "first", now=NOW)
    await service.start_operation("core", "one", "agent", "second", now=NOW)
    status = await service.finish_operation("core", "one", "first", outcome="succeeded", now=NOW)
    assert (status.state, status.metadata["activeOperationCount"]) == ("working", 1)
    assert [operation.operation_id for operation in await repository.list_operations("core", "one")] == ["second"]


@pytest.mark.asyncio
async def test_finishing_latest_operation_reports_the_remaining_active_operation():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "first", label="First task", now=NOW)
    await service.start_operation("core", "one", "agent", "second", label="Second task", now=NOW + timedelta(seconds=1))

    status = await service.finish_operation("core", "one", "second", outcome="succeeded", now=NOW + timedelta(seconds=2))

    assert status.state == "working"
    assert status.activity == {"kind": "operation", "label": "First task", "startedAt": NOW.isoformat()}


@pytest.mark.asyncio
async def test_finishing_another_operation_does_not_clear_remaining_stuck_state():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "stale", label="Stale task", now=NOW)
    await service.start_operation("core", "one", "agent", "current", label="Current task", now=NOW + timedelta(seconds=91))
    await service.sweep(now=NOW + timedelta(seconds=91))

    status = await service.finish_operation("core", "one", "current", outcome="succeeded", now=NOW + timedelta(seconds=92))

    assert status.state == "stuck"
    assert status.metadata["activeOperationCount"] == 1
    assert status.activity == {"kind": "operation", "label": "Stale task", "startedAt": NOW.isoformat()}


@pytest.mark.asyncio
async def test_finishing_stuck_operation_clears_warning_when_healthy_work_remains():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "stale", label="Stale task", now=NOW)
    await service.start_operation("core", "one", "agent", "healthy", label="Healthy task", now=NOW + timedelta(seconds=80))
    await service.sweep(now=NOW + timedelta(seconds=91))

    status = await service.finish_operation("core", "one", "stale", outcome="failed", now=NOW + timedelta(seconds=92))

    assert status.state == "working"
    assert status.issue is None
    assert status.activity == {"kind": "operation", "label": "Healthy task", "startedAt": (NOW + timedelta(seconds=80)).isoformat()}


@pytest.mark.asyncio
async def test_starting_new_work_does_not_hide_another_stuck_operation():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "stale", label="Stale task", now=NOW)
    await service.sweep(now=NOW + timedelta(seconds=91))

    status = await service.start_operation("core", "one", "agent", "new", label="New task", now=NOW + timedelta(seconds=92))

    assert status.state == "stuck"
    assert status.metadata["activeOperationCount"] == 2
    assert status.activity == {"kind": "operation", "label": "New task", "startedAt": (NOW + timedelta(seconds=92)).isoformat()}


@pytest.mark.asyncio
async def test_progress_is_serialized_with_sweep_and_restores_working_state():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "op", now=NOW)
    await service.sweep(now=NOW + timedelta(seconds=91))

    await service.touch_operation("core", "one", "op", now=NOW + timedelta(seconds=92))
    await service.sweep(now=NOW + timedelta(seconds=93))

    status = await repository.get_status("core", "one")
    assert (status.state, status.issue, status.last_heartbeat_at) == ("working", None, NOW + timedelta(seconds=92))


@pytest.mark.asyncio
async def test_concurrent_starts_and_finish_keep_count_consistent():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await asyncio.gather(*(
        service.start_operation("core", "one", "agent", f"op-{index}", now=NOW)
        for index in range(10)
    ))
    await asyncio.gather(*(
        service.finish_operation("core", "one", f"op-{index}", outcome="succeeded", now=NOW)
        for index in range(5)
    ))
    status = await repository.get_status("core", "one")
    assert (status.state, status.metadata["activeOperationCount"]) == ("working", 5)
    assert len(await repository.list_completions("core", "one", limit=10)) == 5


@pytest.mark.asyncio
async def test_completed_operation_cannot_be_restarted_while_retained():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "op", now=NOW)
    await service.finish_operation("core", "one", "op", outcome="succeeded", now=NOW)
    with pytest.raises(ValueError, match="already completed"):
        await service.start_operation("core", "one", "agent", "op", now=NOW)
    assert (await repository.get_status("core", "one")).state == "idle"


@pytest.mark.asyncio
async def test_duplicate_active_start_preserves_original_start_time_and_label():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "op", label="Original", now=NOW)

    status = await service.start_operation("core", "one", "agent", "op", label="Retry", now=NOW + timedelta(seconds=10))

    assert status.activity == {"kind": "operation", "label": "Original", "startedAt": NOW.isoformat()}
    await service.finish_operation("core", "one", "op", outcome="succeeded", now=NOW + timedelta(seconds=11))
    completion = (await repository.list_completions("core", "one"))[0]
    assert (completion.started_at, completion.label) == (NOW, "Original")


@pytest.mark.asyncio
async def test_unsafe_label_is_rejected_before_storage():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    with pytest.raises(ValueError, match="label"):
        await service.start_operation("core", "one", "agent", "op", label="secret\ntranscript", now=NOW)
    assert await repository.list_operations("core", "one") == []


@pytest.mark.asyncio
async def test_completion_history_keeps_newest_twenty_per_instance():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    for index in range(22):
        timestamp = NOW + timedelta(seconds=index)
        await service.start_operation("core", "one", "agent", f"op-{index}", now=timestamp)
        await service.finish_operation("core", "one", f"op-{index}", outcome="succeeded", now=timestamp)
    records = await repository.list_completions("core", "one", limit=30)
    assert len(records) == 20
    assert [record.operation_id for record in records] == [f"op-{index}" for index in range(21, 1, -1)]
    shelf = await service.shelf(now=NOW + timedelta(seconds=30))
    summaries = shelf.model_dump(mode="json", by_alias=True)["services"][0]["completions"]
    assert len(summaries) == 5
    assert summaries[0] == {"outcome": "succeeded", "finishedAt": (NOW + timedelta(seconds=21)).isoformat().replace("+00:00", "Z"), "label": None}
    assert "operationId" not in summaries[0]


@pytest.mark.asyncio
async def test_idle_and_stale_status_never_create_completion():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "op", now=NOW)
    await service.record_heartbeat("core", "one", now=NOW + timedelta(seconds=31))
    await service.sweep(now=NOW + timedelta(seconds=91))
    await service.shelf(now=NOW + timedelta(seconds=122))
    assert await repository.list_completions("core", "one", limit=5) == []


@pytest.mark.asyncio
async def test_finishing_stuck_operation_clears_its_no_progress_warning():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "op", now=NOW)
    await service.sweep(now=NOW + timedelta(seconds=91))

    status = await service.finish_operation("core", "one", "op", outcome="succeeded", now=NOW + timedelta(seconds=92))

    assert status.state == "idle"
    assert status.issue is None


@pytest.mark.asyncio
async def test_sweep_after_finish_does_not_restore_stuck_state_or_active_count():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.start_operation("core", "one", "agent", "op", now=NOW)
    await service.finish_operation("core", "one", "op", outcome="succeeded", now=NOW + timedelta(seconds=91))

    await service.sweep(now=NOW + timedelta(seconds=92))

    status = await repository.get_status("core", "one")
    assert (status.state, status.metadata["activeOperationCount"]) == ("idle", 0)


@pytest.mark.asyncio
async def test_authenticated_lifecycle_events_create_explicit_completion_evidence():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    started = status_event(1, "working", lifecycle={"operationId": "job-1", "phase": "started", "label": "Build release"}, sequence=1)
    failed = status_event(2, "idle", lifecycle={"operationId": "job-1", "phase": "failed"}, sequence=2)

    await service.ingest_event(started, received_at=NOW)
    result = await service.ingest_event(failed, received_at=NOW + timedelta(seconds=5))

    records = await repository.list_completions("codex-cli", "default")
    assert (result.status.state, result.status.metadata["activeOperationCount"]) == ("idle", 0)
    assert [(record.outcome, record.label) for record in records] == [("failed", "Build release")]


@pytest.mark.asyncio
async def test_operation_started_at_uses_server_receipt_not_service_state_since():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    old_state_since = NOW - timedelta(minutes=10)
    await service.ingest_event(
        status_event(1, "working", lifecycle={"operationId": "job-1", "phase": "started"}, sequence=1, state_since=old_state_since),
        received_at=NOW,
    )
    await service.ingest_event(
        status_event(2, "idle", lifecycle={"operationId": "job-1", "phase": "succeeded"}, sequence=2),
        received_at=NOW + timedelta(seconds=2),
    )

    assert (await repository.list_completions("codex-cli", "default"))[0].started_at == NOW


@pytest.mark.asyncio
async def test_lifecycle_terminal_retry_keeps_first_outcome():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.ingest_event(status_event(1, "working", lifecycle={"operationId": "job-1", "phase": "started"}, sequence=1), received_at=NOW)

    await service.ingest_event(status_event(2, "idle", lifecycle={"operationId": "job-1", "phase": "failed"}, sequence=2), received_at=NOW + timedelta(seconds=1))
    await service.ingest_event(status_event(3, "idle", lifecycle={"operationId": "job-1", "phase": "succeeded"}, sequence=3), received_at=NOW + timedelta(seconds=2))

    records = await repository.list_completions("codex-cli", "default")
    assert [record.outcome for record in records] == ["failed"]


@pytest.mark.asyncio
async def test_legacy_idle_event_never_completes_or_hides_explicit_active_work():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.ingest_event(status_event(1, "working", lifecycle={"operationId": "job-1", "phase": "started"}, sequence=1), received_at=NOW)

    result = await service.ingest_event(status_event(2, "idle", sequence=2), received_at=NOW + timedelta(seconds=1))

    assert result.status.state == "working"
    assert result.status.metadata["activeOperationCount"] == 1
    assert await repository.list_completions("codex-cli", "default") == []


@pytest.mark.asyncio
async def test_progress_and_terminal_events_require_matching_started_operation():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    event = status_event(1, "working", lifecycle={"operationId": "missing", "phase": "progress"}, sequence=1)

    with pytest.raises(ValueError, match="active operation"):
        await service.ingest_event(event, received_at=NOW)


@pytest.mark.asyncio
async def test_legacy_event_without_sequence_remains_compatible():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    event = status_event(1, "idle")
    event.sequence = None

    result = await service.ingest_event(event, received_at=NOW)

    assert result.status.state == "idle"


@pytest.mark.asyncio
async def test_unsequenced_event_preserves_sequence_watermark():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.ingest_event(status_event(1, "idle", sequence=10), received_at=NOW)
    legacy = status_event(2, "working")
    legacy.sequence = None
    await service.ingest_event(legacy, received_at=NOW + timedelta(seconds=1))

    old = await service.ingest_event(status_event(3, "idle", sequence=9), received_at=NOW + timedelta(seconds=2))

    assert old.out_of_order is True
    assert old.status.last_sequence == 10


@pytest.mark.asyncio
async def test_lifecycle_progress_updates_producer_metadata_without_overwriting_active_count():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    started = status_event(1, "working", lifecycle={"operationId": "job-1", "phase": "started"}, sequence=1)
    progress = status_event(2, "working", lifecycle={"operationId": "job-1", "phase": "progress"}, sequence=2)
    started.metadata = {"step": 1}
    progress.metadata = {"step": 2}

    await service.ingest_event(started, received_at=NOW)
    result = await service.ingest_event(progress, received_at=NOW + timedelta(seconds=1))

    assert result.status.metadata == {"step": 2, "activeOperationCount": 1}


@pytest.mark.asyncio
async def test_terminal_retry_does_not_rewrite_later_current_status():
    repository = InMemoryStatusRepository()
    service = StatusService(repository)
    await service.ingest_event(status_event(1, "working", lifecycle={"operationId": "job-1", "phase": "started"}, sequence=1), received_at=NOW)
    await service.ingest_event(status_event(2, "idle", lifecycle={"operationId": "job-1", "phase": "succeeded"}, sequence=2), received_at=NOW + timedelta(seconds=1))
    await service.ingest_event(status_event(3, "working", sequence=3), received_at=NOW + timedelta(seconds=2))

    retry = await service.ingest_event(status_event(4, "idle", lifecycle={"operationId": "job-1", "phase": "failed"}, sequence=4), received_at=NOW + timedelta(seconds=3))

    assert retry.duplicate is True
    assert (retry.status.state, retry.status.last_sequence) == ("working", 3)
    assert [record.outcome for record in await repository.list_completions("codex-cli", "default")] == ["succeeded"]
