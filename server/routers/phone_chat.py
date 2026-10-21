"""Authenticated PWA and dedicated outbound-worker endpoints for phone chat."""
from __future__ import annotations

import asyncio
import base64
import json
import os
import secrets
from datetime import datetime, timezone
from typing import AsyncIterator, Literal

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
from schemas.companion_context import CompanionContextPublishRequest
from schemas.companion_notifications import (
    NotificationOutcomeRequest, NotificationPreferenceRequest,
    NotificationPublishRequest, PushSubscriptionRequest,
)
from services.companion_context import (
    CompanionContextService, PostgresCompanionContextRepository,
    is_dedicated_publisher_credential,
)
from services.companion_notifications import CompanionNotificationService, PostgresNotificationRepository
from services.notification_crypto import NotificationCipher
from services.phone_chat_queue import PhoneChatQueue
from services.phone_chat_pairing import PhoneChatPairing
from services.phone_chat_repository import PhoneChatTombstone, PostgresPhoneChatRepository
from services.phone_access import bearer_credential, owner_id_from_user, require_same_origin

router = APIRouter(prefix="/api/phone-chat", tags=["phone-chat"])
limiter = Limiter(key_func=get_remote_address)
MAX_PHONE_AUDIO_BYTES = 5 * 1024 * 1024


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def get_phone_chat_queue() -> PhoneChatQueue:
    return PhoneChatQueue(
        PostgresPhoneChatRepository(db),
        owner_id=os.getenv("ASCEND_PHONE_OWNER_ID"),
        worker_token=os.getenv("ASCEND_PHONE_WORKER_TOKEN"),
    )


@router.post("/audio", response_model=PhoneChatMessageAccepted, status_code=202)
@limiter.limit("5/minute")
async def enqueue_phone_audio(
    request: Request,
    response: Response,
    device_id: str = Query(alias="deviceId"),
    message_id: str = Query(alias="messageId"),
    session_id: str = Query(alias="sessionId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    _require_same_origin(request)
    if os.getenv("ASCEND_PHONE_AUDIO_ENABLED", "").strip().lower() != "true":
        raise HTTPException(status_code=503, detail="Phone audio uploads are disabled")
    if request.headers.get("x-audio-provider-consent") != "google-gemini":
        raise HTTPException(status_code=403, detail="Explicit Gemini audio consent is required")
    length = request.headers.get("content-length")
    if length and length.isdecimal() and int(length) > MAX_PHONE_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Voice recording exceeds 5 MiB")
    content_type = request.headers.get("content-type", "")
    parts = []
    total = 0
    async for part in request.stream():
        total += len(part)
        if total > MAX_PHONE_AUDIO_BYTES:
            raise HTTPException(status_code=413, detail="Voice recording exceeds 5 MiB")
        parts.append(part)
    body = b"".join(parts)
    try:
        job = await queue.enqueue_audio(_user_id(user), device_id, message_id, session_id, body, content_type)
    except (PermissionError, LookupError, OverflowError, ValueError) as error:
        _raise_http(error)
    response.headers["Cache-Control"] = "no-store"
    return PhoneChatMessageAccepted(messageId=job.message_id, status="queued", expiresAt=job.expires_at)


@router.post("/messages/{message_id}/cancel", status_code=204)
@limiter.limit("20/minute")
async def cancel_phone_message(
    message_id: str,
    request: Request,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
):
    _require_same_origin(request)
    try:
        await queue.cancel(_user_id(user), device_id, message_id)
        return Response(status_code=204)
    except (PermissionError, LookupError, ValueError) as error:
        _raise_http(error)


async def get_phone_chat_pairing() -> PhoneChatPairing:
    return PhoneChatPairing(
        db, owner_id=os.getenv("ASCEND_PHONE_OWNER_ID"),
        hmac_secret=os.getenv("ASCEND_DISCORD_PAIRING_HMAC_SECRET"),
        bridge_token=os.getenv("ASCEND_DISCORD_BRIDGE_TOKEN"),
        worker_token=os.getenv("ASCEND_PHONE_WORKER_TOKEN"),
    )


def _context_sharing_enabled() -> bool:
    return os.getenv("ASCEND_CONTEXT_SHARING_ENABLED", "").strip().lower() == "true"


async def get_companion_context_service() -> CompanionContextService:
    if not _context_sharing_enabled():
        raise HTTPException(status_code=503, detail="Laptop context sharing is disabled")
    owner_id = os.getenv("ASCEND_CONTEXT_OWNER_ID", "").strip()
    device_id = os.getenv("ASCEND_CONTEXT_DEVICE_ID", "").strip()
    if not owner_id or not device_id:
        raise HTTPException(status_code=503, detail="Laptop context is not configured")
    return CompanionContextService(PostgresCompanionContextRepository(db),
                                   owner_id=owner_id, device_id=device_id)


async def get_companion_notification_service() -> CompanionNotificationService:
    if os.getenv("ASCEND_COMPANION_NOTIFICATIONS_ENABLED", "").strip().lower() != "true":
        raise HTTPException(status_code=503, detail="Companion notifications are disabled")
    owner_id = os.getenv("ASCEND_PHONE_OWNER_ID", "").strip()
    worker_token = os.getenv("ASCEND_NOTIFICATION_WORKER_TOKEN", "").strip()
    if not owner_id or not worker_token:
        raise HTTPException(status_code=503, detail="Companion notification worker is not configured")
    other_tokens = tuple(os.getenv(name, "").strip() for name in (
        "ASCEND_PHONE_WORKER_TOKEN", "ASCEND_CONTEXT_PUBLISHER_TOKEN",
        "ASCEND_DISCORD_BRIDGE_TOKEN", "CRON_SECRET",
    ))
    if any(worker_token == value for value in other_tokens if value):
        raise HTTPException(status_code=503, detail="Notification worker credential must be dedicated")
    try:
        cipher = NotificationCipher.from_environment()
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail="Notification encryption is not configured") from error
    try:
        daily_limit = int(os.getenv("ASCEND_NOTIFICATION_DAILY_LIMIT", "5"))
    except ValueError as error:
        raise HTTPException(status_code=503, detail="Notification budget configuration is invalid") from error
    return CompanionNotificationService(
        PostgresNotificationRepository(db, cipher), owner_id=owner_id,
        worker_token=worker_token, daily_limit=daily_limit,
    )


def _require_context_publisher(authorization: str | None) -> None:
    credential = _worker_credential(authorization)
    expected = os.getenv("ASCEND_CONTEXT_PUBLISHER_TOKEN", "").strip()
    other_credentials = (
        "ASCEND_STATUS_READ_CREDENTIAL", "ASCEND_PHONE_WORKER_TOKEN",
        "ASCEND_DISCORD_BRIDGE_TOKEN", "ASCEND_DISCORD_PAIRING_HMAC_SECRET", "CRON_SECRET",
    )
    others = tuple(os.getenv(name, "").strip() for name in other_credentials)
    if not is_dedicated_publisher_credential(credential, expected, others):
        raise HTTPException(status_code=403, detail="Context publisher credential rejected")


def _require_notification_publisher(authorization: str | None) -> None:
    credential = _worker_credential(authorization)
    expected = os.getenv("ASCEND_NOTIFICATION_PUBLISHER_TOKEN", "").strip()
    others = tuple(os.getenv(name, "").strip() for name in (
        "ASCEND_NOTIFICATION_WORKER_TOKEN", "ASCEND_PHONE_WORKER_TOKEN",
        "ASCEND_CONTEXT_PUBLISHER_TOKEN", "ASCEND_STATUS_READ_CREDENTIAL",
        "ASCEND_DISCORD_BRIDGE_TOKEN", "CRON_SECRET",
    ))
    if not is_dedicated_publisher_credential(credential, expected, others):
        raise HTTPException(status_code=403, detail="Notification publisher credential rejected")


def _notification_publisher_dependency(authorization: str | None = Header(default=None)) -> str:
    _require_notification_publisher(authorization)
    return _worker_credential(authorization)


def _notification_worker_dependency(authorization: str | None = Header(default=None)) -> str:
    credential = _worker_credential(authorization)
    expected = os.getenv("ASCEND_NOTIFICATION_WORKER_TOKEN", "").strip()
    if not expected:
        raise HTTPException(status_code=503, detail="Notification worker is not configured")
    if not secrets.compare_digest(credential, expected):
        raise HTTPException(status_code=403, detail="Notification worker credential rejected")
    return credential


def _require_discord_bridge(authorization: str | None) -> None:
    credential = _worker_credential(authorization)
    expected = os.getenv("ASCEND_DISCORD_BRIDGE_TOKEN") or ""
    worker_token = os.getenv("ASCEND_PHONE_WORKER_TOKEN") or ""
    if (not expected or (worker_token and secrets.compare_digest(expected, worker_token))
            or not secrets.compare_digest(credential, expected)):
        raise HTTPException(status_code=403, detail="Discord bridge credential rejected")


def _require_same_origin(request: Request) -> None:
    require_same_origin(request)


def _user_id(user: dict) -> str:
    return owner_id_from_user(user)


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
    return bearer_credential(authorization)


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


@router.post("/context/publish", status_code=202)
@limiter.limit("20/minute")
async def publish_companion_context(
    request: Request,
    authorization: str | None = Header(default=None),
    service: CompanionContextService = Depends(get_companion_context_service),
):
    _require_context_publisher(authorization)
    body = await request.body()
    if len(body) > 4 * 1024:
        raise HTTPException(status_code=413, detail="Context payload exceeds 4 KiB")
    try:
        payload = CompanionContextPublishRequest.model_validate(json.loads(body))
        record = await service.publish(payload)
    except (json.JSONDecodeError, ValidationError) as error:
        raise HTTPException(status_code=400, detail="Invalid laptop context payload") from error
    except (PermissionError, ValueError) as error:
        _raise_http(error)
    return {"accepted": True, "snapshotId": record.snapshot.get("snapshotId")}


@router.get("/context")
@limiter.limit("60/minute")
async def read_phone_companion_context(
    request: Request,
    response: Response,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
    service: CompanionContextService = Depends(get_companion_context_service),
):
    owner_id = _user_id(user)
    try:
        await queue._active_device(owner_id, device_id)
        result = await service.read(owner_id)
        response.headers["Cache-Control"] = "no-store"
        return result
    except (PermissionError, ValueError) as error:
        _raise_http(error)


@router.get("/notifications/push-config")
async def companion_push_config():
    enabled = os.getenv("ASCEND_COMPANION_NOTIFICATIONS_ENABLED", "").strip().lower() == "true"
    public_key = os.getenv("ASCEND_VAPID_PUBLIC_KEY", "").strip() or None
    return {"enabled": enabled, "vapidPublicKey": public_key if enabled else None}


@router.get("/notifications/preferences")
@limiter.limit("60/minute")
async def get_companion_notification_preferences(
    request: Request,
    response: Response,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
    service: CompanionNotificationService = Depends(get_companion_notification_service),
):
    owner_id = _user_id(user)
    try:
        await queue._active_device(owner_id, device_id)
        response.headers["Cache-Control"] = "no-store"
        return await service.get_preferences(owner_id)
    except (PermissionError, ValueError) as error:
        _raise_http(error)


@router.put("/notifications/preferences")
@limiter.limit("10/minute")
async def set_companion_notification_preference(
    payload: NotificationPreferenceRequest,
    request: Request,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
    service: CompanionNotificationService = Depends(get_companion_notification_service),
):
    _require_same_origin(request)
    owner_id = _user_id(user)
    try:
        await queue._active_device(owner_id, device_id)
        await service.set_preference(owner_id, payload.channel, payload.enabled)
        return {"channel": payload.channel, "enabled": payload.enabled}
    except (PermissionError, ValueError) as error:
        _raise_http(error)


@router.put("/notifications/push-subscription", status_code=204)
@limiter.limit("5/minute")
async def register_companion_push_subscription(
    payload: PushSubscriptionRequest,
    request: Request,
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
    service: CompanionNotificationService = Depends(get_companion_notification_service),
):
    _require_same_origin(request)
    owner_id = _user_id(user)
    try:
        await queue._active_device(owner_id, payload.device_id)
        await service.register_push(owner_id, payload.device_id, endpoint=payload.endpoint,
                                    p256dh=payload.keys.p256dh, auth=payload.keys.auth)
        return Response(status_code=204)
    except (PermissionError, ValueError) as error:
        _raise_http(error)


@router.delete("/notifications/push-subscription", status_code=204)
@limiter.limit("10/minute")
async def revoke_companion_push_subscription(
    request: Request,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
    service: CompanionNotificationService = Depends(get_companion_notification_service),
):
    _require_same_origin(request)
    owner_id = _user_id(user)
    try:
        await queue._active_device(owner_id, device_id)
        await service.revoke_push(owner_id, device_id)
        return Response(status_code=204)
    except (PermissionError, ValueError) as error:
        _raise_http(error)


@router.get("/notifications/{intent_id}")
@limiter.limit("60/minute")
async def read_companion_notification_detail(
    intent_id: str,
    request: Request,
    response: Response,
    device_id: str = Query(alias="deviceId"),
    user: dict = Depends(get_current_user),
    queue: PhoneChatQueue = Depends(get_phone_chat_queue),
    service: CompanionNotificationService = Depends(get_companion_notification_service),
):
    owner_id = _user_id(user)
    try:
        await queue._active_device(owner_id, device_id)
        result = await service.read_detail(owner_id, device_id, intent_id)
        response.headers["Cache-Control"] = "no-store"
        return result
    except (PermissionError, LookupError, ValueError) as error:
        _raise_http(error)


@router.post("/notifications/publish", status_code=202)
@limiter.limit("30/minute")
async def publish_companion_notification(
    payload: NotificationPublishRequest,
    request: Request,
    publisher_token: str = Depends(_notification_publisher_dependency),
    service: CompanionNotificationService = Depends(get_companion_notification_service),
):
    try:
        intent = await service.publish(service.owner_id, payload.trigger_key, payload.category, payload.detail,
                                       expires_at=payload.expires_at)
    except (PermissionError, ValueError, OverflowError) as error:
        _raise_http(error)
    return {"accepted": intent is not None, "intentId": intent.intent_id if intent else None}


@router.post("/worker/notifications/claim")
@limiter.limit("120/minute")
async def claim_companion_notification(
    request: Request,
    worker_token: str = Depends(_notification_worker_dependency),
    channel: Literal["pwa_push", "discord_dm"] | None = Query(default=None),
    service: CompanionNotificationService = Depends(get_companion_notification_service),
):
    try:
        result = await service.claim(worker_token, channel=channel)
        if result is None:
            return Response(status_code=204)
        return result
    except PermissionError as error:
        _raise_http(error)


@router.post("/worker/notifications/{delivery_id}/outcome")
@limiter.limit("120/minute")
async def record_companion_notification_outcome(
    delivery_id: str,
    payload: NotificationOutcomeRequest,
    request: Request,
    worker_token: str = Depends(_notification_worker_dependency),
    service: CompanionNotificationService = Depends(get_companion_notification_service),
):
    try:
        state = await service.record_outcome(worker_token, delivery_id,
                                             payload.claim_id, payload.outcome, retryable=payload.retryable,
                                             revoke_destination=payload.revoke_destination)
        return {"status": state}
    except (PermissionError, ValueError) as error:
        _raise_http(error)


@router.post("/worker/discord/context")
@limiter.limit("60/minute")
async def read_discord_companion_context(
    request: Request,
    response: Response,
    authorization: str | None = Header(default=None),
    pairing: PhoneChatPairing = Depends(get_phone_chat_pairing),
    service: CompanionContextService = Depends(get_companion_context_service),
):
    _require_discord_bridge(authorization)
    try:
        payload = VerifyDiscordLinkRequest.model_validate(await request.json())
        owner_id = await pairing.verify_link(payload.discord_user_id)
        if not owner_id:
            raise HTTPException(status_code=403, detail="Discord account is not linked")
        result = await service.read(owner_id)
        response.headers["Cache-Control"] = "no-store"
        return result
    except PermissionError as error:
        raise HTTPException(status_code=503, detail="Discord context authorization unavailable") from error
    except ValidationError as error:
        raise HTTPException(status_code=400, detail="Invalid Discord context request") from error


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
            sessionId=job.session_id, text=job.text or None,
            audioBase64=base64.b64encode(job.audio_data).decode("ascii") if job.audio_data else None,
            audioMimeType=job.audio_mime_type, expiresAt=job.expires_at,
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
