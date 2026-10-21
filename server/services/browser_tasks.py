"""Core authority for remote browser task source and lease lifecycle."""
from __future__ import annotations

import hashlib
import json
import re
import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from schemas.browser_tasks import (
    BrowserTaskCreate, BrowserSessionCreate, BrowserWorkerCompletion, BrowserWorkerReconcile,
)

_TOKEN = re.compile(r"^[A-Za-z0-9_-]{1,128}$")
_PROVIDERS = {"gemini", "cerebras", "groq"}
_TERMINAL = {"completed", "partial", "failed", "unknown", "cancelled", "expired"}


class BrowserTaskService:
    def __init__(self, repository, *, owner_id: str | None, laptop_id: str | None,
                 worker_token: str | None, enabled: bool = False, writes_enabled: bool = False,
                 other_credentials: tuple[str, ...] = (), clock=lambda: datetime.now(timezone.utc)):
        self.repository = repository
        self.owner_id = owner_id.strip() if owner_id else ""
        self.laptop_id = laptop_id.strip() if laptop_id else ""
        self.worker_token = worker_token or ""
        self.enabled = bool(enabled)
        self.writes_enabled = bool(writes_enabled)
        self.other_credentials = tuple(value for value in other_credentials if value)
        self.clock = clock

    def _require_configuration(self) -> None:
        if not self.owner_id or not self.laptop_id:
            raise PermissionError("Browser remote owner and laptop are not configured")

    def _require_enabled(self) -> None:
        self._require_configuration()
        if not self.enabled:
            raise PermissionError("Remote browser tasks are disabled")

    def authenticate_worker(self, credential: str) -> None:
        self._require_configuration()
        if (not self.worker_token or not credential
                or not secrets.compare_digest(credential, self.worker_token)
                or any(secrets.compare_digest(credential, other) for other in self.other_credentials)):
            raise PermissionError("Browser worker credential rejected")

    def _require_owner(self, owner_id: str) -> None:
        self._require_configuration()
        if not owner_id or not secrets.compare_digest(owner_id, self.owner_id):
            raise PermissionError("Browser tasks are not available to this account")

    @staticmethod
    def _uuid(value: str, label: str) -> str:
        try:
            return str(UUID(str(value)))
        except (ValueError, TypeError, AttributeError) as error:
            raise ValueError(f"{label} must be a UUID") from error

    async def _ensure_laptop(self) -> None:
        self._require_configuration()
        if hasattr(self.repository, "ensure_laptop"):
            await self.repository.ensure_laptop(self.owner_id, self.laptop_id)

    async def availability(self, owner_id: str, device_id: str) -> dict:
        self._require_owner(owner_id)
        if not _TOKEN.fullmatch(device_id or ""):
            raise ValueError("Invalid phone device ID")
        await self.repository.require_active_device(owner_id, device_id)
        if not self.enabled:
            return {"available": False, "reason": "disabled", "laptopId": self.laptop_id,
                    "lastHeartbeatAt": None, "provider": None,
                    "scopes": [{"scopeId": "public_research", "version": 1, "actions": []}]}
        await self._ensure_laptop()
        status = await self.repository.get_availability(owner_id, self.laptop_id, now=self.clock())
        if status is None:
            return {"available": False, "reason": "offline", "laptopId": self.laptop_id,
                    "lastHeartbeatAt": None, "provider": None,
                    "scopes": [{"scopeId": "public_research", "version": 1, "actions": []}]}
        status["scopes"] = [{"scopeId": "public_research", "version": 1, "actions": []}, *status.get("scopes", [])]
        return status

    async def create_session(self, owner_id: str, payload: BrowserSessionCreate) -> dict:
        self._require_enabled()
        self._require_owner(owner_id)
        await self._ensure_laptop()
        if payload.provider_consent not in _PROVIDERS:
            raise ValueError("Unsupported provider consent")
        session_id = str(uuid4())
        return await self.repository.create_session(
            session_id=session_id, owner_id=owner_id, device_id=payload.device_id,
            parent_session_id=payload.parent_session_id, provider=payload.provider_consent,
            laptop_id=self.laptop_id, now=self.clock(),
        )

    async def end_session(self, owner_id: str, device_id: str, session_id: str) -> bool:
        self._require_owner(owner_id)
        self._require_device_id(device_id)
        await self.repository.require_active_device(owner_id, device_id)
        return await self.repository.end_session(owner_id, device_id, self._uuid(session_id, "browserSessionId"), now=self.clock())

    async def enqueue(self, owner_id: str, device_id: str, payload: BrowserTaskCreate) -> dict:
        self._require_enabled()
        self._require_owner(owner_id)
        self._require_device_id(device_id)
        if str(payload.browser_session_id) != self._uuid(str(payload.browser_session_id), "browserSessionId"):
            raise ValueError("Invalid browser session ID")
        if payload.laptop_id != self.laptop_id:
            raise PermissionError("Requested laptop is not configured for this owner")
        if payload.scope_id != "public_research" or payload.scope_version != 1:
            if not self.writes_enabled:
                raise PermissionError("Selected browser scope is not enabled")
        await self.repository.require_active_device(owner_id, device_id)
        return await self.repository.enqueue(
            task_id=self._uuid(str(payload.task_id), "taskId"), owner_id=owner_id,
            session_id=self._uuid(str(payload.browser_session_id), "browserSessionId"),
            laptop_id=payload.laptop_id, scope_id=payload.scope_id,
            scope_version=payload.scope_version, goal=payload.goal, now=self.clock(), device_id=device_id,
        )

    async def read_task(self, owner_id: str, device_id: str, session_id: str,
                        task_id: str, after: int = 0) -> dict | None:
        self._require_owner(owner_id)
        self._require_device_id(device_id)
        await self.repository.require_active_device(owner_id, device_id)
        return await self.repository.read_task(
            owner_id, device_id, self._uuid(session_id, "browserSessionId"), self._uuid(task_id, "taskId"),
            after=max(0, min(int(after), 2**31 - 1)),
        )

    async def control(self, owner_id: str, device_id: str, session_id: str,
                      task_id: str, command: str) -> str | None:
        self._require_owner(owner_id)
        self._require_device_id(device_id)
        if command not in {"pause", "resume", "stop"}:
            raise ValueError("Unsupported task control")
        await self.repository.require_active_device(owner_id, device_id)
        return await self.repository.control(
            owner_id, device_id, self._uuid(session_id, "browserSessionId"), self._uuid(task_id, "taskId"), command,
            now=self.clock(),
        )

    async def acknowledge(self, owner_id: str, device_id: str, session_id: str, task_id: str) -> bool:
        self._require_owner(owner_id)
        self._require_device_id(device_id)
        await self.repository.require_active_device(owner_id, device_id)
        return await self.repository.acknowledge(
            owner_id, device_id, self._uuid(session_id, "browserSessionId"), self._uuid(task_id, "taskId"), now=self.clock(),
        )

    @staticmethod
    def _require_device_id(device_id: str) -> None:
        if not isinstance(device_id, str) or not _TOKEN.fullmatch(device_id):
            raise ValueError("Invalid phone device ID")

    async def worker_identity(self) -> dict:
        self._require_configuration()
        if self.enabled:
            await self._ensure_laptop()
        value = await self.repository.get_worker_identity(self.owner_id, self.laptop_id)
        return {"ownerId": self.owner_id, "laptopId": self.laptop_id,
                "currentBootId": value["currentBootId"] if value else None,
                "remoteEnabled": self.enabled, "remoteWritesEnabled": self.writes_enabled}

    async def register_boot(self, expected_boot_id: str | None, new_boot_id: str) -> bool:
        self._require_configuration()
        if not _TOKEN.fullmatch(new_boot_id or "") or (expected_boot_id is not None and not _TOKEN.fullmatch(expected_boot_id)):
            raise ValueError("Invalid broker boot ID")
        await self._ensure_laptop()
        return await self.repository.register_boot(
            owner_id=self.owner_id, laptop_id=self.laptop_id, expected_boot_id=expected_boot_id,
            new_boot_id=new_boot_id, now=self.clock(),
        )

    async def reconcile(self, current_boot_id: str, task_id: str, payload: BrowserWorkerReconcile) -> bool:
        self._require_configuration()
        if not _TOKEN.fullmatch(current_boot_id or ""):
            raise ValueError("Invalid current broker boot ID")
        return await self.repository.reconcile(
            owner_id=self.owner_id, laptop_id=self.laptop_id, current_boot_id=current_boot_id,
            task_id=self._uuid(task_id, "taskId"), payload=payload.model_dump(by_alias=True), now=self.clock(),
        )

    async def authorize_dispatch(self, boot_id: str, task_id: str, lease_id: str, fence: int,
                                 attempt_id: str, action: str,
                                 proposal_digest: str | None) -> dict:
        """Issue a short permit for public read-only work; writes await B4 review support."""
        self._require_enabled()
        if not _TOKEN.fullmatch(boot_id or "") or not _TOKEN.fullmatch(lease_id or ""):
            raise ValueError("Invalid browser dispatch lease")
        if type(fence) is not int or fence < 1:
            raise ValueError("Invalid browser dispatch fence")
        if not _TOKEN.fullmatch(attempt_id or ""):
            raise ValueError("Invalid browser dispatch attempt ID")
        if proposal_digest is not None and (not self.writes_enabled or action not in {"fill", "select", "click"}):
            raise PermissionError("Reviewed browser actions are not enabled")
        if proposal_digest is None and action not in {"observe", "plan", "finish", "navigate", "click", "scroll", "back", "wait_for"}:
            raise PermissionError("Consequential browser actions are not enabled")
        task_id = self._uuid(task_id, "taskId")
        lease_hash = self.lease_hash(lease_id)
        requested_at = self.clock()
        allowed = await self.repository.authorize_dispatch(
            task_id=task_id, owner_id=self.owner_id, laptop_id=self.laptop_id,
            boot_id=boot_id, lease_hash=lease_hash, fence=fence, action=action,
            now=requested_at, attempt_id=attempt_id, proposal_digest=proposal_digest,
            writes_enabled=self.writes_enabled,
        )
        if not allowed:
            raise PermissionError("Current browser task, source session, or dispatch lease is not authorized")
        expiry = min(requested_at + timedelta(seconds=2), self.clock() + timedelta(seconds=1),
                     allowed["expiresAt"] if isinstance(allowed, dict) else self.clock() + timedelta(seconds=1))
        if expiry <= self.clock():
            raise PermissionError("Browser dispatch authority expired before the response")
        return {
            "permitId": secrets.token_urlsafe(24),
            "expiresAt": expiry,
            "taskId": task_id, "attemptId": attempt_id,
            "laptopId": self.laptop_id, "brokerBootId": boot_id,
            "fence": fence, "action": action, "proposalDigest": proposal_digest,
        }

    async def publish_proposal(self, task_id, boot_id, lease_id, fence, payload):
        self._require_enabled()
        proposal = payload.proposal
        if proposal is not None:
            if not self.writes_enabled:
                raise PermissionError("Reviewed browser actions are disabled")
            if proposal.owner != self.owner_id or proposal.task_id != self._uuid(task_id, "taskId"):
                raise PermissionError("Proposal owner and task do not match")
            if not self.clock().timestamp() < proposal.expires_at <= self.clock().timestamp() + 120:
                raise ValueError("Proposal expiry must be within 120 seconds")
        return await self.repository.publish_proposal(
            owner_id=self.owner_id, laptop_id=self.laptop_id, task_id=self._uuid(task_id, "taskId"),
            boot_id=boot_id, lease_hash=self.lease_hash(lease_id), fence=fence,
            waiting_type=payload.waiting_for_user_type,
            proposal=proposal.model_dump() if proposal else None, now=self.clock())

    async def decide_review(self, owner_id, device_id, session_id, task_id, action_id, digest, approved):
        self._require_owner(owner_id)
        self._require_device_id(device_id)
        if approved:
            self._require_enabled()
            if not self.writes_enabled:
                raise PermissionError("Reviewed browser actions are disabled")
        return await self.repository.decide_review(
            owner_id=owner_id, device_id=device_id, session_id=self._uuid(session_id, "browserSessionId"),
            task_id=self._uuid(task_id, "taskId"), action_id=action_id, digest=digest,
            approved=approved, now=self.clock())

    async def consume_review_access(self, owner_id, device_id, session_id, token):
        self._require_owner(owner_id)
        self._require_device_id(device_id)
        return await self.repository.consume_review_access(
            owner_id=owner_id, device_id=device_id, session_id=self._uuid(session_id, "browserSessionId"),
            token_hash=hashlib.sha256(token.encode()).hexdigest(), now=self.clock())

    async def discord_start(self, payload):
        self._require_enabled()
        await self._ensure_laptop()
        return await self.repository.discord_start(
            owner_id=self.owner_id, laptop_id=self.laptop_id, discord_user_id=payload.discord_user_id,
            task_id=str(payload.task_id), goal=payload.goal.strip(), provider_consent=payload.provider_consent,
            expected_generation=payload.expected_link_generation, now=self.clock())

    async def discord_operation(self, command, discord_user_id, task_id=None):
        self._require_configuration()
        token = secrets.token_urlsafe(32) if command == "review-link" else None
        value = await self.repository.discord_operation(
            owner_id=self.owner_id, laptop_id=self.laptop_id, discord_user_id=discord_user_id,
            task_id=self._uuid(task_id, "taskId") if task_id else None, command=command,
            token_hash=hashlib.sha256(token.encode()).hexdigest() if token else None, now=self.clock())
        if token:
            return {"token": token, "expiresAt": value["expiresAt"]}
        return value

    async def heartbeat(self, boot_id: str, availability: str, descriptor: dict) -> bool:
        self._require_configuration()
        if not _TOKEN.fullmatch(boot_id or ""):
            raise ValueError("Invalid broker boot ID")
        if availability not in {"online", "busy", "provider_unavailable", "disabled"}:
            raise ValueError("Invalid availability state")
        checked = json.dumps(descriptor, separators=(",", ":"), ensure_ascii=False)
        if len(checked.encode("utf-8")) > 4096:
            raise ValueError("Browser worker descriptor exceeds 4 KiB")
        return await self.repository.heartbeat(
            owner_id=self.owner_id, laptop_id=self.laptop_id, boot_id=boot_id,
            availability=availability, descriptor_json=checked, now=self.clock(),
        )

    async def claim(self, boot_id: str) -> dict | None:
        self._require_enabled()
        if not _TOKEN.fullmatch(boot_id or ""):
            raise ValueError("Invalid broker boot ID")
        return await self.repository.claim(
            owner_id=self.owner_id, laptop_id=self.laptop_id, boot_id=boot_id, now=self.clock(),
        )

    @staticmethod
    def lease_hash(lease_id: str) -> str:
        if not _TOKEN.fullmatch(lease_id or ""):
            raise ValueError("Invalid browser lease ID")
        return hashlib.sha256(lease_id.encode()).hexdigest()

    async def start(self, task_id: str, boot_id: str, lease_id: str, fence: int) -> bool:
        self._require_enabled()
        return await self.repository.start(
            task_id=self._uuid(task_id, "taskId"), owner_id=self.owner_id, laptop_id=self.laptop_id,
            boot_id=boot_id, lease_hash=self.lease_hash(lease_id), fence=fence, now=self.clock(),
        )

    async def renew(self, task_id: str, boot_id: str, lease_id: str, fence: int) -> dict | None:
        return await self.repository.renew(
            task_id=self._uuid(task_id, "taskId"), owner_id=self.owner_id, laptop_id=self.laptop_id,
            boot_id=boot_id, lease_hash=self.lease_hash(lease_id), fence=fence, now=self.clock(),
        )

    async def complete(self, task_id: str, boot_id: str, lease_id: str, fence: int,
                       payload: BrowserWorkerCompletion) -> bool:
        result_json = json.dumps({
            "summary": payload.summary,
            "eventsCursor": payload.events_cursor,
            "result": payload.result,
        }, separators=(",", ":"), ensure_ascii=False)
        return await self.repository.complete(
            task_id=self._uuid(task_id, "taskId"), owner_id=self.owner_id, laptop_id=self.laptop_id,
            boot_id=boot_id, lease_hash=self.lease_hash(lease_id), fence=fence,
            state=payload.state, result_json=result_json, reason=payload.terminal_reason, now=self.clock(),
        )

    async def release_unstarted(self, task_id: str, boot_id: str, lease_id: str, fence: int) -> bool:
        return await self.repository.release_unstarted(
            task_id=self._uuid(task_id, "taskId"), owner_id=self.owner_id, laptop_id=self.laptop_id,
            boot_id=boot_id, lease_hash=self.lease_hash(lease_id), fence=fence, now=self.clock(),
        )

    async def read_worker_events(self, task_id: str, boot_id: str, lease_id: str, fence: int, after: int) -> dict | None:
        return await self.repository.read_worker_events(
            task_id=self._uuid(task_id, "taskId"), owner_id=self.owner_id, laptop_id=self.laptop_id,
            boot_id=boot_id, lease_hash=self.lease_hash(lease_id), fence=fence, after=after,
        )

    async def append_events(self, task_id: str, boot_id: str, lease_id: str, fence: int,
                            events: list[dict]) -> bool:
        if len(events) > 50:
            raise ValueError("At most 50 events may be published per request")
        return await self.repository.append_events(
            task_id=self._uuid(task_id, "taskId"), owner_id=self.owner_id, laptop_id=self.laptop_id,
            boot_id=boot_id, lease_hash=self.lease_hash(lease_id), fence=fence,
            events=events, now=self.clock(),
        )

    async def sweep(self, *, batch_size: int = 100) -> dict[str, int]:
        return await self.repository.sweep(now=self.clock(), batch_size=batch_size)
