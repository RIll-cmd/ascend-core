import pytest
from fastapi import HTTPException, Response
from pydantic import ValidationError

from routers.auth import export_user_data, delete_user_account, AccountDeleteInput


@pytest.mark.asyncio
async def test_export_user_data_returns_structured_payload():
    mock_user = {"id": "user-123", "username": "ShadowHunter"}
    result = await export_user_data(current_user=mock_user)

    assert "exportVersion" in result
    assert "exportedAt" in result
    assert "user" in result
    assert result["user"]["id"] == "user-123"
    assert result["user"]["username"] == "ShadowHunter"


@pytest.mark.asyncio
async def test_delete_user_account_validates_matching_username():
    mock_user = {"id": "user-123", "username": "ShadowHunter"}
    input_data = AccountDeleteInput(username="WrongUsername", password="secretPassword123!")

    response = Response()
    with pytest.raises(HTTPException) as exc_info:
        await delete_user_account(input_data, response, current_user=mock_user)

    assert exc_info.value.status_code == 400
    assert "Username confirmation does not match" in exc_info.value.detail


@pytest.mark.asyncio
async def test_delete_user_account_success():
    mock_user = {"id": "user-123", "username": "ShadowHunter"}
    input_data = AccountDeleteInput(username="ShadowHunter")

    response = Response()
    result = await delete_user_account(input_data, response, current_user=mock_user)

    assert result["success"] is True
    assert result["deletedUserId"] == "user-123"
    assert "permanently erased" in result["message"]

