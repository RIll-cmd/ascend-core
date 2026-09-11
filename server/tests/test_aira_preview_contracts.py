import pytest
from pydantic import ValidationError

from schemas.aira_operations import AIRAOperationExecuteRequest, AIRAOperationPreviewRequest


def test_preview_request_allows_only_registered_write_operations():
    request = AIRAOperationPreviewRequest.model_validate({
        "characterId": "character-1",
        "requestId": "preview-1",
        "operation": "create_habit",
        "arguments": {"name": "Read"},
    })

    assert request.operation == "create_habit"

    with pytest.raises(ValidationError):
        AIRAOperationPreviewRequest.model_validate({
            "characterId": "character-1",
            "requestId": "preview-1",
            "operation": "drop_database",
            "arguments": {},
        })


def test_execute_request_rejects_extra_or_missing_confirmation_identity():
    with pytest.raises(ValidationError):
        AIRAOperationExecuteRequest.model_validate({
            "characterId": "character-1",
            "requestId": "preview-1",
            "operation": "create_habit",
            "confirmationToken": "opaque-token",
            "unexpected": True,
        })
