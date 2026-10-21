"""Remote review transport rejects altered content before issuing authority."""
import asyncio
import hashlib
import json
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from tests.test_browser_tasks import _service

TASK = "25f40e2b-f8e1-4f93-a3d1-f3f7fca471f7"


def proposal(**changes):
    value = dict(task_id=TASK, action_id="action-1", owner="owner-1",
                 observation_id="observation-1", document_revision=1,
                 origin="https://example.com", action="fill", target_ref="field-1",
                 target_label="Search", arguments={"value": "hello"},
                 expected_effect="Fill the field", expires_at=1790553660.0)
    value.update(changes)
    value["digest"] = hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
    return value


def test_canonical_proposal_rejects_changed_arguments_and_unknown_fields():
    from schemas.browser_tasks import BrowserActionProposal
    value = proposal()
    assert BrowserActionProposal.model_validate(value).model_dump() == value
    value["arguments"] = {"value": "different"}
    with pytest.raises(ValidationError):
        BrowserActionProposal.model_validate(value)
    with pytest.raises(ValidationError):
        BrowserActionProposal.model_validate(proposal(arguments={"password": "secret"}))
    with pytest.raises(ValidationError):
        BrowserActionProposal.model_validate({**proposal(), "profile": "other"})


def test_proposal_publication_requires_write_flag_and_exact_task_owner():
    from schemas.browser_tasks import BrowserProposalPublish
    service, _ = _service()
    payload = BrowserProposalPublish.model_validate({"waitingForUserType": "action_review", "proposal": proposal()})
    with pytest.raises(PermissionError):
        asyncio.run(service.publish_proposal(TASK, "boot-1", "lease-1", 1, payload))


def test_local_takeover_cannot_carry_phone_approval():
    from schemas.browser_tasks import BrowserProposalPublish
    with pytest.raises(ValidationError):
        BrowserProposalPublish.model_validate({"waitingForUserType": "local_takeover", "proposal": proposal()})


def test_production_dependency_constructs_service(monkeypatch):
    import sys
    from types import SimpleNamespace
    from routers.browser_tasks import get_browser_task_service
    monkeypatch.setitem(sys.modules, "db", SimpleNamespace(db=object()))
    assert asyncio.run(get_browser_task_service()) is not None


def test_review_routes_require_distinct_worker_and_pwa_authority():
    from tests.test_browser_task_routes import _client
    client, _ = _client()
    response = client.post(f"/api/browser-tasks/worker/tasks/{TASK}/proposal", json={
        "waitingForUserType": "local_takeover", "proposal": None,
    }, headers={"Authorization": "Bearer phone-token", "X-Browser-Boot": "boot-1",
                "X-Browser-Lease": "lease-1", "X-Browser-Fence": "1"})
    assert response.status_code == 403
    assert response.headers.get("cache-control") == "no-store"
    response = client.post("/api/browser-tasks/review-access/consume", json={
        "browserSessionId": TASK, "token": "x" * 43,
    }, headers={"X-Phone-Device": "device-1", "X-Browser-Session": str(__import__('uuid').uuid4()),
                "Authorization": "Bearer pwa"})
    assert response.status_code == 409


def test_discord_browser_bridge_rejects_worker_credential(monkeypatch):
    from tests.test_browser_task_routes import _client
    monkeypatch.setenv("ASCEND_DISCORD_BRIDGE_TOKEN", "discord-token")
    client, _ = _client()
    response = client.post("/api/browser-tasks/bridge/discord/status", json={
        "discordUserId": "12345678", "taskId": TASK,
    }, headers={"Authorization": "Bearer browser-token"})
    assert response.status_code == 403
