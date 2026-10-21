"""Transactional browser review authority; all grants share source revocation locks.

The owner mutex is the first lock, shared with account unlink and device revoke.
Source, session, laptop, task, then review rows are locked in that order. A review
never confers authority independently of its live task and source session.
"""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from uuid import uuid4


def row(values):
    return dict(values[0]) if values else None


def aware(value):
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


def fresh(now):
    # Request time cannot extend an authority deadline while a row lock waits.
    return max(aware(now), datetime.now(timezone.utc))


def encoded(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


TERMINAL = {"completed", "partial", "failed", "unknown", "cancelled", "expired"}
READ_ACTIONS = {"observe", "plan", "finish", "navigate", "click", "scroll", "back", "wait_for"}


def configured_scope(descriptor, scope_id, version):
    if scope_id == "public_research" and version == 1:
        return {"scopeId": scope_id, "version": 1, "actions": []}
    matches = [scope for scope in descriptor.get("scopes", [])
               if scope.get("scopeId") == scope_id and scope.get("version") == version]
    if len(matches) != 1 or not matches[0].get("origin"):
        raise PermissionError("Browser scope is not currently configured")
    scope = matches[0]
    if not isinstance(scope.get("actions"), list) or not set(scope["actions"]) <= {"fill", "select", "click"}:
        raise PermissionError("Browser scope contains ineligible actions")
    return scope


class BrowserReviewRepositoryMixin:
    async def _owner_lock(self, tx, owner_id):
        if not await tx.query_raw('SELECT "id" FROM "User" WHERE "id"=$1 FOR UPDATE', owner_id):
            raise PermissionError("Browser owner is unavailable")

    async def _session(self, tx, owner_id, session_id, now):
        header = row(await tx.query_raw(
            'SELECT * FROM "BrowserRemoteSession" WHERE "id"=$1 AND "ownerId"=$2', session_id, owner_id))
        if not header:
            raise PermissionError("Browser session is unavailable")
        if header["channel"] == "phone_pwa":
            source = row(await tx.query_raw(
                '''SELECT "id" FROM "PhoneChatDevice" WHERE "id"=$1 AND "ownerId"=$2
                   AND "revokedAt" IS NULL FOR UPDATE''', header["sourceDeviceId"], owner_id))
        elif header["channel"] == "discord_dm":
            source = row(await tx.query_raw(
                '''SELECT "id" FROM "PhoneDiscordLink" WHERE "id"=$1 AND "ownerId"=$2
                   AND "generation"=$3 AND "revokedAt" IS NULL AND "discordUserId" IS NOT NULL FOR UPDATE''',
                header["sourceDiscordLinkId"], owner_id, header["discordGeneration"]))
        else:
            source = None
        session = row(await tx.query_raw(
            'SELECT * FROM "BrowserRemoteSession" WHERE "id"=$1 AND "ownerId"=$2 FOR UPDATE', session_id, owner_id))
        if not source or session["endedAt"] or aware(session["expiresAt"]) <= fresh(now):
            raise PermissionError("Browser source session is closed or revoked")
        return session

    async def _task(self, tx, owner_id, task_id, now):
        await self._owner_lock(tx, owner_id)
        header = row(await tx.query_raw(
            'SELECT "sessionId","laptopId" FROM "BrowserTask" WHERE "id"=$1 AND "ownerId"=$2', task_id, owner_id))
        if not header:
            raise LookupError("Browser task not found")
        session = await self._session(tx, owner_id, header["sessionId"], now)
        laptop = row(await tx.query_raw(
            'SELECT * FROM "BrowserLaptop" WHERE "id"=$1 AND "ownerId"=$2 FOR UPDATE', header["laptopId"], owner_id))
        task = row(await tx.query_raw(
            'SELECT * FROM "BrowserTask" WHERE "id"=$1 AND "ownerId"=$2 FOR UPDATE', task_id, owner_id))
        if not laptop or laptop["revokedAt"]:
            raise PermissionError("Browser laptop is unavailable")
        return task, session, laptop

    def _execution(self, task, session, laptop, now, *, states=("running", "waiting_for_user"),
                   laptop_id=None, boot_id=None, lease_hash=None, fence=None):
        now = fresh(now)
        if (task["state"] not in states or task["cancelRequested"]
                or not task["leaseExpiresAt"] or aware(task["leaseExpiresAt"]) <= now
                or not task["activeExpiresAt"] or aware(task["activeExpiresAt"]) <= now
                or session["endedAt"] or aware(session["expiresAt"]) <= now
                or task["brokerBootId"] != laptop["currentBootId"]
                or (laptop_id is not None and task["laptopId"] != laptop_id)
                or (boot_id is not None and task["brokerBootId"] != boot_id)
                or (lease_hash is not None and task["claimTokenHash"] != lease_hash)
                or (fence is not None and task["fence"] != fence)):
            raise PermissionError("Browser execution lease or state is stale")
        descriptor = json.loads(laptop["descriptorJson"] or "{}")
        if descriptor.get("provider") != session["providerConsent"]:
            raise PermissionError("Browser provider requires new consent")
        scope = configured_scope(descriptor, task["scopeId"], task["scopeVersion"])
        if task.get("scopeDescriptorJson") and task["scopeDescriptorJson"] != encoded(scope):
            raise PermissionError("Browser scope changed after enqueue")
        return scope

    async def _reviewer(self, tx, task, source, owner_id, device_id, session_id, now):
        reviewer = await self._session(tx, owner_id, session_id, now)
        if reviewer["channel"] != "phone_pwa" or reviewer["sourceDeviceId"] != device_id:
            raise PermissionError("Review requires the enrolled PWA session and device")
        if source["id"] == session_id and source["sourceDeviceId"] == device_id:
            return reviewer
        access = row(await tx.query_raw(
            '''SELECT * FROM "BrowserReviewAccess" WHERE "taskId"=$1 AND "ownerId"=$2
               AND "sourceSessionId"=$3 AND "discordGeneration"=$4 AND "reviewerDeviceId"=$5
               AND "reviewerSessionId"=$6 AND "consumedAt" IS NOT NULL AND "revokedAt" IS NULL
               AND "expiresAt">$7 FOR UPDATE''', task["id"], owner_id, source["id"],
            source["discordGeneration"], device_id, session_id, fresh(now)))
        if source["channel"] != "discord_dm" or not access or aware(access["expiresAt"]) <= fresh(now):
            raise PermissionError("Task-specific reviewer access is required")
        return {**reviewer, "reviewAccessExpiresAt": access["expiresAt"]}

    async def _invalidate(self, tx, task_id):
        await tx.execute_raw('UPDATE "BrowserTask" SET "currentProposalId"=NULL,"waitingForUserType"=NULL WHERE "id"=$1', task_id)
        await tx.execute_raw('UPDATE "BrowserActionReview" SET "proposalJson"=NULL WHERE "taskId"=$1', task_id)

    async def _current_review(self, tx, task, now):
        review = row(await tx.query_raw(
            'SELECT * FROM "BrowserActionReview" WHERE "id"=$1 AND "taskId"=$2 FOR UPDATE',
            task.get("currentProposalId"), task["id"]))
        if (not review or not review["proposalJson"] or aware(review["expiresAt"]) <= fresh(now)
                or review["permitConsumedAt"] is not None or review["laptopId"] != task["laptopId"]
                or review["brokerBootId"] != task["brokerBootId"] or review["fence"] != task["fence"]):
            return None
        return review

    async def publish_proposal(self, *, owner_id, laptop_id, task_id, boot_id, lease_hash,
                               fence, waiting_type, proposal, now):
        async with self.db.tx() as tx:
            task, session, laptop = await self._task(tx, owner_id, task_id, now)
            scope = self._execution(task, session, laptop, now, laptop_id=laptop_id, boot_id=boot_id,
                                    lease_hash=lease_hash, fence=fence)
            if proposal:
                if (scope.get("origin") != proposal["origin"] or proposal["action"] not in scope["actions"]
                        or proposal["owner"] != owner_id or proposal["task_id"] != task_id
                        or not now.timestamp() < proposal["expires_at"] <= min(
                            (now + timedelta(seconds=120)).timestamp(), aware(task["activeExpiresAt"]).timestamp(),
                            aware(session["expiresAt"]).timestamp())):
                    raise PermissionError("Proposal exceeds task scope or lifetime")
                existing = row(await tx.query_raw(
                    'SELECT * FROM "BrowserActionReview" WHERE "taskId"=$1 AND "actionId"=$2 FOR UPDATE',
                    task_id, proposal["action_id"]))
                if existing:
                    if (existing["proposalDigest"] == proposal["digest"] and existing["id"] == task["currentProposalId"]
                            and existing["proposalJson"] and existing["permitConsumedAt"] is None):
                        return True
                    raise ValueError("Action ID cannot be replaced or revived")
            await self._invalidate(tx, task_id)
            review_id = None
            if proposal:
                review_id = str(uuid4())
                await tx.execute_raw(
                    '''INSERT INTO "BrowserActionReview" ("id","taskId","actionId","proposalJson","proposalDigest",
                       "laptopId","brokerBootId","fence","expiresAt","createdAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)''',
                    review_id, task_id, proposal["action_id"], encoded(proposal), proposal["digest"], laptop_id,
                    boot_id, fence, datetime.fromtimestamp(proposal["expires_at"], timezone.utc), now)
            await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "state"='waiting_for_user',"waitingForUserType"=$2,
                   "currentProposalId"=$3,"requestedControl"=NULL WHERE "id"=$1''', task_id, waiting_type, review_id)
            return True

    async def decide_review(self, *, owner_id, device_id, session_id, task_id, action_id, digest, approved, now):
        async with self.db.tx() as tx:
            task, source, laptop = await self._task(tx, owner_id, task_id, now)
            await self._reviewer(tx, task, source, owner_id, device_id, session_id, now)
            self._execution(task, source, laptop, now)
            review = await self._current_review(tx, task, now)
            if not review or review["actionId"] != action_id or review["proposalDigest"] != digest:
                raise PermissionError("Review is no longer current")
            decision = "approved" if approved else "rejected"
            if review["decision"]:
                if review["decision"] != decision:
                    raise ValueError("Review decision conflicts with the recorded decision")
                return True
            if task["state"] != "waiting_for_user" or task["waitingForUserType"] != "action_review":
                raise PermissionError("Task is not awaiting this review")
            await tx.execute_raw(
                '''UPDATE "BrowserActionReview" SET "decision"=$2,"decidedByOwnerId"=$3,
                   "reviewerDeviceId"=$4,"reviewerSessionId"=$5 WHERE "id"=$1''',
                review["id"], decision, owner_id, device_id, session_id)
            if not approved:
                await tx.execute_raw('UPDATE "BrowserTask" SET "state"=\'running\',"waitingForUserType"=NULL WHERE "id"=$1', task_id)
            return True

    async def authorize_dispatch(self, *, owner_id, task_id, laptop_id, boot_id, lease_hash,
                                 fence, action, now, attempt_id, proposal_digest=None, writes_enabled=False):
        async with self.db.tx() as tx:
            task, source, laptop = await self._task(tx, owner_id, task_id, now)
            scope = self._execution(task, source, laptop, now, laptop_id=laptop_id, boot_id=boot_id,
                                    lease_hash=lease_hash, fence=fence)
            permit_expiry = min(aware(source["expiresAt"]), aware(task["activeExpiresAt"]), aware(task["leaseExpiresAt"]))
            if await tx.query_raw('SELECT "attemptId" FROM "BrowserDispatchAttempt" WHERE "taskId"=$1 AND "attemptId"=$2', task_id, attempt_id):
                raise PermissionError("Dispatch attempt was already authorized")
            if proposal_digest:
                review = await self._current_review(tx, task, now)
                if not writes_enabled or not review or review["decision"] != "approved" or review["proposalDigest"] != proposal_digest:
                    raise PermissionError("Current single-use approval is required")
                reviewer = await self._reviewer(tx, task, source, owner_id, review["reviewerDeviceId"], review["reviewerSessionId"], now)
                permit_expiry = min(permit_expiry, aware(review["expiresAt"]), aware(reviewer["expiresAt"]),
                                    aware(reviewer.get("reviewAccessExpiresAt", reviewer["expiresAt"])))
                proposal = json.loads(review["proposalJson"])
                if proposal["action"] != action or scope.get("origin") != proposal["origin"] or action not in scope["actions"]:
                    raise PermissionError("Reviewed action does not match current scope")
                await tx.execute_raw('UPDATE "BrowserActionReview" SET "permitConsumedAt"=$2,"proposalJson"=NULL WHERE "id"=$1', review["id"], now)
                await tx.execute_raw('UPDATE "BrowserTask" SET "state"=\'running\',"currentProposalId"=NULL,"waitingForUserType"=NULL WHERE "id"=$1', task_id)
            else:
                if task["state"] != "running" or action not in READ_ACTIONS:
                    raise PermissionError("Task is not running read-only work")
                if scope["scopeId"] != "public_research" and action == "click":
                    raise PermissionError("Selected-origin click requires review")
                if action == "observe":
                    await self._invalidate(tx, task_id)
            await tx.execute_raw(
                '''INSERT INTO "BrowserDispatchAttempt" ("taskId","attemptId","action","proposalDigest","fence","createdAt")
                   VALUES ($1,$2,$3,$4,$5,$6)''', task_id, attempt_id, action, proposal_digest, fence, now)
            return {"expiresAt": min(permit_expiry, fresh(now) + timedelta(seconds=1))}

    async def start(self, *, task_id, owner_id, laptop_id, boot_id, lease_hash, fence, now):
        async with self.db.tx() as tx:
            task, source, laptop = await self._task(tx, owner_id, task_id, now)
            self._execution(task, source, laptop, now, states=("claimed", "running"),
                            laptop_id=laptop_id, boot_id=boot_id, lease_hash=lease_hash, fence=fence)
            await tx.execute_raw('UPDATE "BrowserTask" SET "state"=\'running\',"startedAt"=COALESCE("startedAt",$2) WHERE "id"=$1', task_id, now)
            return True

    async def renew(self, **values):
        state = await super().renew(**values)
        if state is None:
            return None
        state["decision"] = None
        try:
            async with self.db.tx() as tx:
                task, source, laptop = await self._task(tx, values["owner_id"], values["task_id"], values["now"])
                self._execution(task, source, laptop, values["now"], states=("claimed", "running", "paused", "waiting_for_user"), laptop_id=values["laptop_id"],
                                boot_id=values["boot_id"], lease_hash=values["lease_hash"], fence=values["fence"])
                review = await self._current_review(tx, task, values["now"])
                if review and review["decision"]:
                    await self._reviewer(tx, task, source, values["owner_id"], review["reviewerDeviceId"], review["reviewerSessionId"], values["now"])
                    state["decision"] = {"actionId": review["actionId"], "proposalDigest": review["proposalDigest"], "approved": review["decision"] == "approved"}
        except (PermissionError, LookupError):
            state["cancelRequested"] = True
        return state

    async def consume_review_access(self, *, owner_id, device_id, session_id, token_hash, now):
        async with self.db.tx() as tx:
            await self._owner_lock(tx, owner_id)
            header = row(await tx.query_raw('SELECT "taskId" FROM "BrowserReviewAccess" WHERE "tokenHash"=$1 AND "ownerId"=$2', token_hash, owner_id))
            if not header:
                raise PermissionError("Review handoff is unavailable")
            task, source, laptop = await self._task(tx, owner_id, header["taskId"], now)
            reviewer = await self._session(tx, owner_id, session_id, now)
            if reviewer["channel"] != "phone_pwa" or reviewer["sourceDeviceId"] != device_id:
                raise PermissionError("An active enrolled reviewer is required")
            access = row(await tx.query_raw('SELECT * FROM "BrowserReviewAccess" WHERE "tokenHash"=$1 FOR UPDATE', token_hash))
            now = fresh(now)
            if (access["consumedAt"] or access["revokedAt"] or aware(access["expiresAt"]) <= now
                    or source["channel"] != "discord_dm" or source["id"] != access["sourceSessionId"]
                    or source["discordGeneration"] != access["discordGeneration"]):
                raise PermissionError("Review handoff expired or was already consumed")
            expiry = min(now + timedelta(minutes=10), aware(source["expiresAt"]), aware(reviewer["expiresAt"]),
                         aware(task["activeExpiresAt"] or task["queueExpiresAt"]))
            if expiry <= now:
                raise PermissionError("Review task expired")
            await tx.execute_raw(
                '''UPDATE "BrowserReviewAccess" SET "consumedAt"=$2,"reviewerDeviceId"=$3,
                   "reviewerSessionId"=$4,"expiresAt"=$5 WHERE "id"=$1''', access["id"], now, device_id, session_id, expiry)
            return {"taskId": task["id"], "expiresAt": expiry}

    async def _issue_review_access(self, tx, task, source, token_hash, now):
        now = fresh(now)
        if source["channel"] != "discord_dm":
            raise PermissionError("Review handoff requires an active Discord source")
        expiry = min(now + timedelta(minutes=5), aware(source["expiresAt"]), aware(task["activeExpiresAt"] or task["queueExpiresAt"]))
        if expiry <= now:
            raise PermissionError("Review task expired")
        await tx.execute_raw(
            '''INSERT INTO "BrowserReviewAccess" ("id","taskId","tokenHash","ownerId","sourceSessionId",
               "discordGeneration","expiresAt","createdAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)''',
            str(uuid4()), task["id"], token_hash, task["ownerId"], source["id"], source["discordGeneration"], expiry, now)
        return {"expiresAt": expiry}

    async def enqueue(self, *, task_id, owner_id, session_id, laptop_id, scope_id, scope_version, goal, now, device_id):
        async with self.db.tx() as tx:
            await self._owner_lock(tx, owner_id)
            session = await self._session(tx, owner_id, session_id, now)
            if session["channel"] != "phone_pwa" or session["sourceDeviceId"] != device_id:
                raise PermissionError("Task source device does not own this session")
            laptop = row(await tx.query_raw('SELECT * FROM "BrowserLaptop" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR UPDATE', laptop_id, owner_id))
            if not laptop:
                raise PermissionError("Browser laptop is unavailable")
            return await self._enqueue(tx, task_id, owner_id, session, laptop, scope_id, scope_version, goal, now)

    async def _enqueue(self, tx, task_id, owner_id, session, laptop, scope_id, version, goal, now):
        now = fresh(now)
        if aware(session["expiresAt"]) <= now or session.get("endedAt"):
            raise PermissionError("Browser source session expired while enqueueing")
        descriptor = json.loads(laptop["descriptorJson"] or "{}")
        scope = configured_scope(descriptor, scope_id, version)
        if descriptor.get("provider") != session["providerConsent"]:
            raise PermissionError("Browser provider requires new consent")
        existing = row(await tx.query_raw('SELECT * FROM "BrowserTask" WHERE "id"=$1 FOR UPDATE', task_id))
        if existing:
            if not (existing["ownerId"] == owner_id and existing["sessionId"] == session["id"]
                    and existing["laptopId"] == laptop["id"] and existing["scopeId"] == scope_id
                    and existing["scopeVersion"] == version
                    and (existing["goal"] == goal or (existing["state"] in TERMINAL and existing["goal"] is None))):
                raise ValueError("Task ID was already used with different task data")
            return self._task_receipt(existing)
        counts = row(await tx.query_raw(
            '''SELECT COUNT(*) FILTER (WHERE "state"='queued')::int AS waiting,
               COUNT(*) FILTER (WHERE "state" IN ('claimed','running','paused','waiting_for_user','stopping'))::int AS active
               FROM "BrowserTask" WHERE "laptopId"=$1 AND "queueExpiresAt">$2''', laptop["id"], now))
        if counts and counts["waiting"] >= 4:
            raise OverflowError("Browser laptop queue is busy")
        expiry = min(aware(session["expiresAt"]), now + timedelta(hours=24))
        await tx.execute_raw(
            '''INSERT INTO "BrowserTask" ("id","ownerId","sessionId","laptopId","scopeId","scopeVersion",
               "goal","state","createdAt","queueExpiresAt","scopeDescriptorJson") VALUES ($1,$2,$3,$4,$5,$6,$7,'queued',$8,$9,$10)''',
            task_id, owner_id, session["id"], laptop["id"], scope_id, version, goal, now, expiry, encoded(scope))
        return {"taskId": task_id, "status": "queued", "createdAt": now, "expiresAt": expiry}

    async def _view(self, tx, task, source, laptop, now, after=0):
        first = row(await tx.query_raw('SELECT MIN("sequence") AS first FROM "BrowserTaskEvent" WHERE "taskId"=$1', task["id"]))
        reset = bool(first and first["first"] is not None and after < first["first"] - 1) or after > task["eventCursor"]
        events = [dict(event) for event in await tx.query_raw(
            'SELECT "sequence","eventType","summary","createdAt" FROM "BrowserTaskEvent" WHERE "taskId"=$1 AND "sequence">$2 ORDER BY "sequence" LIMIT 50',
            task["id"], 0 if reset else after)]
        cursor = events[-1]["sequence"] if events else (0 if reset else after)
        review_view = None
        try:
            self._execution(task, source, laptop, now)
            review = await self._current_review(tx, task, now)
            if review and review["decision"] != "rejected":
                review_view = {"proposal": json.loads(review["proposalJson"]), "laptopId": review["laptopId"],
                               "brokerBootId": review["brokerBootId"], "fence": review["fence"]}
        except PermissionError:
            pass
        payload = json.loads(task["resultJson"]) if task["resultJson"] else None
        result = payload.get("result") if isinstance(payload, dict) else None
        result_live = task["completedAt"] and aware(task["completedAt"]) + timedelta(hours=1) > fresh(now)
        return {"taskId": task["id"], "status": task["state"], "channel": source["channel"],
                "scopeId": task["scopeId"], "createdAt": task["createdAt"], "expiresAt": task["activeExpiresAt"] or task["queueExpiresAt"],
                "parentSessionId": source["parentSessionId"], "sourceLinkGeneration": source["discordGeneration"],
                "result": result if result_live and task["state"] in {"completed", "partial"} else None,
                "terminalReason": task["terminalReason"], "events": events, "cursor": cursor, "nextCursor": cursor,
                "resetRequired": reset, "review": review_view,
                "waitingForUserType": task.get("waitingForUserType") if task["state"] == "waiting_for_user" else None}

    async def read_task(self, owner_id, device_id, session_id, task_id, *, after=0):
        now = datetime.now(timezone.utc)
        async with self.db.tx() as tx:
            task, source, laptop = await self._task(tx, owner_id, task_id, now)
            await self._reviewer(tx, task, source, owner_id, device_id, session_id, now)
            return await self._view(tx, task, source, laptop, now, after)

    async def _control(self, tx, task, command, now):
        state = task["state"]
        if state in TERMINAL:
            if command == "stop":
                return state
            raise ValueError("Terminal task state is immutable")
        if command == "stop":
            state = "cancelled" if task["startedAt"] is None else "stopping"
            await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "state"=$2::"BrowserRemoteTaskState","cancelRequested"=TRUE,
                   "requestedControl"='stop',"goal"=NULL,"resultJson"=NULL,"terminalReason"='user_stopped',
                   "completedAt"=CASE WHEN $2::text='cancelled' THEN $3 ELSE "completedAt" END WHERE "id"=$1''', task["id"], state, now)
        elif command == "pause" and state in {"running", "waiting_for_user"}:
            state = "paused"
        elif command == "resume" and state in {"paused", "waiting_for_user"}:
            state = "running"
        else:
            raise ValueError("Control is invalid for current task state")
        await tx.execute_raw('UPDATE "BrowserTask" SET "state"=$2::"BrowserRemoteTaskState","requestedControl"=$3 WHERE "id"=$1', task["id"], state, command)
        await self._invalidate(tx, task["id"])
        return state

    async def control(self, owner_id, device_id, session_id, task_id, command, *, now):
        async with self.db.tx() as tx:
            task, source, laptop = await self._task(tx, owner_id, task_id, now)
            await self._reviewer(tx, task, source, owner_id, device_id, session_id, now)
            return await self._control(tx, task, command, now)

    async def _ack(self, tx, task, now):
        if task["state"] not in TERMINAL:
            raise ValueError("Only terminal tasks can be acknowledged")
        await tx.execute_raw('UPDATE "BrowserTask" SET "goal"=NULL,"resultJson"=NULL,"acknowledgedAt"=COALESCE("acknowledgedAt",$2) WHERE "id"=$1', task["id"], now)
        await tx.execute_raw('DELETE FROM "BrowserTaskEvent" WHERE "taskId"=$1', task["id"])
        await tx.execute_raw('DELETE FROM "BrowserTaskReconciliation" WHERE "taskId"=$1', task["id"])
        await self._invalidate(tx, task["id"])
        return True

    async def acknowledge(self, owner_id, device_id, session_id, task_id, *, now):
        async with self.db.tx() as tx:
            task, source, laptop = await self._task(tx, owner_id, task_id, now)
            await self._reviewer(tx, task, source, owner_id, device_id, session_id, now)
            return await self._ack(tx, task, now)

    async def _discord_link(self, tx, owner_id, discord_user_id):
        await self._owner_lock(tx, owner_id)
        link = row(await tx.query_raw(
            '''SELECT * FROM "PhoneDiscordLink" WHERE "ownerId"=$1 AND "discordUserId"=$2
               AND "revokedAt" IS NULL FOR UPDATE''', owner_id, discord_user_id))
        if not link:
            raise PermissionError("An active Discord account link is required")
        return link

    async def _close_session(self, tx, session_id, now):
        await tx.execute_raw('UPDATE "BrowserRemoteSession" SET "endedAt"=COALESCE("endedAt",$2) WHERE "id"=$1', session_id, now)
        await tx.execute_raw(
            '''UPDATE "BrowserTask" SET "state"=CASE
                 WHEN "state" IN ('queued','claimed') THEN 'cancelled'::"BrowserRemoteTaskState"
                 WHEN "state" IN ('running','paused','waiting_for_user') THEN 'stopping'::"BrowserRemoteTaskState" ELSE "state" END,
               "cancelRequested"=TRUE,"requestedControl"='stop',"goal"=NULL,"resultJson"=NULL,
               "currentProposalId"=NULL,"waitingForUserType"=NULL,
               "terminalReason"='session_ended',
               "completedAt"=CASE WHEN "state" IN ('queued','claimed') THEN $2 ELSE "completedAt" END
               WHERE "sessionId"=$1 AND "state" IN ('queued','claimed','running','paused','waiting_for_user','stopping')''', session_id, now)
        await tx.execute_raw('UPDATE "BrowserTask" SET "goal"=NULL,"resultJson"=NULL WHERE "sessionId"=$1', session_id)
        for table in ("BrowserTaskEvent", "BrowserTaskReconciliation"):
            await tx.execute_raw(f'DELETE FROM "{table}" WHERE "taskId" IN (SELECT "id" FROM "BrowserTask" WHERE "sessionId"=$1)', session_id)
        await tx.execute_raw('UPDATE "BrowserActionReview" SET "proposalJson"=NULL,"decision"=NULL WHERE "taskId" IN (SELECT "id" FROM "BrowserTask" WHERE "sessionId"=$1)', session_id)
        await tx.execute_raw(
            '''UPDATE "BrowserReviewAccess" SET "revokedAt"=COALESCE("revokedAt",$2)
               WHERE "sourceSessionId"=$1 OR "reviewerSessionId"=$1''', session_id, now)

    async def discord_start(self, *, owner_id, laptop_id, discord_user_id, task_id, goal,
                            provider_consent, expected_generation, now):
        if not goal:
            raise ValueError("Goal cannot be blank")
        async with self.db.tx() as tx:
            link = await self._discord_link(tx, owner_id, discord_user_id)
            sessions = [dict(s) for s in await tx.query_raw(
                '''SELECT * FROM "BrowserRemoteSession" WHERE "ownerId"=$1 AND "sourceDiscordLinkId"=$2
                   AND "discordGeneration"=$3 AND "endedAt" IS NULL ORDER BY "createdAt" DESC FOR UPDATE''', owner_id, link["id"], link["generation"])]
            laptop = row(await tx.query_raw('SELECT * FROM "BrowserLaptop" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR UPDATE', laptop_id, owner_id))
            descriptor = json.loads(laptop["descriptorJson"] or "{}") if laptop else {}
            now = fresh(now)
            provider = descriptor.get("provider")
            if provider not in {"gemini", "cerebras", "groq"}:
                raise PermissionError("Configured browser provider is unavailable")
            session = None
            changed_provider = False
            for candidate in sessions:
                if candidate["providerConsent"] != provider or aware(candidate["expiresAt"]) <= now:
                    changed_provider = changed_provider or candidate["providerConsent"] != provider
                    await self._close_session(tx, candidate["id"], now)
                elif session is None:
                    session = candidate
            if expected_generation is not None and expected_generation != link["generation"]:
                raise PermissionError("Discord account link changed before consent")
            if session is None:
                if changed_provider or provider_consent != provider or expected_generation != link["generation"]:
                    return {"consentRequired": True, "provider": provider, "linkGeneration": link["generation"]}
                session = {"id": str(uuid4()), "providerConsent": provider, "expiresAt": now + timedelta(hours=24)}
                await tx.execute_raw(
                    '''INSERT INTO "BrowserRemoteSession" ("id","ownerId","channel","sourceDiscordLinkId",
                       "discordGeneration","providerConsent","expiresAt","createdAt") VALUES ($1,$2,'discord_dm',$3,$4,$5,$6,$7)''',
                    session["id"], owner_id, link["id"], link["generation"], provider, session["expiresAt"], now)
            elif provider_consent is not None and provider_consent != provider:
                raise PermissionError("Caller cannot choose a different browser provider")
            receipt = await self._enqueue(tx, task_id, owner_id, session, laptop, "public_research", 1, goal, now)
            return {"consentRequired": False, "taskId": task_id, "status": receipt["status"],
                    "browserSessionId": session["id"], "expiresAt": receipt["expiresAt"]}

    async def discord_operation(self, *, owner_id, laptop_id, discord_user_id, task_id, command, token_hash, now):
        async with self.db.tx() as tx:
            link = await self._discord_link(tx, owner_id, discord_user_id)
            if command == "end-session":
                sessions = await tx.query_raw(
                    '''SELECT "id" FROM "BrowserRemoteSession" WHERE "ownerId"=$1 AND "sourceDiscordLinkId"=$2
                       AND "discordGeneration"=$3 AND "endedAt" IS NULL FOR UPDATE''', owner_id, link["id"], link["generation"])
                for session in sessions:
                    await self._close_session(tx, session["id"], now)
                return {"ended": True}
            if command == "availability":
                laptop = row(await tx.query_raw('SELECT * FROM "BrowserLaptop" WHERE "id"=$1 AND "ownerId"=$2', laptop_id, owner_id))
                descriptor = json.loads(laptop["descriptorJson"] or "{}") if laptop else {}
                provider = descriptor.get("provider")
                consent = await tx.query_raw(
                    '''SELECT "id" FROM "BrowserRemoteSession" WHERE "ownerId"=$1 AND "sourceDiscordLinkId"=$2
                       AND "discordGeneration"=$3 AND "providerConsent"=$4 AND "endedAt" IS NULL AND "expiresAt">$5''',
                    owner_id, link["id"], link["generation"], provider, now)
                return {"consentRequired": not bool(consent), "provider": provider, "linkGeneration": link["generation"]}
            task, source, laptop = await self._task(tx, owner_id, task_id, now)
            if (source["channel"] != "discord_dm" or source["sourceDiscordLinkId"] != link["id"]
                    or source["discordGeneration"] != link["generation"] or task["laptopId"] != laptop_id):
                raise PermissionError("Task does not belong to this Discord session")
            if command == "status":
                return await self._view(tx, task, source, laptop, now)
            if command == "stop":
                return {"status": await self._control(tx, task, "stop", now)}
            if command == "ack":
                await self._ack(tx, task, now)
                return {"acknowledged": True}
            if command == "review-link":
                return await self._issue_review_access(tx, task, source, token_hash, now)
            raise ValueError("Unsupported Discord browser operation")
