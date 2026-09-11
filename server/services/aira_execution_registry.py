"""Idempotent Phase B execution coordinator for future AIRA domain adapters."""

from typing import Any, Awaitable, Callable, Protocol

from fastapi import HTTPException, status
from schemas.aira_operations import AIRAOperationExecuteRequest
from services.aira_preview_registry import validate_aira_execution


class AIRAExecutionAuditStore(Protocol):
    async def reserve(
        self,
        actor_id: str,
        character_id: str,
        operation: str,
        request_id: str,
        metadata: dict[str, Any],
    ) -> tuple[bool, dict[str, Any]]: ...

    async def complete(self, actor_id: str, request_id: str, result: dict[str, Any]) -> dict[str, Any]: ...

    async def fail(self, actor_id: str, request_id: str, error: str) -> None: ...


OperationExecutor = Callable[[str, str, dict[str, Any]], Awaitable[dict[str, Any]]]


async def execute_confirmed_aira_operation(
    request: AIRAOperationExecuteRequest,
    current_user: dict[str, Any],
    execute: OperationExecutor,
    audit_store: AIRAExecutionAuditStore,
    *,
    secret: str | None = None,
) -> dict[str, Any]:
    """Execute one validated operation once and return prior result on retry."""
    claims = await validate_aira_execution(request, current_user, secret=secret)
    actor_id = claims["actorId"]
    reserved, audit = await audit_store.reserve(
        actor_id,
        request.characterId,
        request.operation,
        request.requestId,
        {"source": "aira", "confirmation": "signed_preview"},
    )
    if not reserved and audit["status"] == "COMPLETED":
        return {
            "success": True,
            "requestId": request.requestId,
            "operation": request.operation,
            "result": audit["result"],
            "idempotentReplay": True,
        }
    if not reserved:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This AIRA operation is already pending or failed; create a new preview to retry.",
        )

    try:
        result = await execute(request.operation, request.characterId, claims["normalizedArguments"])
    except Exception as error:
        await audit_store.fail(actor_id, request.requestId, type(error).__name__)
        raise
    await audit_store.complete(actor_id, request.requestId, result)
    return {
        "success": True,
        "requestId": request.requestId,
        "operation": request.operation,
        "result": result,
        "idempotentReplay": False,
    }
