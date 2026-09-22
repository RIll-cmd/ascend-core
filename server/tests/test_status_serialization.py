import json
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import uuid4

import pytest

from schemas.service_status import ServiceStatusEvent, StatusShelfResponse
from services.status_repository import PostgresStatusRepository
from services.status_service import StatusService


class StatusTable:
    """Prisma-shaped storage double; repository JSON serialization stays real."""

    def __init__(self):
        self.rows = {}

    async def find_unique(self, *, where):
        identity = where["serviceId_instanceId"]
        return self.rows.get((identity["serviceId"], identity["instanceId"]))

    async def upsert(self, *, where, data):
        identity = where["serviceId_instanceId"]
        key = (identity["serviceId"], identity["instanceId"])
        values = vars(self.rows[key]) | data["update"] if key in self.rows else data["create"]
        self.rows[key] = SimpleNamespace(**values)
        return self.rows[key]

    async def find_many(self, *, order):
        assert order == {"serviceId": "asc"}
        return list(self.rows.values())


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "service_id,service_type,started_at,expected",
    [
        ("ascend-core", "agent", datetime(2026, 9, 16, tzinfo=timezone.utc), "2026-09-16T00:00:00Z"),
        ("ascend-vision", "vision", datetime(2026, 9, 16, microsecond=123456, tzinfo=timezone.utc), "2026-09-16T00:00:00.123456Z"),
        ("future-agent", "agent", datetime(2026, 9, 16, tzinfo=timezone(timedelta(hours=8))), "2026-09-16T00:00:00+08:00"),
    ],
)
async def test_working_activity_datetime_persists_and_round_trips_v1_shelf(
    service_id, service_type, started_at, expected
):
    table = StatusTable()
    service = StatusService(PostgresStatusRepository(SimpleNamespace(servicestatus=table)))
    event = ServiceStatusEvent.model_validate({
        "schemaVersion": 1,
        "eventId": str(uuid4()),
        "sequence": 1,
        "serviceId": service_id,
        "instanceId": "local-1",
        "serviceType": service_type,
        "state": "working",
        "stateSince": started_at,
        "reportedAt": started_at,
        "activity": {"kind": "operation", "startedAt": started_at},
        "metadata": {"activeOperationCount": 1},
    })
    assert isinstance(event.activity.started_at, datetime)

    accepted = await service.ingest_event(event, received_at=started_at)

    assert accepted.status.state == "working"
    row = table.rows[(service_id, "local-1")]
    activity = json.loads(row.activityJson)
    assert activity == {"kind": "operation", "label": None, "startedAt": expected, "progress": None}
    assert row.stateSince == started_at  # Prisma datetime columns remain datetime values.

    shelf = await service.shelf(now=started_at)
    wire = json.loads(shelf.model_dump_json(by_alias=True))
    assert wire["schemaVersion"] == 1
    assert wire["services"][0]["activity"] == activity
    readback = StatusShelfResponse.model_validate(wire).services[0]
    assert readback.service_id == service_id
    assert readback.state == "working"
    assert readback.activity.started_at == started_at
