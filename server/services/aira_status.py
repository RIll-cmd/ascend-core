"""Durable AIRA operation scope used at request boundaries."""

from __future__ import annotations

from contextlib import asynccontextmanager
from uuid import uuid4

from db import db
from services.status_service import get_status_service

CORE_SERVICE_ID = "ascend-core"
CORE_INSTANCE_ID = "core"


@asynccontextmanager
async def track_aira_operation(label: str):
    """Keep shared active-operation state accurate across Core replicas."""
    # Unit tests and local degraded startup intentionally have no DB; production
    # status tracking never falls back to a process-local counter.
    if not db.is_connected():
        yield
        return
    operation_id = str(uuid4())
    service = get_status_service()
    await service.start_operation(CORE_SERVICE_ID, CORE_INSTANCE_ID, "agent", operation_id, label=label)
    try:
        yield
        await service.touch_operation(CORE_SERVICE_ID, CORE_INSTANCE_ID, operation_id)
    finally:
        await service.finish_operation(CORE_SERVICE_ID, CORE_INSTANCE_ID, operation_id)
