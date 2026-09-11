import pytest

from schemas.aira_operations import AIRAOperationRequest


@pytest.mark.asyncio
async def test_read_operation_route_uses_authenticated_actor(monkeypatch):
    from routers import aira

    request = AIRAOperationRequest(
        characterId="character-1",
        requestId="aira-1",
        operation="habits_summary",
    )
    captured = {}

    async def execute(payload, actor):
        captured["payload"] = payload
        captured["actor"] = actor
        return {"success": True, "requestId": payload.requestId, "operation": payload.operation, "data": {"habits": []}}

    monkeypatch.setattr(aira, "execute_aira_read_operation", execute)

    result = await aira.read_aira_operation(request, {"id": "user-1"})

    assert captured == {"payload": request, "actor": {"id": "user-1"}}
    assert result["data"] == {"habits": []}
