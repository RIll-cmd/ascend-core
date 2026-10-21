"""Service-boundary authorization checks with an explicit storage boundary double."""
import asyncio
from datetime import datetime, timezone

import pytest

from schemas.browser_tasks import BrowserProposalPublish
from services.browser_tasks import BrowserTaskService
from tests.test_browser_task_review import TASK, proposal
from tests.test_browser_tasks import FakeBrowserRepository


class ReviewStorage(FakeBrowserRepository):
    async def publish_proposal(self, **values):
        self.calls.append(("publish", values))
        return True

    async def decide_review(self, **values):
        self.calls.append(("decision", values))
        return True

    async def consume_review_access(self, **values):
        self.calls.append(("consume", values))
        return {"taskId": TASK, "expiresAt": values["now"]}


def service(*, enabled=True, writes=True):
    repo = ReviewStorage()
    return BrowserTaskService(repo, owner_id="owner-1", laptop_id="laptop-1",
                              worker_token="worker-only", enabled=enabled, writes_enabled=writes,
                              clock=lambda: datetime(2026, 9, 28, tzinfo=timezone.utc)), repo


@pytest.mark.parametrize("changes,error", [
    ({"owner": "other-owner"}, PermissionError),
    ({"task_id": "ed526541-7afd-4ef9-a2a4-77b6d4176dbe"}, PermissionError),
    ({"expires_at": 1790553500.0}, ValueError),
    ({"expires_at": 1790554000.0}, ValueError),
])
def test_publication_rejects_foreign_or_expired_proposal_before_storage(changes, error):
    authority, repo = service()
    payload = BrowserProposalPublish.model_validate({"waitingForUserType": "action_review", "proposal": proposal(**changes)})
    with pytest.raises(error):
        asyncio.run(authority.publish_proposal(TASK, "boot", "lease", 1, payload))
    assert repo.calls == []


def test_local_takeover_requires_no_write_flag_and_creates_no_review_payload():
    authority, repo = service(writes=False)
    payload = BrowserProposalPublish.model_validate({"waitingForUserType": "local_takeover", "proposal": None})
    assert asyncio.run(authority.publish_proposal(TASK, "boot", "lease", 1, payload))
    assert repo.calls[-1][1]["proposal"] is None
    assert repo.calls[-1][1]["waiting_type"] == "local_takeover"


def test_reviewed_dispatch_preserves_exact_digest_and_uses_configured_identity():
    authority, repo = service()
    result = asyncio.run(authority.authorize_dispatch("boot", TASK, "lease", 3, "attempt", "fill", "a" * 64))
    assert result["proposalDigest"] == "a" * 64
    values = repo.calls[-1][1]
    assert values["owner_id"] == "owner-1"
    assert values["laptop_id"] == "laptop-1"
    assert values["attempt_id"] == "attempt"
    assert values["fence"] == 3


@pytest.mark.parametrize("action", ["upload", "download", "submit", "fill", "select"])
def test_consequential_dispatch_without_review_is_rejected(action):
    authority, repo = service()
    with pytest.raises(PermissionError):
        asyncio.run(authority.authorize_dispatch("boot", TASK, "lease", 1, "attempt", action, None))
    assert repo.calls == []


def test_disabled_flags_allow_rejection_and_handoff_but_not_approval():
    authority, repo = service(enabled=False)
    with pytest.raises(PermissionError):
        asyncio.run(authority.decide_review("owner-1", "device-1", TASK, TASK, "action", "a" * 64, True))
    assert asyncio.run(authority.decide_review("owner-1", "device-1", TASK, TASK, "action", "a" * 64, False))
    result = asyncio.run(authority.consume_review_access("owner-1", "device-1", TASK, "x" * 43))
    assert result["taskId"] == TASK
    stored = repo.calls[-1][1]
    assert "token" not in stored
    assert len(stored["token_hash"]) == 64


def test_handoff_under_different_owner_never_reaches_storage():
    authority, repo = service()
    with pytest.raises(PermissionError):
        asyncio.run(authority.consume_review_access("other-owner", "device-1", TASK, "x" * 43))
    assert repo.calls == []
