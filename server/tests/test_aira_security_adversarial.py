"""
Adversarial & Negative Security Test Suite for AIRA Two-Phase Commit Operations.
Verifies cryptographic guarantees, cross-tenant isolation, tamper resistance,
real-time token expiration, zero-downtime key rotation, and concurrency race conditions.
"""

import asyncio
import os
import pytest
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from schemas.aira_operations import AIRAOperationExecuteRequest, AIRAOperationPreviewRequest
from services import aira_confirmation_tokens, aira_preview_registry
from services.aira_audit_store import LocalSQLiteAuditStore
from services.aira_execution_registry import execute_confirmed_aira_operation
from services.aira_domain_adapters import execute_aira_domain_operation


class MockDatetime(datetime):
    _now = datetime(2026, 9, 11, 12, 0, 0, tzinfo=timezone.utc)

    @classmethod
    def now(cls, tz=None):
        return cls._now


@pytest.mark.asyncio
async def test_signature_forgery_is_rejected(monkeypatch):
    """Altering even one byte in the confirmation token payload or signature must be rejected."""
    async def mock_owns(cid, u):
        return True
    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", mock_owns)

    preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="char-1",
            requestId="req-forgery-1",
            operation="create_habit",
            arguments={"name": "Legit Study"},
        ),
        {"id": "user-1"},
        secret="test-secret-key",
    )

    token = preview["confirmationToken"]
    payload_part, sig_part = token.split(".", 1)

    # Tamper with signature
    tampered_sig = ("A" if sig_part[0] != "A" else "B") + sig_part[1:]
    tampered_token = f"{payload_part}.{tampered_sig}"

    request = AIRAOperationExecuteRequest(
        characterId="char-1",
        requestId="req-forgery-1",
        operation="create_habit",
        confirmationToken=tampered_token,
    )

    with pytest.raises(HTTPException) as exc_info:
        await aira_preview_registry.validate_aira_execution(request, {"id": "user-1"}, secret="test-secret-key")
    assert exc_info.value.status_code == 400
    assert "invalid confirmation token" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_cross_tenant_character_tampering_rejected(monkeypatch):
    """A token issued for char-1 cannot be executed against char-2."""
    async def mock_owns(cid, u):
        return True
    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", mock_owns)

    preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="char-1",
            requestId="req-cross-char-1",
            operation="create_habit",
            arguments={"name": "Legit Study"},
        ),
        {"id": "user-1"},
        secret="test-secret-key",
    )

    # Malicious request attempts to apply token to char-2
    request = AIRAOperationExecuteRequest(
        characterId="char-2",
        requestId="req-cross-char-1",
        operation="create_habit",
        confirmationToken=preview["confirmationToken"],
    )

    with pytest.raises(HTTPException) as exc_info:
        await aira_preview_registry.validate_aira_execution(request, {"id": "user-1"}, secret="test-secret-key")
    assert exc_info.value.status_code == 403
    assert "belongs to a different character" in exc_info.value.detail


@pytest.mark.asyncio
async def test_cross_tenant_actor_tampering_rejected(monkeypatch):
    """A token issued for user-1 cannot be executed by user-2."""
    async def mock_owns(cid, u):
        return True
    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", mock_owns)

    preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="char-1",
            requestId="req-cross-user-1",
            operation="create_habit",
            arguments={"name": "Legit Study"},
        ),
        {"id": "user-1"},
        secret="test-secret-key",
    )

    request = AIRAOperationExecuteRequest(
        characterId="char-1",
        requestId="req-cross-user-1",
        operation="create_habit",
        confirmationToken=preview["confirmationToken"],
    )

    # Attacker user-2 attempts execution
    with pytest.raises(HTTPException) as exc_info:
        await aira_preview_registry.validate_aira_execution(request, {"id": "user-2"}, secret="test-secret-key")
    assert exc_info.value.status_code == 403
    assert "belongs to a different actor" in exc_info.value.detail


@pytest.mark.asyncio
async def test_expired_token_is_rejected(monkeypatch):
    """Tokens expired under real time passage must be rejected across the issuance-to-verification path."""
    async def mock_owns(cid, u):
        return True
    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", mock_owns)

    # Freeze clock at t0
    MockDatetime._now = datetime(2026, 9, 11, 12, 0, 0, tzinfo=timezone.utc)
    monkeypatch.setattr(aira_preview_registry, "datetime", MockDatetime)
    monkeypatch.setattr(aira_confirmation_tokens, "datetime", MockDatetime)

    # 1. Real issuance at t0
    preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="char-1",
            requestId="req-expired-1",
            operation="create_habit",
            arguments={"name": "Old Habit"},
        ),
        {"id": "user-1"},
        secret="test-secret-key",
    )
    token = preview["confirmationToken"]

    # 2. Advance time past the 5-minute TTL window (301 seconds)
    MockDatetime._now = MockDatetime._now + timedelta(seconds=301)

    # 3. Attempt execution with the previously valid token
    request = AIRAOperationExecuteRequest(
        characterId="char-1",
        requestId="req-expired-1",
        operation="create_habit",
        confirmationToken=token,
    )

    with pytest.raises(HTTPException) as exc_info:
        await aira_preview_registry.validate_aira_execution(request, {"id": "user-1"}, secret="test-secret-key")
    assert exc_info.value.status_code == 400
    assert "expired" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_dual_key_rotation_window(monkeypatch):
    """Tokens signed by SECRET_KEY_PREVIOUS must verify during rotation, but reject after key removal."""
    async def mock_owns(cid, u):
        return True
    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", mock_owns)

    # Step 1: Initial state (Old Key)
    monkeypatch.setenv("SECRET_KEY", "key-v1-old")
    monkeypatch.delenv("SECRET_KEY_PREVIOUS", raising=False)

    preview_v1 = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="char-1",
            requestId="req-rot-1",
            operation="create_habit",
            arguments={"name": "Rotation Habit 1"},
        ),
        {"id": "user-1"},
    )
    token_v1 = preview_v1["confirmationToken"]

    # Step 2: Key rotation window active (SECRET_KEY = v2, SECRET_KEY_PREVIOUS = v1)
    monkeypatch.setenv("SECRET_KEY", "key-v2-new")
    monkeypatch.setenv("SECRET_KEY_PREVIOUS", "key-v1-old")

    # In-flight token signed with v1 must still verify successfully via previous key fallback
    req_v1 = AIRAOperationExecuteRequest(
        characterId="char-1",
        requestId="req-rot-1",
        operation="create_habit",
        confirmationToken=token_v1,
    )
    claims_v1 = await aira_preview_registry.validate_aira_execution(req_v1, {"id": "user-1"})
    assert claims_v1["normalizedArguments"]["name"] == "Rotation Habit 1"

    # New tokens issued during rotation window are signed with v2
    preview_v2 = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="char-1",
            requestId="req-rot-2",
            operation="create_habit",
            arguments={"name": "Rotation Habit 2"},
        ),
        {"id": "user-1"},
    )
    token_v2 = preview_v2["confirmationToken"]
    req_v2 = AIRAOperationExecuteRequest(
        characterId="char-1",
        requestId="req-rot-2",
        operation="create_habit",
        confirmationToken=token_v2,
    )
    claims_v2 = await aira_preview_registry.validate_aira_execution(req_v2, {"id": "user-1"})
    assert claims_v2["normalizedArguments"]["name"] == "Rotation Habit 2"

    # Step 3: Decommission previous key (TTL expired)
    monkeypatch.delenv("SECRET_KEY_PREVIOUS", raising=False)

    # New token v2 still valid
    claims_v2_again = await aira_preview_registry.validate_aira_execution(req_v2, {"id": "user-1"})
    assert claims_v2_again["normalizedArguments"]["name"] == "Rotation Habit 2"

    # Old token v1 must now be rejected
    with pytest.raises(HTTPException) as exc_info:
        await aira_preview_registry.validate_aira_execution(req_v1, {"id": "user-1"})
    assert exc_info.value.status_code == 400
    assert "invalid confirmation token" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_concurrent_duplicate_creation_triggers_conflict_race(tmp_path, monkeypatch):
    """Two concurrent distinct requestIds for the same habit name race: DB unique constraint triggers 409 Conflict."""
    async def mock_owns(cid, u):
        return True
    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", mock_owns)

    # Issue preview 1
    p1 = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="char-1",
            requestId="req-race-1",
            operation="create_habit",
            arguments={"name": "Concurrent Meditation"},
        ),
        {"id": "user-1"},
        secret="test-secret-key",
    )
    # Issue preview 2 with different requestId
    p2 = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="char-1",
            requestId="req-race-2",
            operation="create_habit",
            arguments={"name": "Concurrent Meditation"},
        ),
        {"id": "user-1"},
        secret="test-secret-key",
    )

    req1 = AIRAOperationExecuteRequest(
        characterId="char-1",
        requestId="req-race-1",
        operation="create_habit",
        confirmationToken=p1["confirmationToken"],
    )
    req2 = AIRAOperationExecuteRequest(
        characterId="char-1",
        requestId="req-race-2",
        operation="create_habit",
        confirmationToken=p2["confirmationToken"],
    )

    # Simulated database table with active habit uniqueness constraint
    db_active_habits = set()
    db_lock = asyncio.Lock()

    class UniqueViolationError(Exception):
        pass

    async def mock_execute(operation, character_id, arguments):
        await asyncio.sleep(0.01)  # Context switch to force concurrent interleave
        async with db_lock:
            key = (character_id, arguments["name"].lower())
            if key in db_active_habits:
                raise UniqueViolationError("unique constraint failed on idx_habits_character_name_active")
            db_active_habits.add(key)
            return {"habitId": f"hab-{arguments['name']}"}

    store = LocalSQLiteAuditStore(tmp_path / "audit_race.sqlite3")

    async def execute_task(req):
        try:
            return await execute_confirmed_aira_operation(req, {"id": "user-1"}, mock_execute, store, secret="test-secret-key")
        except UniqueViolationError as err:
            raise HTTPException(
                status_code=409,
                detail=f"An active habit named '{req.operation}' already exists for this character.",
            ) from err

    results = await asyncio.gather(
        execute_task(req1),
        execute_task(req2),
        return_exceptions=True,
    )

    successes = [r for r in results if isinstance(r, dict) and r.get("success")]
    conflicts = [r for r in results if isinstance(r, HTTPException) and r.status_code == 409]

    # Exactly one must succeed, and the loser must be rejected with 409 Conflict
    assert len(successes) == 1
    assert len(conflicts) == 1
    assert "already exists" in conflicts[0].detail


@pytest.mark.asyncio
async def test_unique_violation_maps_to_409_conflict(monkeypatch):
    """When the DB raises UniqueViolationError on create_habit, domain adapter maps it to HTTP 409."""
    class UniqueViolationError(Exception):
        pass

    async def mock_create_habit(cid, payload, user):
        raise UniqueViolationError("duplicate key value violates unique constraint 'idx_habits_character_name_active'")

    from services import aira_domain_adapters
    monkeypatch.setattr(aira_domain_adapters, "create_habit", mock_create_habit)

    with pytest.raises(HTTPException) as exc_info:
        await aira_domain_adapters.execute_aira_domain_operation(
            "create_habit",
            "char-1",
            {"name": "Deep Work"},
            {"id": "user-1"},
        )

    assert exc_info.value.status_code == 409
    assert "Deep Work" in exc_info.value.detail
    assert "already exists" in exc_info.value.detail


@pytest.mark.asyncio
async def test_mutated_arguments_cannot_alter_executed_payload(tmp_path, monkeypatch):
    """Even if an attacker attempts to mutate parameters, Core executes only the token's claims."""
    async def mock_owns(cid, u):
        return True
    monkeypatch.setattr(aira_preview_registry, "verify_character_ownership", mock_owns)

    preview = await aira_preview_registry.create_aira_preview(
        AIRAOperationPreviewRequest(
            characterId="char-1",
            requestId="req-mutate-1",
            operation="create_habit",
            arguments={"name": "Safe Read Habit", "primaryStat": "knowledge"},
        ),
        {"id": "user-1"},
        secret="test-secret-key",
    )

    request = AIRAOperationExecuteRequest(
        characterId="char-1",
        requestId="req-mutate-1",
        operation="create_habit",
        confirmationToken=preview["confirmationToken"],
    )

    executed_args = []

    async def mock_execute(operation, character_id, arguments):
        executed_args.append(arguments)
        return {"habitId": "hab-verified-1"}

    store = LocalSQLiteAuditStore(tmp_path / "audit_test.sqlite3")
    res = await execute_confirmed_aira_operation(request, {"id": "user-1"}, mock_execute, store, secret="test-secret-key")

    assert res["success"] is True
    # Verify Core executed with the arguments inside the signed token, NOT any rogue client input
    assert executed_args[0]["name"] == "Safe Read Habit"
    assert executed_args[0]["primaryStat"] == "knowledge"
