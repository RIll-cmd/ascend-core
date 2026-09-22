"""Authenticated producer and reader routes for the normalized status shelf."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from schemas.service_status import ServiceStatusEvent, StatusShelfResponse
from services.status_service import StatusService, get_status_service

router = APIRouter(prefix="/api/status", tags=["status"])


def producer_rate_key(request: Request) -> str:
    credential = request.headers.get("X-Status-Credential", "")
    credential_id = credential.partition(".")[0]
    return f"status-producer:{credential_id}" if credential_id else get_remote_address(request)


limiter = Limiter(key_func=producer_rate_key)


async def authenticate_status_producer(
    x_status_credential: str | None = Header(default=None),
) -> tuple[StatusService, object]:
    if not x_status_credential:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing status producer credential")
    service = get_status_service()
    try:
        producer = await service.authenticate_producer(x_status_credential)
    except PermissionError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid status producer credential") from error
    return service, producer


async def authenticate_status_shelf_reader(
    x_status_read_credential: str | None = Header(default=None),
) -> object:
    if not x_status_read_credential:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Shelf read credential")
    try:
        return await get_status_service().authenticate_shelf_reader(x_status_read_credential)
    except PermissionError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Shelf read credential") from error


@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("60/minute")
async def receive_status_event(
    request: Request,
    event: ServiceStatusEvent,
    identity: tuple[StatusService, object] = Depends(authenticate_status_producer),
):
    service, producer = identity
    try:
        service.assert_producer_owns_event(producer, event.service_id, event.instance_id)
    except PermissionError as error:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Producer cannot write this service instance") from error
    result = await service.ingest_event(event)
    return {"accepted": not result.duplicate and not result.out_of_order, "duplicate": result.duplicate, "outOfOrder": result.out_of_order}


@router.get("/shelf", response_model=StatusShelfResponse)
async def read_status_shelf(shelf_reader: object = Depends(authenticate_status_shelf_reader)):
    return await get_status_service().shelf()
