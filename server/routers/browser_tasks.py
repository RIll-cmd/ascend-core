"""Authenticated PWA and dedicated Vision-worker routes for browser tasks."""
from __future__ import annotations

import json
import os
import secrets
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response
from fastapi.routing import APIRoute
from fastapi.exceptions import RequestValidationError
from fastapi.exception_handlers import request_validation_exception_handler
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from schemas.browser_tasks import (
    BrowserAvailabilityResponse, BrowserSessionCreate, BrowserSessionResponse,
    BrowserTaskAck, BrowserTaskControl, BrowserTaskCreate, BrowserTaskReceipt,
    BrowserTaskView, BrowserWorkerBootRegistration, BrowserWorkerClaimRequest,
    BrowserWorkerCompletion, BrowserWorkerEventsRequest, BrowserWorkerEventsResponse,
    BrowserWorkerEventsPublishRequest, BrowserWorkerHeartbeat, BrowserWorkerRelease, BrowserWorkerTask,
    BrowserWorkerReconcile, BrowserWorkerDispatchRequest, BrowserWorkerDispatchPermit,
    BrowserProposalPublish, BrowserReviewDecision, BrowserReviewConsume,
    BrowserDiscordStart, BrowserDiscordTask, BrowserDiscordUser,
    BrowserPublished, BrowserRecorded, BrowserReviewAccessReceipt, BrowserReviewLinkReceipt,
    BrowserDiscordConsent, BrowserDiscordAvailability, BrowserDiscordStarted,
    BrowserStatusReceipt, BrowserAcknowledged, BrowserEnded,
)
from services.browser_tasks import BrowserTaskService
from services.phone_access import bearer_credential, owner_id_from_user, require_same_origin


async def _no_store(response: Response) -> None:
    response.headers["Cache-Control"] = "no-store"


class BrowserNoStoreRoute(APIRoute):
    def get_route_handler(self):
        handler = super().get_route_handler()

        async def no_store_handler(request):
            try:
                response = await handler(request)
            except StarletteHTTPException as error:
                error.headers = {**(error.headers or {}), "Cache-Control": "no-store"}
                raise
            except RequestValidationError as error:
                response = await request_validation_exception_handler(request, error)
            response.headers["Cache-Control"] = "no-store"
            return response
        return no_store_handler


router = APIRouter(prefix="/api/browser-tasks", tags=["browser-tasks"],
                   dependencies=[Depends(_no_store)], route_class=BrowserNoStoreRoute)
limiter = Limiter(key_func=get_remote_address)


def _enabled() -> bool:
    return os.getenv("ASCEND_BROWSER_REMOTE_ENABLED", "").strip().lower() == "true"


def _writes_enabled() -> bool:
    return _enabled() and os.getenv("ASCEND_BROWSER_REMOTE_WRITES_ENABLED", "").strip().lower() == "true"


async def get_browser_task_service() -> BrowserTaskService:
    from db import db
    from services.browser_task_repository import PostgresBrowserTaskRepository

    other_names = (
        "ASCEND_PHONE_WORKER_TOKEN", "ASCEND_DISCORD_BRIDGE_TOKEN",
        "ASCEND_CONTEXT_PUBLISHER_TOKEN", "ASCEND_NOTIFICATION_WORKER_TOKEN",
        "ASCEND_NOTIFICATION_PUBLISHER_TOKEN", "ASCEND_STATUS_READ_CREDENTIAL", "CRON_SECRET",
    )


    return BrowserTaskService(
        PostgresBrowserTaskRepository(db), owner_id=os.getenv("ASCEND_PHONE_OWNER_ID"),
        laptop_id=os.getenv("ASCEND_BROWSER_LAPTOP_ID"),
        worker_token=os.getenv("ASCEND_BROWSER_WORKER_TOKEN"), enabled=_enabled(),
        writes_enabled=_writes_enabled(),
        other_credentials=tuple(os.getenv(name, "").strip() for name in other_names),
    )


async def get_current_user(request: Request) -> dict:
    # Lazy import keeps boundary tests independent of generated Prisma models.
    from auth_utils import get_current_user as authenticate
    return await authenticate(request)


def _raise(error: Exception) -> None:
    if isinstance(error, PermissionError):
        raise HTTPException(status_code=403, detail=str(error))
    if isinstance(error, LookupError):
        raise HTTPException(status_code=410 if "erased" in str(error).lower() else 404, detail=str(error))
    if isinstance(error, OverflowError):
        raise HTTPException(status_code=429, detail=str(error))
    if isinstance(error, ValueError):
        raise HTTPException(status_code=409, detail=str(error))
    raise error


def _device_header(value: str | None) -> str:
    if not value:
        raise HTTPException(status_code=400, detail="X-Phone-Device is required")
    return value


def _session_header(value: str | None) -> str:
    if not value:
        raise HTTPException(status_code=400, detail="X-Browser-Session is required")
    try:
        return str(UUID(value))
    except ValueError as error:
        raise HTTPException(status_code=400, detail="X-Browser-Session must be a UUID") from error


def _worker_context(service: BrowserTaskService, authorization: str | None,
                    boot: str | None = None, lease: str | None = None,
                    fence: int | None = None) -> tuple[str | None, str | None, int | None]:
    token = bearer_credential(authorization, label="Browser worker")
    try:
        service.authenticate_worker(token)
    except PermissionError as error:
        raise HTTPException(status_code=403, detail="Browser worker credential rejected") from error
    if boot is None:
        return None, None, None
    if not lease or fence is None or fence < 1 or not fence <= 2**31 - 1:
        raise HTTPException(status_code=400, detail="Current browser lease, boot and fence are required")
    return boot, lease, fence


@router.get("/worker/identity")
@limiter.limit("30/minute")
async def worker_identity(
    request: Request,
    authorization: str | None = Header(default=None),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    _worker_context(service, authorization)
    try:
        return await service.worker_identity()
    except (PermissionError, ValueError) as error:
        _raise(error)


@router.get("/availability", response_model=BrowserAvailabilityResponse)
@limiter.limit("60/minute")
async def availability(
    request: Request,
    response: Response,
    device_id: str | None = Header(default=None, alias="X-Phone-Device"),
    user: dict = Depends(get_current_user),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    try:
        value = await service.availability(owner_id_from_user(user), _device_header(device_id))
        response.headers["Cache-Control"] = "no-store"
        return value
    except (PermissionError, ValueError, LookupError, OverflowError) as error:
        _raise(error)


@router.post("/sessions", response_model=BrowserSessionResponse, status_code=201)
@limiter.limit("10/minute")
async def create_session(
    payload: BrowserSessionCreate,
    request: Request,
    response: Response,
    device_id: str | None = Header(default=None, alias="X-Phone-Device"),
    user: dict = Depends(get_current_user),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    require_same_origin(request)
    device = _device_header(device_id)
    if payload.device_id != device:
        raise HTTPException(status_code=409, detail="Device body and header do not match")
    try:
        value = await service.create_session(owner_id_from_user(user), payload)
        response.headers["Cache-Control"] = "no-store"
        return value
    except (PermissionError, ValueError, LookupError, OverflowError) as error:
        _raise(error)


@router.post("/sessions/{session_id}/end", status_code=204)
@limiter.limit("20/minute")
async def end_session(
    session_id: str,
    payload: BrowserTaskAck,
    request: Request,
    device_id: str | None = Header(default=None, alias="X-Phone-Device"),
    session_header: str | None = Header(default=None, alias="X-Browser-Session"),
    user: dict = Depends(get_current_user),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    require_same_origin(request)
    device = _device_header(device_id)
    session = _session_header(session_header)
    if str(payload.browser_session_id) != session or session_id != session:
        raise HTTPException(status_code=409, detail="Browser session identifiers do not match")
    try:
        if not await service.end_session(owner_id_from_user(user), device, session):
            raise HTTPException(status_code=404, detail="Browser session not found")
        return Response(status_code=204, headers={"Cache-Control": "no-store"})
    except (PermissionError, ValueError, LookupError, OverflowError) as error:
        _raise(error)


@router.post("/", response_model=BrowserTaskReceipt, status_code=202)
@limiter.limit("20/minute")
async def enqueue_task(
    payload: BrowserTaskCreate,
    request: Request,
    response: Response,
    device_id: str | None = Header(default=None, alias="X-Phone-Device"),
    session_header: str | None = Header(default=None, alias="X-Browser-Session"),
    user: dict = Depends(get_current_user),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    require_same_origin(request)
    device, session = _device_header(device_id), _session_header(session_header)
    if str(payload.browser_session_id) != session:
        raise HTTPException(status_code=409, detail="Browser session body and header do not match")
    try:
        value = await service.enqueue(owner_id_from_user(user), device, payload)
        response.headers["Cache-Control"] = "no-store"
        return value
    except (PermissionError, ValueError, LookupError, OverflowError) as error:
        _raise(error)


@router.get("/{task_id}", response_model=BrowserTaskView)
@limiter.limit("120/minute")
async def read_task(
    task_id: str,
    request: Request,
    response: Response,
    after: int = Query(default=0, ge=0, le=2**31 - 1),
    device_id: str | None = Header(default=None, alias="X-Phone-Device"),
    session_header: str | None = Header(default=None, alias="X-Browser-Session"),
    user: dict = Depends(get_current_user),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    try:
        value = await service.read_task(owner_id_from_user(user), _device_header(device_id),
                                        _session_header(session_header), task_id, after)
        if value is None:
            raise HTTPException(status_code=404, detail="Browser task not found")
        response.headers["Cache-Control"] = "no-store"
        return value
    except (PermissionError, ValueError, LookupError, OverflowError) as error:
        _raise(error)


@router.post("/{task_id}/control", response_model=BrowserTaskReceipt)
@limiter.limit("30/minute")
async def control_task(
    task_id: str,
    payload: BrowserTaskControl,
    request: Request,
    response: Response,
    device_id: str | None = Header(default=None, alias="X-Phone-Device"),
    session_header: str | None = Header(default=None, alias="X-Browser-Session"),
    user: dict = Depends(get_current_user),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    require_same_origin(request)
    device, session = _device_header(device_id), _session_header(session_header)
    if str(payload.browser_session_id) != session:
        raise HTTPException(status_code=409, detail="Browser session body and header do not match")
    try:
        state = await service.control(owner_id_from_user(user), device, session, task_id, payload.command)
        if state is None:
            raise HTTPException(status_code=404, detail="Browser task not found")
        value = await service.read_task(owner_id_from_user(user), device, session, task_id)
        response.headers["Cache-Control"] = "no-store"
        return {"taskId": task_id, "status": state, "createdAt": value["createdAt"], "expiresAt": value["expiresAt"]}
    except (PermissionError, ValueError, LookupError, OverflowError) as error:
        _raise(error)


@router.post("/{task_id}/ack", status_code=204)
@limiter.limit("30/minute")
async def acknowledge_task(
    task_id: str,
    payload: BrowserTaskAck,
    request: Request,
    device_id: str | None = Header(default=None, alias="X-Phone-Device"),
    session_header: str | None = Header(default=None, alias="X-Browser-Session"),
    user: dict = Depends(get_current_user),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    require_same_origin(request)
    device, session = _device_header(device_id), _session_header(session_header)
    if str(payload.browser_session_id) != session:
        raise HTTPException(status_code=409, detail="Browser session body and header do not match")
    try:
        if not await service.acknowledge(owner_id_from_user(user), device, session, task_id):
            raise HTTPException(status_code=404, detail="Browser task not found")
        return Response(status_code=204, headers={"Cache-Control": "no-store"})
    except (PermissionError, ValueError, LookupError, OverflowError) as error:
        _raise(error)


@router.post("/worker/register-boot")
@limiter.limit("20/minute")
async def register_boot(
    payload: BrowserWorkerBootRegistration,
    request: Request,
    authorization: str | None = Header(default=None),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    _worker_context(service, authorization)
    try:
        registered = await service.register_boot(payload.expected_boot_id, payload.new_boot_id)
        if not registered:
            raise HTTPException(status_code=409, detail="Broker boot registration was fenced by a newer boot")
        return {"registered": True, "brokerBootId": payload.new_boot_id}
    except (PermissionError, ValueError) as error:
        _raise(error)


@router.post("/worker/heartbeat", status_code=204)
@limiter.limit("60/minute")
async def heartbeat(
    payload: BrowserWorkerHeartbeat,
    request: Request,
    authorization: str | None = Header(default=None),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    _worker_context(service, authorization)
    try:
        if not await service.heartbeat(payload.broker_boot_id, payload.availability, payload.descriptor):
            raise HTTPException(status_code=409, detail="Browser worker boot is stale")
        return Response(status_code=204, headers={"Cache-Control": "no-store"})
    except (PermissionError, ValueError) as error:
        _raise(error)


@router.post("/worker/claim", response_model=BrowserWorkerTask | None)
@limiter.limit("120/minute")
async def claim(
    payload: BrowserWorkerClaimRequest,
    request: Request,
    authorization: str | None = Header(default=None),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    _worker_context(service, authorization)
    try:
        task = await service.claim(payload.broker_boot_id)
        if task is None:
            return Response(status_code=204, headers={"Cache-Control": "no-store"})
        return task
    except (PermissionError, ValueError) as error:
        _raise(error)


def _lease_headers(service: BrowserTaskService, authorization: str | None,
                   lease: str | None, fence: int | None, boot: str | None):
    boot_value, lease_value, fence_value = _worker_context(service, authorization, boot, lease, fence)
    if not boot_value or not lease_value or not fence_value:
        raise HTTPException(status_code=400, detail="Browser lease binding is required")
    return boot_value, lease_value, fence_value


@router.post("/worker/tasks/{task_id}/authorize-dispatch", response_model=BrowserWorkerDispatchPermit)
@limiter.limit("180/minute")
async def authorize_dispatch(
    task_id: str,
    payload: BrowserWorkerDispatchRequest,
    request: Request,
    authorization: str | None = Header(default=None),
    lease: str | None = Header(default=None, alias="X-Browser-Lease"),
    fence: int | None = Header(default=None, alias="X-Browser-Fence"),
    boot: str | None = Header(default=None, alias="X-Browser-Boot"),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    boot_value, lease_value, fence_value = _lease_headers(service, authorization, lease, fence, boot)
    try:
        permit = await service.authorize_dispatch(
            boot_value, task_id, lease_value, fence_value, payload.attempt_id,
            payload.action, payload.proposal_digest,
        )
        return permit
    except (PermissionError, ValueError, LookupError) as error:
        _raise(error)


@router.post("/worker/tasks/{task_id}/start")
@limiter.limit("180/minute")
async def start_task(
    task_id: str,
    request: Request,
    authorization: str | None = Header(default=None),
    lease: str | None = Header(default=None, alias="X-Browser-Lease"),
    fence: int | None = Header(default=None, alias="X-Browser-Fence"),
    boot: str | None = Header(default=None, alias="X-Browser-Boot"),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    boot_value, lease_value, fence_value = _lease_headers(service, authorization, lease, fence, boot)
    try:
        active = await service.start(task_id, boot_value, lease_value, fence_value)
        if not active:
            raise HTTPException(status_code=409, detail="Browser task lease is no longer active")
        return {"active": True}
    except (PermissionError, ValueError) as error:
        _raise(error)


@router.post("/worker/tasks/{task_id}/renew")
@limiter.limit("180/minute")
async def renew_task(
    task_id: str,
    request: Request,
    authorization: str | None = Header(default=None),
    lease: str | None = Header(default=None, alias="X-Browser-Lease"),
    fence: int | None = Header(default=None, alias="X-Browser-Fence"),
    boot: str | None = Header(default=None, alias="X-Browser-Boot"),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    boot_value, lease_value, fence_value = _lease_headers(service, authorization, lease, fence, boot)
    try:
        state = await service.renew(task_id, boot_value, lease_value, fence_value)
        if state is None:
            raise HTTPException(status_code=409, detail="Browser task lease is no longer active")
        command = "stop" if state["cancelRequested"] or state["state"] == "stopping" else state.get("requestedControl")
        return {"active": True, "command": command, "decision": state.get("decision")}
    except (PermissionError, ValueError) as error:
        _raise(error)


@router.post("/worker/tasks/{task_id}/release")
@limiter.limit("60/minute")
async def release_unstarted_task(
    task_id: str,
    payload: BrowserWorkerRelease,
    request: Request,
    authorization: str | None = Header(default=None),
    lease: str | None = Header(default=None, alias="X-Browser-Lease"),
    fence: int | None = Header(default=None, alias="X-Browser-Fence"),
    boot: str | None = Header(default=None, alias="X-Browser-Boot"),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    boot_value, lease_value, fence_value = _lease_headers(service, authorization, lease, fence, boot)
    try:
        released = await service.release_unstarted(task_id, boot_value, lease_value, fence_value)
        if not released:
            raise HTTPException(status_code=409, detail="Only the current unstarted claim can be released")
        return {"released": True}
    except (PermissionError, ValueError) as error:
        _raise(error)


@router.post("/worker/tasks/{task_id}/events", response_model=BrowserWorkerEventsResponse)
@limiter.limit("180/minute")
async def read_worker_events(
    task_id: str,
    payload: BrowserWorkerEventsRequest,
    request: Request,
    authorization: str | None = Header(default=None),
    lease: str | None = Header(default=None, alias="X-Browser-Lease"),
    fence: int | None = Header(default=None, alias="X-Browser-Fence"),
    boot: str | None = Header(default=None, alias="X-Browser-Boot"),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    _lease_headers(service, authorization, lease, fence, boot)
    try:
        page = await service.read_worker_events(task_id, boot, lease, fence, payload.after)
        if page is None:
            raise HTTPException(status_code=409, detail="Browser task lease is no longer active")
        return page
    except (PermissionError, ValueError) as error:
        _raise(error)


@router.post("/worker/tasks/{task_id}/reconcile")
@limiter.limit("60/minute")
async def reconcile_task(
    task_id: str,
    payload: BrowserWorkerReconcile,
    request: Request,
    authorization: str | None = Header(default=None),
    boot: str | None = Header(default=None, alias="X-Browser-Boot"),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    _worker_context(service, authorization)
    if not boot:
        raise HTTPException(status_code=400, detail="Current X-Browser-Boot is required")
    try:
        if not await service.reconcile(boot, task_id, payload):
            raise HTTPException(status_code=409, detail="Reconciliation does not match an interrupted task")
        return {"recorded": True}
    except (PermissionError, ValueError) as error:
        _raise(error)


@router.post("/worker/tasks/{task_id}/publish-events")
@limiter.limit("180/minute")
async def publish_worker_events(
    task_id: str,
    payload: BrowserWorkerEventsPublishRequest,
    request: Request,
    authorization: str | None = Header(default=None),
    lease: str | None = Header(default=None, alias="X-Browser-Lease"),
    fence: int | None = Header(default=None, alias="X-Browser-Fence"),
    boot: str | None = Header(default=None, alias="X-Browser-Boot"),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    _lease_headers(service, authorization, lease, fence, boot)
    try:
        events = [item.model_dump(by_alias=True) for item in payload.events]
        accepted = await service.append_events(task_id, boot, lease, fence, events)
        if not accepted:
            raise HTTPException(status_code=409, detail="Browser task lease is no longer active")
        return {"accepted": len(events)}
    except (PermissionError, ValueError) as error:
        _raise(error)


@router.post("/worker/tasks/{task_id}/complete")
@limiter.limit("180/minute")
async def complete_task(
    task_id: str,
    payload: BrowserWorkerCompletion,
    request: Request,
    authorization: str | None = Header(default=None),
    lease: str | None = Header(default=None, alias="X-Browser-Lease"),
    fence: int | None = Header(default=None, alias="X-Browser-Fence"),
    boot: str | None = Header(default=None, alias="X-Browser-Boot"),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    _lease_headers(service, authorization, lease, fence, boot)
    try:
        if not await service.complete(task_id, boot, lease, fence, payload):
            raise HTTPException(status_code=409, detail="Browser task lease is no longer active")
        return {"accepted": True}
    except (PermissionError, ValueError) as error:
        _raise(error)


@router.post("/worker/tasks/{task_id}/proposal", response_model=BrowserPublished)
@limiter.limit("60/minute")
async def publish_proposal(
    task_id: str, payload: BrowserProposalPublish, request: Request,
    authorization: str | None = Header(default=None),
    lease: str | None = Header(default=None, alias="X-Browser-Lease"),
    fence: int | None = Header(default=None, alias="X-Browser-Fence"),
    boot: str | None = Header(default=None, alias="X-Browser-Boot"),
    service: BrowserTaskService = Depends(get_browser_task_service),
):
    boot, lease, fence = _lease_headers(service, authorization, lease, fence, boot)
    try:
        if not await service.publish_proposal(task_id, boot, lease, fence, payload):
            raise PermissionError("Proposal lease is stale")
        return {"published": True}
    except (PermissionError, ValueError, LookupError) as error:
        _raise(error)


@router.post("/{task_id}/reviews/{action_id}", response_model=BrowserRecorded)
@limiter.limit("30/minute")
async def decide_review(
    task_id: str, action_id: str, payload: BrowserReviewDecision, request: Request,
    device_id: str | None = Header(default=None, alias="X-Phone-Device"),
    session_header: str | None = Header(default=None, alias="X-Browser-Session"),
    user: dict = Depends(get_current_user), service: BrowserTaskService = Depends(get_browser_task_service),
):
    require_same_origin(request)
    device, session = _device_header(device_id), _session_header(session_header)
    if session != str(payload.browser_session_id):
        raise HTTPException(status_code=409, detail="Browser session body and header do not match")
    try:
        await service.decide_review(owner_id_from_user(user), device, session, task_id, action_id,
                                    payload.proposal_digest, payload.approved)
        return {"recorded": True}
    except (PermissionError, ValueError, LookupError) as error:
        _raise(error)


@router.post("/review-access/consume", response_model=BrowserReviewAccessReceipt)
@limiter.limit("10/minute")
async def consume_review_access(
    payload: BrowserReviewConsume, request: Request,
    device_id: str | None = Header(default=None, alias="X-Phone-Device"),
    session_header: str | None = Header(default=None, alias="X-Browser-Session"),
    user: dict = Depends(get_current_user), service: BrowserTaskService = Depends(get_browser_task_service),
):
    require_same_origin(request)
    device, session = _device_header(device_id), _session_header(session_header)
    if session != str(payload.browser_session_id):
        raise HTTPException(status_code=409, detail="Browser session body and header do not match")
    try:
        return await service.consume_review_access(owner_id_from_user(user), device, session, payload.token)
    except (PermissionError, ValueError, LookupError) as error:
        _raise(error)


def _discord_bridge(authorization):
    credential = bearer_credential(authorization, label="Discord bridge")
    expected = os.getenv("ASCEND_DISCORD_BRIDGE_TOKEN") or ""
    others = [os.getenv(name) or "" for name in ("ASCEND_BROWSER_WORKER_TOKEN", "ASCEND_PHONE_WORKER_TOKEN",
              "ASCEND_CONTEXT_PUBLISHER_TOKEN", "ASCEND_NOTIFICATION_WORKER_TOKEN", "CRON_SECRET")]
    if not expected or not secrets.compare_digest(expected, credential) or expected in others:
        raise HTTPException(status_code=403, detail="Discord bridge credential rejected")


@router.post("/bridge/discord/start", response_model=BrowserDiscordConsent | BrowserDiscordStarted)
@limiter.limit("20/minute")
async def discord_start(payload: BrowserDiscordStart, request: Request,
                        authorization: str | None = Header(default=None),
                        service: BrowserTaskService = Depends(get_browser_task_service)):
    _discord_bridge(authorization)
    try:
        return await service.discord_start(payload)
    except (PermissionError, ValueError, LookupError, OverflowError) as error:
        _raise(error)


@router.post("/bridge/discord/status", response_model=BrowserTaskView)
@limiter.limit("60/minute")
async def discord_status(payload: BrowserDiscordTask, request: Request,
                         authorization: str | None = Header(default=None),
                         service: BrowserTaskService = Depends(get_browser_task_service)):
    _discord_bridge(authorization)
    try:
        return await service.discord_operation("status", payload.discord_user_id, str(payload.task_id))
    except (PermissionError, ValueError, LookupError) as error:
        _raise(error)


@router.post("/bridge/discord/stop", response_model=BrowserStatusReceipt)
@limiter.limit("30/minute")
async def discord_stop(payload: BrowserDiscordTask, request: Request,
                       authorization: str | None = Header(default=None),
                       service: BrowserTaskService = Depends(get_browser_task_service)):
    _discord_bridge(authorization)
    try:
        return await service.discord_operation("stop", payload.discord_user_id, str(payload.task_id))
    except (PermissionError, ValueError, LookupError) as error:
        _raise(error)


@router.post("/bridge/discord/ack", response_model=BrowserAcknowledged)
@limiter.limit("30/minute")
async def discord_ack(payload: BrowserDiscordTask, request: Request,
                      authorization: str | None = Header(default=None),
                      service: BrowserTaskService = Depends(get_browser_task_service)):
    _discord_bridge(authorization)
    try:
        return await service.discord_operation("ack", payload.discord_user_id, str(payload.task_id))
    except (PermissionError, ValueError, LookupError) as error:
        _raise(error)


@router.post("/bridge/discord/review-link", response_model=BrowserReviewLinkReceipt)
@limiter.limit("10/minute")
async def discord_review_link(payload: BrowserDiscordTask, request: Request,
                              authorization: str | None = Header(default=None),
                              service: BrowserTaskService = Depends(get_browser_task_service)):
    _discord_bridge(authorization)
    try:
        return await service.discord_operation("review-link", payload.discord_user_id, str(payload.task_id))
    except (PermissionError, ValueError, LookupError) as error:
        _raise(error)


@router.post("/bridge/discord/end-session", response_model=BrowserEnded)
@limiter.limit("20/minute")
async def discord_end_session(payload: BrowserDiscordUser, request: Request,
                              authorization: str | None = Header(default=None),
                              service: BrowserTaskService = Depends(get_browser_task_service)):
    _discord_bridge(authorization)
    try:
        return await service.discord_operation("end-session", payload.discord_user_id)
    except (PermissionError, ValueError, LookupError) as error:
        _raise(error)


@router.post("/bridge/discord/availability", response_model=BrowserDiscordAvailability)
@limiter.limit("60/minute")
async def discord_availability(payload: BrowserDiscordUser, request: Request,
                               authorization: str | None = Header(default=None),
                               service: BrowserTaskService = Depends(get_browser_task_service)):
    _discord_bridge(authorization)
    try:
        return await service.discord_operation("availability", payload.discord_user_id)
    except (PermissionError, ValueError, LookupError) as error:
        _raise(error)
