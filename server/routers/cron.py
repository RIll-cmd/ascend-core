"""Vercel Cron Job endpoints for automated scheduled tasks in serverless environment."""

from __future__ import annotations

import os
import secrets
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, Header, HTTPException, Request, status
from db import db
from services.companion_context import CompanionContextService, PostgresCompanionContextRepository

router = APIRouter(prefix="/api/cron", tags=["cron"])


@router.api_route("/browser-tasks-sweep", methods=["GET", "POST"], status_code=status.HTTP_200_OK)
async def browser_tasks_sweep_cron(
    request: Request,
    authorization: str | None = Header(default=None),
    x_cron_secret: str | None = Header(default=None, alias="x-cron-secret"),
    batch_size: int = 100,
):
    """Strictly authenticated bounded cleanup for transient browser payloads."""
    expected = os.getenv("CRON_SECRET", "").strip()
    provided = authorization[7:].strip() if authorization and authorization.startswith("Bearer ") else (x_cron_secret or "").strip()
    worker = os.getenv("ASCEND_BROWSER_WORKER_TOKEN", "").strip()
    if (not expected or not provided or secrets.compare_digest(expected, worker)
            or not secrets.compare_digest(provided, expected)):
        raise HTTPException(status_code=401, detail="Browser task cleanup authentication rejected")
    if not 1 <= batch_size <= 500:
        raise HTTPException(status_code=400, detail="batch_size must be between 1 and 500")
    now = datetime.now(timezone.utc)
    try:
        from services.browser_task_repository import PostgresBrowserTaskRepository
        result = await PostgresBrowserTaskRepository(db).sweep(now=now, batch_size=batch_size)
        return {"status": "success", "job": "browser-tasks-sweep", "executedAt": now.isoformat(), **result}
    except Exception as error:
        raise HTTPException(status_code=500, detail="Browser task cleanup failed") from error


def verify_cron_authorization(
    authorization: str | None = None,
    x_cron_secret: str | None = None
) -> bool:
    """
    Verifies that the request originates from an authorized Vercel Cron caller.
    Vercel Cron requests automatically include:
    Authorization: Bearer <CRON_SECRET>
    """
    expected_secret = os.getenv("CRON_SECRET", "").strip()
    
    # In strict production, CRON_SECRET must be configured
    if not expected_secret:
        # If not set in development, allow local invocation with a logged warning
        env = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development"))
        if env == "production":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="CRON_SECRET is not configured on the server."
            )
        return True

    provided_token = ""
    auth_str = authorization if isinstance(authorization, str) else None
    header_str = x_cron_secret if isinstance(x_cron_secret, str) else None

    if auth_str and auth_str.startswith("Bearer "):
        provided_token = auth_str[7:].strip()
    elif header_str:
        provided_token = header_str.strip()

    if not provided_token or not secrets.compare_digest(provided_token, expected_secret):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Cron authentication secret."
        )
    return True


@router.api_route("/status-sweep", methods=["GET", "POST"], status_code=status.HTTP_200_OK)
async def run_status_sweep_cron(request: Request, authorization: str | None = Header(default=None), x_cron_secret: str | None = Header(default=None, alias="x-cron-secret")) -> Dict[str, Any]:
    """
    Vercel Cron: Scheduled heartbeat and stuck-operation sweep.
    Replaces persistent daemon loops in serverless architecture.
    """
    verify_cron_authorization(authorization, x_cron_secret)
    now = datetime.now(timezone.utc)

    try:
        from services.aira_status import CORE_INSTANCE_ID, CORE_SERVICE_ID
        from services.status_service import get_status_service

        service = get_status_service()
        heartbeat_status = await service.record_heartbeat(CORE_SERVICE_ID, CORE_INSTANCE_ID, now=now)
        await service.sweep(now=now)

        return {
            "status": "success",
            "job": "status-sweep",
            "executedAt": now.isoformat(),
            "heartbeatRecorded": heartbeat_status is not None,
            "coreServiceId": CORE_SERVICE_ID,
            "coreInstanceId": CORE_INSTANCE_ID
        }
    except Exception as e:
        return {
            "status": "error",
            "job": "status-sweep",
            "executedAt": now.isoformat(),
            "error": str(e)
        }


@router.api_route("/companion-context-cleanup", methods=["GET", "POST"], status_code=status.HTTP_200_OK)
async def cleanup_companion_context(
    request: Request,
    authorization: str | None = Header(default=None),
    x_cron_secret: str | None = Header(default=None, alias="x-cron-secret"),
) -> Dict[str, Any]:
    verify_cron_authorization(authorization, x_cron_secret)
    now = datetime.now(timezone.utc)
    owner_id = os.getenv("ASCEND_CONTEXT_OWNER_ID", "").strip()
    device_id = os.getenv("ASCEND_CONTEXT_DEVICE_ID", "").strip()
    if not owner_id or not device_id:
        raise HTTPException(status_code=503, detail="Companion context cleanup is not configured")
    try:
        service = CompanionContextService(PostgresCompanionContextRepository(db),
                                          owner_id=owner_id, device_id=device_id)
        deleted = await service.cleanup(now=now)
        return {"status": "success", "job": "companion-context-cleanup",
                "executedAt": now.isoformat(), "expiredRecordsDeleted": deleted}
    except Exception as error:
        # Do not return database/provider error text through an unauthenticated cron surface.
        raise HTTPException(status_code=500, detail="Companion context cleanup failed") from error
@router.api_route("/midnight-decay", methods=["GET", "POST"], status_code=status.HTTP_200_OK)
async def run_midnight_decay_cron(request: Request, authorization: str | None = Header(default=None), x_cron_secret: str | None = Header(default=None, alias="x-cron-secret")) -> Dict[str, Any]:
    """
    Vercel Cron: Evaluates yesterday's pending missions and habits for midnight decay across all characters.
    """
    verify_cron_authorization(authorization, x_cron_secret)
    now = datetime.now(timezone.utc)

    if not db.is_connected():
        try:
            await db.connect()
        except Exception as err:
            return {
                "status": "skipped",
                "job": "midnight-decay",
                "executedAt": now.isoformat(),
                "reason": f"Database not connected: {err}"
            }

    try:
        from services.decay_service import process_midnight_decay

        characters = await db.character.find_many(take=100)
        processed_count = 0
        decay_summaries = []

        for char in characters:
            try:
                res = await process_midnight_decay(db, char.id)
                decay_summaries.append({"characterId": char.id, "result": res})
                processed_count += 1
            except Exception as char_err:
                decay_summaries.append({"characterId": char.id, "error": str(char_err)})

        return {
            "status": "success",
            "job": "midnight-decay",
            "executedAt": now.isoformat(),
            "charactersProcessed": processed_count,
            "summaries": decay_summaries
        }
    except Exception as e:
        return {
            "status": "error",
            "job": "midnight-decay",
            "executedAt": now.isoformat(),
            "error": str(e)
        }
