import asyncio
from types import SimpleNamespace

import pytest

from services import aira_status


class StatusServiceDouble:
    def __init__(self, *, start_error=None, finish_error=None):
        self.start_error = start_error
        self.finish_error = finish_error
        self.started = []
        self.finished = []

    async def start_operation(self, *args, **kwargs):
        self.started.append((args, kwargs))
        if self.start_error:
            raise self.start_error

    async def touch_operation(self, *args, **kwargs):
        pass

    async def finish_operation(self, *args, **kwargs):
        self.finished.append((args, kwargs))
        if self.finish_error:
            raise self.finish_error


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("error", "outcome"),
    [(None, "succeeded"), (RuntimeError("operation failed"), "failed"), (asyncio.CancelledError(), "cancelled")],
)
async def test_operation_scope_records_actual_terminal_outcome(monkeypatch, error, outcome):
    status = StatusServiceDouble()
    monkeypatch.setattr(aira_status, "db", SimpleNamespace(is_connected=lambda: True))
    monkeypatch.setattr(aira_status, "get_status_service", lambda: status)

    if error:
        with pytest.raises(type(error)):
            async with aira_status.track_aira_operation("safe label"):
                raise error
    else:
        async with aira_status.track_aira_operation("safe label"):
            pass

    assert status.finished[0][1]["outcome"] == outcome


@pytest.mark.asyncio
async def test_status_finish_error_does_not_replace_operation_exception(monkeypatch):
    original = RuntimeError("operation failed")
    status = StatusServiceDouble(finish_error=OSError("status store unavailable"))
    monkeypatch.setattr(aira_status, "db", SimpleNamespace(is_connected=lambda: True))
    monkeypatch.setattr(aira_status, "get_status_service", lambda: status)

    with pytest.raises(RuntimeError, match="operation failed"):
        async with aira_status.track_aira_operation("safe label"):
            raise original


@pytest.mark.asyncio
async def test_disconnected_database_skips_status_tracking(monkeypatch):
    status = StatusServiceDouble()
    monkeypatch.setattr(aira_status, "db", SimpleNamespace(is_connected=lambda: False))
    monkeypatch.setattr(aira_status, "get_status_service", lambda: status)

    async with aira_status.track_aira_operation("safe label"):
        pass

    assert status.started == []
    assert status.finished == []
