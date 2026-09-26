"""Authenticated PWA and dedicated outbound-worker endpoints for phone chat."""
from __future__ import annotations

import asyncio
import json
import os
import secrets
from datetime import datetime, timezone
from typing import AsyncIterator

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response
from fastapi.responses import StreamingResponse
from pydantic import ValidationError
from slowapi import Limiter
from slowapi.util import get_remote_address

from auth_utils import get_current_user
from db import db
from schemas.phone_chat import (
    ConsumeDiscordPairingRequest, CreateDiscordPairingResponse, VerifyDiscordLinkRequest,
    PhoneChatDeviceResponse, PhoneChatMessageAccepted, PhoneChatMessageRequest,
    PhoneChatMessageStatus, PhoneChatTombstoneResponse, PhoneChatWorkerJob,
    PhoneChatWorkerResult,
)
from services.phone_chat_queue import PhoneChatQueue
from services.phone_chat_pairing import PhoneChatPairing
from services.phone_chat_repository import PhoneChatTombstone, PostgresPhoneChatRepository

router = APIRouter(prefix="/api/phone-chat", tags=["phone-chat"])
limiter = Limiter(key_func=get_remote_address)


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def get_phone_chat_queue() -> PhoneChatQueue:
    return PhoneChatQueue(
        PostgresPhoneChatRepository(db),
        owner_id=os.getenv("ASCEND_PHONE_OWNER_ID"),
        worker_token=os.getenv("ASCEND_PHONE_WORKER_TOKEN"),
    )


async def get_phone_chat_pairing() -> PhoneChatPairing:
    return PhoneChatPairing(
        db, owner_id=os.getenv("ASCEND_PHONE_OWNER_ID"),
        hmac_secret=os.getenv("ASCEND_DISCORD_PAIRING_HMAC_SECRET"),
        bridge_token=os.getenv("ASCEND_DISCORD_BRIDGE_TOKEN"),
    )


def _require_discord_bridge(authorization: str | None) -> None:
    credential = _worker_credential(authorization)
    expected = os.getenv("ASCEND_DISCORD_BRIDGE_TOKEN") or ""
    worker_token = os.getenv("ASCEND_PHONE_WORKER_TOKEN") or ""
    if (not expected or (worker_token and secrets.compare_digest(expected, worker_token))
            or not secrets.compare_digest(credential, expected)):
        raise HTTPException(status_code=403, detail="Discord bridge credential rejected")


def _require_same_origin(request: Request) -> None:
    # Cookie-authenticated writes require an explicit trusted Origin. Bearer
    # clients are not ambiently authenticated by browsers and use normal CORS.
    if request.headers.get("authorization", "").lower().startswith("bearer "):
        return
    origin = request.headers.get("origin")
    if not origin:
        raise HTTPException(status_code=403, detail="Origin is required for cookie-authenticated writes")
    allowed = {
        value.strip().rstrip("/") for value in [
            os.getenv("FRONTEND_URL", ""),
            "http://localhost:3000", "http://127.0.0.1:3000",
            "http://localhost:3001", "http://127.0.0.1:3001",
            "http://localhost:3002", "http://127.0.0.1:3002",
            "https://ai-habit-omega.vercel.app", "https://ai-habit.vercel.app",
            "https://ascend-core.vercel.app", "https://ascend-os.vercel.app",
        ] if value.strip()
    }
    origin_clean = origin.rstrip("/")
    if origin_clean in allowed:
        return
    if os.getenv("ENVIRONMENT") == "staging" and (
        origin_clean.startswith("https://ascend-core") and origin_clean.endswith(".vercel.app")
    ):
        return
    raise HTTPException(status_code=403, detail="Origin is not allowed")


def _user_id(user: dict) -> str:
    value = user.get("id")
    if not value:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return str(value)


def _raise_http(error: Exception) -> None:
    if isinstance(error, PermissionError):
        raise HTTPException(status_code=403, detail=str(error))
    if isinstance(error, LookupError):
        raise HTTPException(status_code=404, detail=str(error))
    if isinstance(error, OverflowError):
        raise HTTPException(status_code=429, detail=str(error))
    if isinstance(error, ValueError):
        raise HTTPException(status_code=409, detail=str(error))
    raise error


def _message_status(job) -> PhoneChatMessageStatus:
    return PhoneChatMessageStatus(
        messageId=job.message_id, status=job.status, expiresAt=job.expires_at,
        reply=job.reply if job.status == "completed" else None,
        errorCode=job.error_code if job.status == "failed" else None,
    )


def _worker_credential(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Worker bearer credential required")
    return authorization[7:]


@router.post("/discord/pairing-codes", response_model=CreateDiscordPairingResponse, status_code=201)
@limiter.limit("5/minute")
async def create_discord_pairing_code(
    request: Request,
    response: Response,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
    pairing: PhoneChatPairing = Depends(get_phone_chat_pairing),
):
    _require_same_origin(request)
    owner_id = _user_id(user)
    try:
        await queue._active_device(owner_id, device_id)
        value = await pairing.create_pairing(owner_id)
        response.headers["Cache-Control"] = "no-store"
        return value
    except PermissionError as error:
        _raise_http(error)


@router.get("/discord/link")
@limiter.limit("60/minute")
async def discord_link_status(
    request: Request,
    response: Response,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
    pairing: PhoneChatPairing = Depends(get_phone_chat_pairing),
):
    owner_id = _user_id(user)
    try:
        await queue._active_device(owner_id, device_id)
        response.headers["Cache-Control"] = "no-store"
        return {"linked": await pairing.link_status(owner_id)}
    except PermissionError as error:
        _raise_http(error)


@router.delete("/discord/link", status_code=204)
@limiter.limit("10/minute")
async def revoke_discord_link(
    request: Request,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
    pairing: PhoneChatPairing = Depends(get_phone_chat_pairing),
):
    _require_same_origin(request)
    owner_id = _user_id(user)
    try:
        await queue._active_device(owner_id, device_id)
        await pairing.revoke_link(owner_id)
        return Response(status_code=204)
    except PermissionError as error:
        _raise_http(error)


@router.post("/worker/discord/consume-link")
@limiter.limit("30/minute")
async def consume_discord_link(
    request: Request,
    authorization: str | None = Header(default=None),
    pairing: PhoneChatPairing = Depends(get_phone_chat_pairing),
):
    _require_discord_bridge(authorization)
    try:
        payload = ConsumeDiscordPairingRequest.model_validate(await request.json())
        if await pairing.consume_pairing(payload.code, payload.discord_user_id):
            return {"linked": True}
    except (PermissionError, ValidationError, ValueError):
        pass
    raise HTTPException(status_code=400, detail="Pairing unavailable")


@router.post("/worker/discord/verify-link")
@limiter.limit("120/minute")
async def verify_discord_link(
    request: Request,
    authorization: str | None = Header(default=None),
    pairing: PhoneChatPairing = Depends(get_phone_chat_pairing),
):
    _require_discord_bridge(authorization)
    try:
        payload = VerifyDiscordLinkRequest.model_validate(await request.json())
        owner_id = await pairing.verify_link(payload.discord_user_id)
        return {"linked": True, "ownerId": owner_id} if owner_id else {"linked": False}
    except PermissionError:
        raise HTTPException(status_code=503, detail="Discord pairing unavailable")
    except (ValidationError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid verification request")


@router.post("/devices", response_model=PhoneChatDeviceResponse, status_code=201)
@limiter.limit("10/minute")
async def register_device(
    request: Request,
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    _require_same_origin(request)
    try:
        device = await queue.register_device(_user_id(user))
        return PhoneChatDeviceResponse(deviceId=device.id)
    except (PermissionError, ValueError, OverflowError) as error:
        _raise_http(error)


@router.delete("/devices/{device_id}", status_code=204)
@limiter.limit("10/minute")
async def revoke_device(
    device_id: str,
    request: Request,
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    _require_same_origin(request)
    try:
        if not await queue.revoke_device(_user_id(user), device_id):
            raise HTTPException(status_code=404, detail="Phone chat device not found")
        return Response(status_code=204)
    except (PermissionError, ValueError, OverflowError) as error:
        _raise_http(error)


@router.post("/messages", response_model=PhoneChatMessageAccepted, status_code=202)
@limiter.limit("20/minute")
async def enqueue_message(
    payload: PhoneChatMessageRequest,
    request: Request,
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    _require_same_origin(request)
    try:
        job = await queue.enqueue(_user_id(user), payload.device_id, str(payload.message_id),
                                  payload.session_id, payload.text)
        return PhoneChatMessageAccepted(messageId=job.message_id, status="queued", expiresAt=job.expires_at)
    except (PermissionError, ValueError, OverflowError) as error:
        _raise_http(error)


@router.get("/messages/{message_id}", response_model=PhoneChatMessageStatus | PhoneChatTombstoneResponse)
@limiter.limit("120/minute")
async def read_message(
    message_id: str,
    request: Request,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    try:
        value = await queue.get_for_device(_user_id(user), device_id, message_id)
        if isinstance(value, PhoneChatTombstone):
            return PhoneChatTombstoneResponse(messageId=value.message_id, status=value.status,
                                              expiresAt=value.expires_at)
        return _message_status(value)
    except (PermissionError, LookupError, ValueError) as error:
        _raise_http(error)


@router.post("/messages/{message_id}/ack", response_model=PhoneChatTombstoneResponse)
@limiter.limit("30/minute")
async def acknowledge_message(
    message_id: str,
    request: Request,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    _require_same_origin(request)
    try:
        value = await queue.acknowledge(_user_id(user), device_id, message_id)
        return PhoneChatTombstoneResponse(messageId=value.message_id, status=value.status,
                                          expiresAt=value.expires_at)
    except (PermissionError, LookupError, ValueError) as error:
        _raise_http(error)


@router.get("/events")
@limiter.limit("10/minute")
async def events(
    request: Request,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    owner_id = _user_id(user)
    try:
        await queue._active_device(owner_id, device_id)
    except (PermissionError, ValueError) as error:
        _raise_http(error)

    async def stream() -> AsyncIterator[str]:
        last_state: dict[str, str] = {}
        for _ in range(30):
            for job in await queue.repository.list_jobs():
                if job.owner_id != owner_id or job.device_id != device_id:
                    continue
                if last_state.get(job.message_id) == job.status:
                    continue
                last_state[job.message_id] = job.status
                payload = _message_status(job).model_dump(mode="json", by_alias=True)
                yield f"event: message\ndata: {json.dumps(payload, separators=(',', ':'))}\n\n"
            yield ": keep-alive\n\n"
            await asyncio.sleep(2)

    return StreamingResponse(stream(), media_type="text/event-stream", headers={
        "Cache-Control": "no-store, no-cache, must-revalidate", "X-Accel-Buffering": "no",
    })


@router.post("/worker/claim", response_model=PhoneChatWorkerJob | None)
@limiter.limit("120/minute")
async def claim_job(
    request: Request,
    authorization: str | None = Header(default=None),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    credential = _worker_credential(authorization)
    try:
        job = await queue.claim(credential)
        if job is None:
            return Response(status_code=204)
        return PhoneChatWorkerJob(
            messageId=job.message_id, ownerId=job.owner_id, deviceId=job.device_id,
            sessionId=job.session_id, text=job.text, expiresAt=job.expires_at,
            attempt=job.attempt, leaseId=job.lease_id, leaseExpiresAt=job.lease_expires_at,
        )
    except PermissionError as error:
        _raise_http(error)


@router.post("/worker/jobs/{message_id}/start", status_code=204)
@limiter.limit("180/minute")
async def start_job(
    message_id: str,
    request: Request,
    lease_id: str = Header(alias="X-Phone-Lease"),
    authorization: str | None = Header(default=None),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    try:
        if not await queue.start(_worker_credential(authorization), message_id, lease_id):
            raise HTTPException(status_code=409, detail="Phone chat lease is no longer active")
        return Response(status_code=204)
    except PermissionError as error:
        _raise_http(error)


@router.post("/worker/jobs/{message_id}/renew", status_code=204)
@limiter.limit("180/minute")
async def renew_job(
    message_id: str,
    request: Request,
    lease_id: str = Header(alias="X-Phone-Lease"),
    authorization: str | None = Header(default=None),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    try:
        if not await queue.renew(_worker_credential(authorization), message_id, lease_id):
            raise HTTPException(status_code=409, detail="Phone chat lease is no longer active")
        return Response(status_code=204)
    except PermissionError as error:
        _raise_http(error)


@router.post("/worker/jobs/{message_id}/complete", status_code=204)
@limiter.limit("180/minute")
async def complete_job(
    message_id: str,
    payload: PhoneChatWorkerResult,
    request: Request,
    lease_id: str = Header(alias="X-Phone-Lease"),
    authorization: str | None = Header(default=None),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    try:
        await queue.complete(_worker_credential(authorization), message_id, lease_id, payload)
        return Response(status_code=204)
    except (PermissionError, LookupError, ValueError) as error:
        _raise_http(error)
