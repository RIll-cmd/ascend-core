import pytest

from schemas.aira_operations import AIRAOperationPreviewRequest


@pytest.mark.asyncio
async def test_preview_route_delegates_to_authenticated_preview_service(monkeypatch):
    from routers import aira

    payload = AIRAOperationPreviewRequest(
        characterId="character-1",
        requestId="request-1",
        operation="create_habit",
        arguments={"name": "Read"},
    )
    captured = {}

    async def preview(request, actor):
        captured["request"] = request
        captured["actor"] = actor
        return {"confirmationToken": "token"}

    monkeypatch.setattr(aira, "create_aira_preview", preview)

    assert await aira.preview_aira_operation(payload, {"id": "user-1"}) == {"confirmationToken": "token"}
    assert captured == {"request": payload, "actor": {"id": "user-1"}}
