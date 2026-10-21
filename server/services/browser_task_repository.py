"""Transactional PostgreSQL storage for remote browser sessions and tasks."""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID, uuid4


ACTIVE_STATES = ("queued", "claimed", "running", "paused", "waiting_for_user", "stopping")
TERMINAL_STATES = ("completed", "partial", "failed", "unknown", "cancelled", "expired")


def _reconciliation_state_allowed(state: str) -> bool:
    """Evidence may be appended to terminal state, never used to reopen a task."""
    return state in TERMINAL_STATES


def _row(result):
    if not result:
        return None
    value = result[0]
    return dict(value) if not isinstance(value, dict) else value


def _rows(result):
    return [dict(value) if not isinstance(value, dict) else value for value in (result or [])]


def _iso(value):
    return _aware(value).isoformat() if isinstance(value, datetime) else value


def _aware(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


def _event_page(events: list[dict], *, after: int, current_cursor: int, first_sequence: int | None) -> dict:
    """Return a bounded event page without advancing a client past unseen events."""
    reset = bool(first_sequence is not None and after < first_sequence - 1)
    reset = reset or after > current_cursor
    next_cursor = events[-1]["sequence"] if events else max(0, after)
    return {"events": events, "cursor": next_cursor, "nextCursor": next_cursor, "resetRequired": reset}


def _completion_is_identical(row: dict, state: str, result_json: str | None, reason: str | None) -> bool:
    return (row["state"] == state and row.get("resultJson") == result_json
            and row.get("terminalReason") == reason)


def _reconciliation_is_identical(row: dict, payload: dict) -> bool:
    return all(row.get(key) == payload.get(key) for key in (
        "previousBrokerBootId", "fence", "actionId", "action", "proposalDigest", "outcome",
    ))


class BrowserTaskStorage:
    """Uses parameterized SQL so lease locks and fencing stay in PostgreSQL."""

    def __init__(self, database):
        self.db = database

    async def ensure_laptop(self, owner_id: str, laptop_id: str, descriptor: dict | None = None) -> None:
        descriptor_json = json.dumps(descriptor or {}, separators=(",", ":"), ensure_ascii=False)
        async with self.db.tx() as tx:
            await tx.execute_raw(
                '''INSERT INTO "BrowserLaptop" ("id", "ownerId", "descriptorJson", "updatedAt")
                   VALUES ($1, $2, $3, NOW())
                   ON CONFLICT ("id") DO NOTHING''', laptop_id, owner_id, descriptor_json,
            )
            row = _row(await tx.query_raw('SELECT "ownerId", "revokedAt" FROM "BrowserLaptop" WHERE "id"=$1 FOR UPDATE', laptop_id))
            if not row or row["ownerId"] != owner_id or row["revokedAt"] is not None:
                raise PermissionError("Browser laptop is not available to this owner")

    async def get_worker_identity(self, owner_id: str, laptop_id: str) -> dict | None:
        row = _row(await self.db.query_raw(
            '''SELECT "currentBootId","availability","lastHeartbeatAt","revokedAt"
               FROM "BrowserLaptop" WHERE "id"=$1 AND "ownerId"=$2''', laptop_id, owner_id,
        ))
        return row

    async def require_active_device(self, owner_id: str, device_id: str) -> None:
        row = _row(await self.db.query_raw(
            'SELECT "id" FROM "PhoneChatDevice" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL',
            device_id, owner_id,
        ))
        if not row:
            raise PermissionError("Active phone device is required")

    async def get_availability(self, owner_id: str, laptop_id: str, *, now: datetime | None = None) -> dict | None:
        rows = _rows(await self.db.query_raw(
            '''SELECT "id", "availability", "lastHeartbeatAt", "descriptorJson", "revokedAt"
               FROM "BrowserLaptop" WHERE "id"=$1 AND "ownerId"=$2''', laptop_id, owner_id,
        ))
        if not rows:
            return None
        row = rows[0]
        descriptor = json.loads(row["descriptorJson"] or "{}")
        heartbeat = _aware(row["lastHeartbeatAt"]) if row["lastHeartbeatAt"] else None
        checked_at = now or datetime.now(timezone.utc)
        fresh = bool(heartbeat and (checked_at - heartbeat).total_seconds() <= 45)
        reason = row["availability"] if fresh else "offline"
        return {
            "laptopId": row["id"], "available": reason == "online", "reason": reason,
            "lastHeartbeatAt": _iso(heartbeat), "provider": descriptor.get("provider"),
            "scopes": descriptor.get("scopes", []),
        }

    async def create_session(self, *, session_id: str, owner_id: str, device_id: str,
                             parent_session_id: str | None, provider: str,
                             laptop_id: str, now: datetime) -> dict:
        expires_at = now + timedelta(hours=24)
        async with self.db.tx() as tx:
            await tx.execute_raw('SELECT "id" FROM "User" WHERE "id"=$1 FOR UPDATE', owner_id)
            device = _row(await tx.query_raw(
                'SELECT "id" FROM "PhoneChatDevice" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR SHARE',
                device_id, owner_id,
            ))
            laptop = _row(await tx.query_raw(
                'SELECT "id" FROM "BrowserLaptop" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR SHARE',
                laptop_id, owner_id,
            ))
            if not device or not laptop:
                raise PermissionError("Active phone device and configured laptop are required")
            await tx.execute_raw(
                '''INSERT INTO "BrowserRemoteSession"
                   ("id", "ownerId", "channel", "sourceDeviceId", "parentSessionId", "providerConsent", "expiresAt", "createdAt")
                   VALUES ($1,$2,'phone_pwa',$3,$4,$5,$6,$7)''',
                session_id, owner_id, device_id, parent_session_id, provider, expires_at, now,
            )
        return {"browserSessionId": session_id, "channel": "phone_pwa", "parentSessionId": parent_session_id,
                "sourceLinkGeneration": None, "expiresAt": expires_at}

    async def end_session(self, owner_id: str, device_id: str, session_id: str, *, now: datetime) -> bool:
        async with self.db.tx() as tx:
            await tx.query_raw('SELECT "id" FROM "User" WHERE "id"=$1 FOR UPDATE', owner_id)
            device = _row(await tx.query_raw(
                'SELECT "id" FROM "PhoneChatDevice" WHERE "id"=$1 AND "ownerId"=$2 FOR UPDATE', device_id, owner_id,
            ))
            if not device:
                return False
            session = _row(await tx.query_raw(
                '''SELECT "id","endedAt" FROM "BrowserRemoteSession"
                   WHERE "id"=$1 AND "ownerId"=$2 AND "channel"='phone_pwa'
                     AND ("sourceDeviceId"=$3 OR "endedAt" IS NOT NULL) FOR UPDATE''',
                session_id, owner_id, device_id,
            ))
            if not session:
                return False
            if session["endedAt"] is not None:
                # Safe, owner-authenticated retry after logout/device revocation.
                return True
            await tx.execute_raw(
                '''UPDATE "BrowserRemoteSession" SET "endedAt"=COALESCE("endedAt",$2)
                   WHERE "id"=$1''', session_id, now,
            )
            await tx.execute_raw(
                '''UPDATE "BrowserTask" SET
                     "state"=CASE WHEN "state" IN ('queued','claimed') THEN 'cancelled'::"BrowserRemoteTaskState"
                                   WHEN "state" IN ('running','paused','waiting_for_user') THEN 'stopping'::"BrowserRemoteTaskState"
                                   ELSE "state" END,
                     "cancelRequested"=TRUE,
                     "goal"=NULL, "resultJson"=NULL, "terminalReason"='session_ended',
                     "completedAt"=CASE WHEN "state" IN ('queued','claimed') THEN $2 ELSE "completedAt" END,
                     "activeExpiresAt"=CASE WHEN "state" IN ('queued','claimed') THEN NULL ELSE "activeExpiresAt" END,
                     "requestedControl"='stop',
                     "claimTokenHash"=CASE WHEN "state" IN ('queued','claimed') THEN NULL ELSE "claimTokenHash" END,
                     "leaseExpiresAt"=CASE WHEN "state" IN ('queued','claimed') THEN NULL ELSE "leaseExpiresAt" END
                   WHERE "sessionId"=$1 AND "state" IN ('queued','claimed','running','paused','waiting_for_user','stopping')''',
                session_id, now,
            )
            await tx.execute_raw(
                'UPDATE "BrowserTask" SET "goal"=NULL,"resultJson"=NULL,"currentProposalId"=NULL,"waitingForUserType"=NULL WHERE "sessionId"=$1', session_id,
            )
            await tx.execute_raw(
                '''DELETE FROM "BrowserTaskEvent" WHERE "taskId" IN (SELECT "id" FROM "BrowserTask" WHERE "sessionId"=$1)''',
                session_id,
            )
            await tx.execute_raw(
                '''DELETE FROM "BrowserTaskReconciliation" WHERE "taskId" IN
                   (SELECT "id" FROM "BrowserTask" WHERE "sessionId"=$1)''', session_id,
            )
            await tx.execute_raw(
                '''UPDATE "BrowserActionReview" SET "proposalJson"=NULL, "decision"=NULL
                   WHERE "taskId" IN (SELECT "id" FROM "BrowserTask" WHERE "sessionId"=$1)''', session_id,
            )
            await tx.execute_raw(
                '''UPDATE "BrowserReviewAccess" SET "revokedAt"=COALESCE("revokedAt",$2)
                   WHERE "taskId" IN (SELECT "id" FROM "BrowserTask" WHERE "sessionId"=$1)''', session_id, now,
            )
            return True

    async def enqueue(self, *, task_id: str, owner_id: str, session_id: str, laptop_id: str,
                      scope_id: str, scope_version: int, goal: str, now: datetime) -> dict:
        async with self.db.tx() as tx:
            laptop = _row(await tx.query_raw(
                'SELECT "id" FROM "BrowserLaptop" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR UPDATE',
                laptop_id, owner_id,
            ))
            if not laptop:
                raise PermissionError("Browser laptop is unavailable")
            session_header = _row(await tx.query_raw(
                '''SELECT "sourceDeviceId" FROM "BrowserRemoteSession" WHERE "id"=$1 AND "ownerId"=$2''', session_id, owner_id,
            ))
            if not session_header:
                raise PermissionError("Browser session is closed or expired")
            device = _row(await tx.query_raw(
                'SELECT "id" FROM "PhoneChatDevice" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR SHARE',
                session_header["sourceDeviceId"], owner_id,
            ))
            session = _row(await tx.query_raw(
                '''SELECT "channel", "providerConsent", "expiresAt", "endedAt", "sourceDeviceId"
                   FROM "BrowserRemoteSession" WHERE "id"=$1 AND "ownerId"=$2 FOR UPDATE''', session_id, owner_id,
            ))
            if not device or not session or session["endedAt"] or _aware(session["expiresAt"]) <= _aware(now):
                raise PermissionError("Browser session is closed or expired")
            if session["channel"] != "phone_pwa" or not session["sourceDeviceId"]:
                raise PermissionError("Browser task source is not authorized")
            device = _row(await tx.query_raw(
                'SELECT "id" FROM "PhoneChatDevice" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR SHARE',
                session["sourceDeviceId"], owner_id,
            ))
            if not device:
                raise PermissionError("Phone device has been revoked")
            existing = _row(await tx.query_raw('SELECT * FROM "BrowserTask" WHERE "id"=$1 FOR UPDATE', task_id))
            if existing:
                same = (existing["ownerId"] == owner_id and existing["sessionId"] == session_id
                        and existing["laptopId"] == laptop_id and existing["scopeId"] == scope_id
                        and existing["scopeVersion"] == scope_version and existing["goal"] == goal)
                if not same:
                    raise ValueError("Task ID was already used with different task data")
                if existing["goal"] is None:
                    raise LookupError("Task payload was erased")
                return self._task_receipt(existing)
            counts = _row(await tx.query_raw(
                '''SELECT COUNT(*) FILTER (WHERE "state"='queued')::int AS waiting,
                          COUNT(*) FILTER (WHERE "state" IN ('claimed','running','paused','waiting_for_user','stopping'))::int AS active
                   FROM "BrowserTask" WHERE "laptopId"=$1 AND "queueExpiresAt">NOW()
                     AND "state"=ANY(ARRAY['queued','claimed','running','paused','waiting_for_user','stopping']::"BrowserRemoteTaskState"[])''',
                laptop_id,
            ))
            if counts and (counts["waiting"] >= 4 or counts["active"] >= 1):
                raise OverflowError("Browser laptop queue is busy")
            queue_expiry = min(_aware(session["expiresAt"]), _aware(now) + timedelta(hours=24))
            await tx.execute_raw(
                '''INSERT INTO "BrowserTask"
                   ("id","ownerId","sessionId","laptopId","scopeId","scopeVersion","goal","state","createdAt","queueExpiresAt")
                   VALUES ($1,$2,$3,$4,$5,$6,$7,'queued',$8,$9)''',
                task_id, owner_id, session_id, laptop_id, scope_id, scope_version, goal, now, queue_expiry,
            )
            return {"taskId": task_id, "status": "queued", "createdAt": now, "expiresAt": queue_expiry}

    @staticmethod
    def _task_receipt(row) -> dict:
        return {"taskId": row["id"], "status": row["state"], "createdAt": _aware(row["createdAt"]),
                "expiresAt": _aware(row.get("activeExpiresAt") or row["queueExpiresAt"])}

    async def read_task(self, owner_id: str, device_id: str, session_id: str, task_id: str, *, after: int = 0) -> dict | None:
        async with self.db.tx() as tx:
            task = _row(await tx.query_raw(
                '''SELECT t."id",t."state",t."scopeId",t."createdAt",t."queueExpiresAt",t."resultJson",
                          t."terminalReason",t."eventCursor",s."channel",s."endedAt",s."expiresAt",
                          s."parentSessionId",s."discordGeneration",s."sourceDeviceId"
                   FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                   WHERE t."id"=$1 AND t."ownerId"=$2 AND t."sessionId"=$3 AND s."sourceDeviceId"=$4
                     AND s."endedAt" IS NULL AND s."expiresAt">NOW()''', task_id, owner_id, session_id, device_id,
            ))
            if not task:
                return None
            first = _row(await tx.query_raw(
                'SELECT MIN("sequence") AS "firstSequence" FROM "BrowserTaskEvent" WHERE "taskId"=$1', task_id,
            ))
            first_sequence = first["firstSequence"] if first else None
            reset = bool(first_sequence is not None and after < first_sequence - 1) or after > task["eventCursor"]
            cursor = 0 if reset else max(after, 0)
            events = _rows(await tx.query_raw(
                '''SELECT "sequence","eventType","summary","createdAt" FROM "BrowserTaskEvent"
                   WHERE "taskId"=$1 AND "sequence">$2 ORDER BY "sequence" LIMIT 50''', task_id, cursor,
            ))
        result = json.loads(task["resultJson"]) if task["resultJson"] else None
        events = [{**event, "createdAt": _aware(event["createdAt"])} for event in events]
        page = _event_page(events, after=after, current_cursor=task["eventCursor"], first_sequence=first_sequence)
        return {
            "taskId": task["id"], "status": task["state"], "channel": task["channel"],
            "scopeId": task["scopeId"], "createdAt": _aware(task["createdAt"]), "expiresAt": _aware(task["queueExpiresAt"]),
            "parentSessionId": task["parentSessionId"], "sourceLinkGeneration": task["discordGeneration"],
            "result": result if task["state"] in {"completed", "partial"} else None,
            "terminalReason": task["terminalReason"], **page,
        }

    async def claim(self, *, owner_id: str, laptop_id: str, boot_id: str, now: datetime) -> dict | None:
        import secrets
        lease_id = secrets.token_urlsafe(32)
        lease_hash = hashlib.sha256(lease_id.encode()).hexdigest()
        async with self.db.tx() as tx:
            laptop = _row(await tx.query_raw(
                '''SELECT "currentBootId","availability","revokedAt","descriptorJson" FROM "BrowserLaptop"
                   WHERE "id"=$1 AND "ownerId"=$2 AND "lastHeartbeatAt">NOW()-INTERVAL '45 seconds' FOR UPDATE''',
                laptop_id, owner_id,
            ))
            if not laptop or laptop["revokedAt"] or laptop["currentBootId"] != boot_id or laptop["availability"] != "online":
                return None
            if await tx.query_raw(
                '''SELECT "id" FROM "BrowserTask" WHERE "laptopId"=$1
                   AND "state" IN ('claimed','running','paused','waiting_for_user','stopping') LIMIT 1''', laptop_id,
            ):
                return None
            selected = _row(await tx.query_raw(
                '''SELECT t."id",t."sessionId",t."scopeId",t."scopeVersion",t."goal",t."queueExpiresAt",
                          s."channel",s."providerConsent",s."expiresAt" AS "sessionExpiresAt"
                   FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                   WHERE t."laptopId"=$1 AND t."ownerId"=$2 AND t."state"='queued'
                     AND t."queueExpiresAt">NOW() AND s."endedAt" IS NULL AND s."expiresAt">NOW()
                     AND ((s."channel"='phone_pwa' AND EXISTS (SELECT 1 FROM "PhoneChatDevice" d
                           WHERE d."id"=s."sourceDeviceId" AND d."ownerId"=s."ownerId" AND d."revokedAt" IS NULL))
                       OR (s."channel"='discord_dm' AND EXISTS (SELECT 1 FROM "PhoneDiscordLink" l
                           WHERE l."id"=s."sourceDiscordLinkId" AND l."ownerId"=s."ownerId"
                             AND l."generation"=s."discordGeneration" AND l."revokedAt" IS NULL AND l."discordUserId" IS NOT NULL)))
                   ORDER BY t."createdAt" FOR UPDATE OF t SKIP LOCKED LIMIT 1''', laptop_id, owner_id,
            ))
            if not selected:
                return None
            provider = json.loads(laptop.get("descriptorJson") or "{}").get("provider")
            if provider != selected["providerConsent"]:
                return None
            updated = _row(await tx.query_raw(
                '''UPDATE "BrowserTask" SET "state"='claimed', "prestartAttempts"="prestartAttempts"+1,
                       "fence"="fence"+1, "brokerBootId"=$2, "claimTokenHash"=$3,
                       "leaseExpiresAt"=LEAST(NOW()+INTERVAL '60 seconds',"queueExpiresAt"),
                       "activeExpiresAt"=LEAST(NOW()+INTERVAL '180 seconds',"queueExpiresAt",$4)
                   WHERE "id"=$1 RETURNING "fence","activeExpiresAt","leaseExpiresAt"''',
                selected["id"], boot_id, lease_hash, selected["sessionExpiresAt"],
            ))
            binding = {
                "task_id": selected["id"], "owner_id": owner_id, "channel": selected["channel"],
                "browser_session_id": selected["sessionId"], "laptop_id": laptop_id,
                "broker_boot_id": boot_id, "lease_id": lease_id, "fence": updated["fence"],
                "scope_id": selected["scopeId"], "scope_version": selected["scopeVersion"],
            }
            # The outbound contract is intentionally exact and carries consent established at session creation.
            return {
                "schema_version": 1, "binding": binding, "goal": selected["goal"],
                "provider": selected["providerConsent"], "provider_consent": True,
                "expires_at": _aware(updated["activeExpiresAt"]).timestamp(),
            }

    async def start(self, *, task_id: str, owner_id: str, laptop_id: str, boot_id: str,
                    lease_hash: str, fence: int, now: datetime) -> bool:
        async with self.db.tx() as tx:
            refs = _row(await tx.query_raw(
                '''SELECT s."sourceDeviceId",t."sessionId" FROM "BrowserTask" t
                   JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                   WHERE t."id"=$1 AND t."ownerId"=$2 AND t."laptopId"=$3 AND t."brokerBootId"=$4
                     AND t."claimTokenHash"=$5 AND t."fence"=$6''',
                task_id, owner_id, laptop_id, boot_id, lease_hash, fence,
            ))
            if not refs:
                return False
            device = _row(await tx.query_raw(
                'SELECT "id" FROM "PhoneChatDevice" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR SHARE',
                refs["sourceDeviceId"], owner_id,
            ))
            session = _row(await tx.query_raw(
                '''SELECT "id" FROM "BrowserRemoteSession" WHERE "id"=$1 AND "ownerId"=$2
                   AND "endedAt" IS NULL AND "expiresAt">NOW() FOR UPDATE''', refs["sessionId"], owner_id,
            ))
            if not device or not session:
                return False
            result = await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "state"='running', "startedAt"=COALESCE("startedAt",$7)
                   WHERE "id"=$1 AND "ownerId"=$2 AND "laptopId"=$3 AND "brokerBootId"=$4
                     AND "claimTokenHash"=$5 AND "fence"=$6 AND "leaseExpiresAt">NOW()
                     AND "state" IN ('claimed','running') AND "cancelRequested"=FALSE''',
                task_id, owner_id, laptop_id, boot_id, lease_hash, fence, now,
            )
            return getattr(result, "count", result if isinstance(result, int) else 0) > 0

    async def authorize_dispatch(self, *, task_id: str, owner_id: str, laptop_id: str,
                                 boot_id: str, lease_hash: str, fence: int,
                                 action: str, now: datetime) -> bool:
        """Recheck every source/lease authority immediately before read-only dispatch."""
        async with self.db.tx() as tx:
            task = _row(await tx.query_raw(
                '''SELECT t."scopeId",t."scopeVersion",t."state",t."cancelRequested",t."activeExpiresAt",
                          t."leaseExpiresAt",s."channel",s."providerConsent",s."sourceDeviceId",
                          s."sourceDiscordLinkId",s."discordGeneration",s."endedAt",s."expiresAt",
                          l."descriptorJson"
                   FROM "BrowserTask" t
                   JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                   JOIN "BrowserLaptop" l ON l."id"=t."laptopId"
                   WHERE t."id"=$1 AND t."ownerId"=$2 AND t."laptopId"=$3
                     AND t."brokerBootId"=$4 AND t."claimTokenHash"=$5 AND t."fence"=$6
                     AND l."ownerId"=$2 AND l."currentBootId"=$4 AND l."revokedAt" IS NULL
                     AND t."state"='running' AND t."cancelRequested"=FALSE
                     AND t."leaseExpiresAt">NOW() AND t."activeExpiresAt">NOW()
                     AND s."ownerId"=$2 AND s."endedAt" IS NULL AND s."expiresAt">NOW()
                   FOR UPDATE OF t,s''',
                task_id, owner_id, laptop_id, boot_id, lease_hash, fence,
            ))
            descriptor = json.loads(task["descriptorJson"] or "{}") if task else {}
            if (not task or task["scopeId"] != "public_research" or task["scopeVersion"] != 1
                    or descriptor.get("provider") != task["providerConsent"]
                    or task["state"] != "running" or task["cancelRequested"]):
                return False
            if task["channel"] == "phone_pwa":
                source = _row(await tx.query_raw(
                    '''SELECT "id" FROM "PhoneChatDevice" WHERE "id"=$1 AND "ownerId"=$2
                       AND "revokedAt" IS NULL FOR SHARE''', task["sourceDeviceId"], owner_id,
                ))
            elif task["channel"] == "discord_dm":
                source = _row(await tx.query_raw(
                    '''SELECT "id" FROM "PhoneDiscordLink" WHERE "id"=$1 AND "ownerId"=$2
                       AND "generation"=$3 AND "revokedAt" IS NULL AND "discordUserId" IS NOT NULL FOR SHARE''',
                    task["sourceDiscordLinkId"], owner_id, task["discordGeneration"],
                ))
            else:
                return False
            return source is not None

    async def renew(self, *, task_id: str, owner_id: str, laptop_id: str, boot_id: str,
                    lease_hash: str, fence: int, now: datetime) -> dict | None:
        async with self.db.tx() as tx:
            row = _row(await tx.query_raw(
                '''UPDATE "BrowserTask" SET "leaseExpiresAt"=LEAST(NOW()+INTERVAL '60 seconds',"activeExpiresAt")
                   WHERE "id"=$1 AND "ownerId"=$2 AND "laptopId"=$3 AND "brokerBootId"=$4
                     AND "claimTokenHash"=$5 AND "fence"=$6 AND "leaseExpiresAt">NOW()
                     AND "state" IN ('claimed','running','paused','waiting_for_user','stopping')
                   RETURNING "state","cancelRequested","requestedControl","leaseExpiresAt","currentProposalId"''',
                task_id, owner_id, laptop_id, boot_id, lease_hash, fence,
            ))
        return row

    async def release_unstarted(self, *, task_id: str, owner_id: str, laptop_id: str, boot_id: str,
                                lease_hash: str, fence: int, now: datetime) -> bool:
        async with self.db.tx() as tx:
            row = _row(await tx.query_raw(
                '''SELECT "startedAt","prestartAttempts" FROM "BrowserTask"
                   WHERE "id"=$1 AND "ownerId"=$2 AND "laptopId"=$3 AND "brokerBootId"=$4
                     AND "claimTokenHash"=$5 AND "fence"=$6 AND "state"='claimed'
                     AND "leaseExpiresAt">NOW() FOR UPDATE''',
                task_id, owner_id, laptop_id, boot_id, lease_hash, fence,
            ))
            if not row or row["startedAt"] is not None:
                return False
            failed = row["prestartAttempts"] >= 3
            await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "state"=$2,"terminalReason"=$3,"completedAt"=$4,
                          "goal"=CASE WHEN $2='failed'::"BrowserRemoteTaskState" THEN NULL ELSE "goal" END,
                          "claimTokenHash"=NULL,"leaseExpiresAt"=NULL,"activeExpiresAt"=NULL,"brokerBootId"=NULL
                   WHERE "id"=$1''',
                task_id, "failed" if failed else "queued",
                "prestart_claims_exhausted" if failed else None,
                now if failed else None,
            )
            return True

    async def control(self, owner_id: str, device_id: str, session_id: str, task_id: str, command: str, *, now: datetime) -> str | None:
        async with self.db.tx() as tx:
            source = _row(await tx.query_raw(
                '''SELECT "sourceDeviceId" FROM "BrowserRemoteSession" WHERE "id"=$1 AND "ownerId"=$2''',
                session_id, owner_id,
            ))
            if not source or source["sourceDeviceId"] != device_id:
                return None
            device = _row(await tx.query_raw(
                'SELECT "id" FROM "PhoneChatDevice" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR SHARE',
                device_id, owner_id,
            ))
            if not device:
                return None
            session = _row(await tx.query_raw(
                '''SELECT "id" FROM "BrowserRemoteSession" WHERE "id"=$1 AND "ownerId"=$2
                   AND "endedAt" IS NULL AND "expiresAt">NOW() FOR UPDATE''', session_id, owner_id,
            ))
            if not session:
                return None
            task = _row(await tx.query_raw(
                '''SELECT t."state",t."startedAt" FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                   WHERE t."id"=$1 AND t."ownerId"=$2 AND t."sessionId"=$3 AND s."sourceDeviceId"=$4
                     AND s."endedAt" IS NULL AND s."expiresAt">NOW() FOR UPDATE OF t''',
                task_id, owner_id, session_id, device_id,
            ))
            if not task:
                return None
            state = task["state"]
            if command == "stop":
                if state == "queued" or (state == "claimed" and task["startedAt"] is None):
                    next_state = "cancelled"
                    await tx.execute_raw(
                        '''UPDATE "BrowserTask" SET "state"='cancelled',"cancelRequested"=TRUE,"goal"=NULL,
                                  "resultJson"=NULL,"terminalReason"='user_stopped',"completedAt"=$2,
                                  "claimTokenHash"=NULL,"leaseExpiresAt"=NULL,"requestedControl"='stop' WHERE "id"=$1''', task_id, now,
                    )
                elif state in {"claimed", "running", "paused", "waiting_for_user"}:
                    next_state = "stopping"
                    await tx.execute_raw(
                        '''UPDATE "BrowserTask" SET "state"='stopping',"cancelRequested"=TRUE,"goal"=NULL,
                                  "resultJson"=NULL,"terminalReason"='user_stopped',"requestedControl"='stop' WHERE "id"=$1''', task_id,
                    )
                else:
                    return state
            elif command == "pause" and state == "running":
                next_state = "paused"
                await tx.execute_raw('UPDATE "BrowserTask" SET "state"=$2,"requestedControl"=$3 WHERE "id"=$1', task_id, next_state, command)
            elif command == "resume" and state == "paused":
                next_state = "running"
                await tx.execute_raw('UPDATE "BrowserTask" SET "state"=$2,"requestedControl"=$3 WHERE "id"=$1', task_id, next_state, command)
            else:
                raise ValueError("Control is invalid for the current task state")
            return next_state

    async def complete(self, *, task_id: str, owner_id: str, laptop_id: str, boot_id: str,
                       lease_hash: str, fence: int, state: str, result_json: str | None,
                       reason: str | None, now: datetime) -> bool:
        async with self.db.tx() as tx:
            row = _row(await tx.query_raw(
                '''SELECT "state","cancelRequested","sessionId","leaseExpiresAt","brokerBootId",
                          "resultJson","terminalReason" FROM "BrowserTask"
                   WHERE "id"=$1 AND "ownerId"=$2 AND "laptopId"=$3 AND "fence"=$4 FOR UPDATE''',
                task_id, owner_id, laptop_id, fence,
            ))
            if not row:
                return False
            if row["state"] in TERMINAL_STATES:
                return (row["brokerBootId"] == boot_id
                        and _completion_is_identical(row, state, result_json, reason))
            if not await tx.query_raw(
                '''SELECT "id" FROM "BrowserTask" WHERE "id"=$1 AND "brokerBootId"=$2
                   AND "claimTokenHash"=$3 AND "leaseExpiresAt">NOW() FOR UPDATE''', task_id, boot_id, lease_hash,
            ):
                return False
            if row["state"] not in {"running", "paused", "waiting_for_user", "stopping"}:
                return False
            if row["cancelRequested"] or row["state"] == "stopping":
                await tx.execute_raw(
                    '''UPDATE "BrowserTask" SET "state"='cancelled',"goal"=NULL,"resultJson"=NULL,
                              "terminalReason"=COALESCE("terminalReason",'user_stopped'),"completedAt"=$2,
                              "claimTokenHash"=NULL,"leaseExpiresAt"=NULL,"requestedControl"=NULL WHERE "id"=$1''', task_id, now,
                )
                return True
            await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "state"=$2,"resultJson"=$3,"terminalReason"=$4,
                          "completedAt"=$5,"goal"=NULL,"claimTokenHash"=NULL,"leaseExpiresAt"=NULL,"requestedControl"=NULL
                   WHERE "id"=$1''', task_id, state, result_json, reason, now,
            )
        return True

    async def acknowledge(self, owner_id: str, device_id: str, session_id: str, task_id: str, *, now: datetime) -> bool:
        async with self.db.tx() as tx:
            source = _row(await tx.query_raw(
                '''SELECT "sourceDeviceId" FROM "BrowserRemoteSession" WHERE "id"=$1 AND "ownerId"=$2''',
                session_id, owner_id,
            ))
            if not source or source["sourceDeviceId"] != device_id:
                return False
            device = _row(await tx.query_raw(
                'SELECT "id" FROM "PhoneChatDevice" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR SHARE',
                device_id, owner_id,
            ))
            if not device:
                return False
            session = _row(await tx.query_raw(
                '''SELECT "id" FROM "BrowserRemoteSession" WHERE "id"=$1 AND "ownerId"=$2
                   AND "endedAt" IS NULL AND "expiresAt">NOW() FOR UPDATE''', session_id, owner_id,
            ))
            if not session:
                return False
            task = _row(await tx.query_raw(
                '''SELECT t."state" FROM "BrowserTask" t JOIN "BrowserRemoteSession" s ON s."id"=t."sessionId"
                   WHERE t."id"=$1 AND t."ownerId"=$2 AND t."sessionId"=$3 AND s."sourceDeviceId"=$4
                     AND s."endedAt" IS NULL AND s."expiresAt">NOW() FOR UPDATE OF t''',
                task_id, owner_id, session_id, device_id,
            ))
            if not task:
                return False
            if task["state"] not in TERMINAL_STATES:
                raise ValueError("Only terminal tasks can be acknowledged")
            await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "goal"=NULL,"resultJson"=NULL,"acknowledgedAt"=COALESCE("acknowledgedAt",$2)
                   WHERE "id"=$1''', task_id, now,
            )
            await tx.execute_raw('DELETE FROM "BrowserTaskEvent" WHERE "taskId"=$1', task_id)
            await tx.execute_raw('DELETE FROM "BrowserTaskReconciliation" WHERE "taskId"=$1', task_id)
            await tx.execute_raw('UPDATE "BrowserActionReview" SET "proposalJson"=NULL WHERE "taskId"=$1', task_id)
            return True

    async def register_boot(self, *, owner_id: str, laptop_id: str, expected_boot_id: str | None,
                            new_boot_id: str, now: datetime) -> bool:
        async with self.db.tx() as tx:
            laptop = _row(await tx.query_raw(
                'SELECT "currentBootId" FROM "BrowserLaptop" WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR UPDATE',
                laptop_id, owner_id,
            ))
            if not laptop:
                return False
            if laptop["currentBootId"] == new_boot_id:
                return True
            if laptop["currentBootId"] != expected_boot_id:
                return False
            previous = laptop["currentBootId"]
            await tx.execute_raw(
                '''UPDATE "BrowserLaptop" SET "currentBootId"=$2,"availability"='offline',"lastHeartbeatAt"=NULL,"updatedAt"=$3
                   WHERE "id"=$1''', laptop_id, new_boot_id, now,
            )
            if previous:
                await tx.execute_raw(
                    '''UPDATE "BrowserTask" SET
                              "state"=CASE WHEN "startedAt" IS NULL AND "prestartAttempts"<3 THEN 'queued'::"BrowserRemoteTaskState"
                                           WHEN "startedAt" IS NULL THEN 'failed'::"BrowserRemoteTaskState"
                                           ELSE 'unknown'::"BrowserRemoteTaskState" END,
                              "claimTokenHash"=NULL,"leaseExpiresAt"=NULL,
                              "brokerBootId"=CASE WHEN "startedAt" IS NULL THEN NULL ELSE "brokerBootId" END,
                              "activeExpiresAt"=NULL,
                              "terminalReason"=CASE WHEN "startedAt" IS NULL AND "prestartAttempts"<3 THEN NULL
                                                    WHEN "startedAt" IS NULL THEN 'prestart_claims_exhausted'
                                                    ELSE 'broker_restarted' END,
                              "goal"=CASE WHEN "startedAt" IS NULL AND "prestartAttempts"<3 THEN "goal" ELSE NULL END,
                              "resultJson"=NULL,"completedAt"=CASE WHEN "startedAt" IS NULL AND "prestartAttempts"<3 THEN NULL ELSE $2::timestamp END
                       WHERE "laptopId"=$1 AND "brokerBootId"=$3 AND "state" IN ('claimed','running','paused','waiting_for_user','stopping')''',
                    laptop_id, now, previous,
                )
            return True

    async def reconcile(self, *, owner_id: str, laptop_id: str, current_boot_id: str,
                        task_id: str, payload: dict, now: datetime) -> bool:
        async with self.db.tx() as tx:
            laptop = _row(await tx.query_raw(
                '''SELECT "currentBootId" FROM "BrowserLaptop"
                   WHERE "id"=$1 AND "ownerId"=$2 AND "revokedAt" IS NULL FOR UPDATE''',
                laptop_id, owner_id,
            ))
            if not laptop or laptop["currentBootId"] != current_boot_id:
                return False
            task = _row(await tx.query_raw(
                '''SELECT "state","brokerBootId","fence" FROM "BrowserTask"
                   WHERE "id"=$1 AND "ownerId"=$2 AND "laptopId"=$3 FOR UPDATE''',
                task_id, owner_id, laptop_id,
            ))
            if (not task or not _reconciliation_state_allowed(task["state"])
                    or task["brokerBootId"] != payload["previousBrokerBootId"]
                    or task["fence"] != payload["fence"]):
                return False
            existing = _row(await tx.query_raw(
                '''SELECT "previousBrokerBootId","fence","actionId","action","proposalDigest","outcome"
                   FROM "BrowserTaskReconciliation" WHERE "taskId"=$1 AND "actionId"=$2 FOR UPDATE''',
                task_id, payload["actionId"],
            ))
            if existing:
                return _reconciliation_is_identical(existing, payload)
            count = _row(await tx.query_raw(
                'SELECT COUNT(*)::int AS "count" FROM "BrowserTaskReconciliation" WHERE "taskId"=$1', task_id,
            ))
            if count and count["count"] >= 128:
                return False
            await tx.execute_raw(
                '''INSERT INTO "BrowserTaskReconciliation"
                   ("id","taskId","previousBrokerBootId","fence","actionId","action","proposalDigest","outcome","createdAt")
                   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)''',
                str(uuid4()), task_id,
                payload["previousBrokerBootId"], payload["fence"], payload["actionId"], payload["action"],
                payload["proposalDigest"], payload["outcome"], now,
            )
            return True

    async def heartbeat(self, *, owner_id: str, laptop_id: str, boot_id: str, availability: str,
                        descriptor_json: str, now: datetime) -> bool:
        result = await self.db.execute_raw(
            '''UPDATE "BrowserLaptop" SET "availability"=$4,"descriptorJson"=$5,"lastHeartbeatAt"=$6,"updatedAt"=$6
               WHERE "id"=$1 AND "ownerId"=$2 AND "currentBootId"=$3 AND "revokedAt" IS NULL''',
            laptop_id, owner_id, boot_id, availability, descriptor_json, now,
        )
        return getattr(result, "count", result if isinstance(result, int) else 0) > 0

    async def append_events(self, *, task_id: str, owner_id: str, laptop_id: str, boot_id: str,
                            lease_hash: str, fence: int, events: list[dict], now: datetime) -> bool:
        async with self.db.tx() as tx:
            try:
                task, source, laptop = await self._task(tx, owner_id, task_id, now)
                self._execution(task, source, laptop, now, states=('running', 'paused', 'waiting_for_user'),
                                laptop_id=laptop_id, boot_id=boot_id, lease_hash=lease_hash, fence=fence)
            except (PermissionError, LookupError):
                return False
            seq = task["eventCursor"]
            for event in events:
                source_sequence = event["sequence"]
                if source_sequence <= seq:
                    continue
                await tx.execute_raw(
                    '''INSERT INTO "BrowserTaskEvent" ("taskId","sequence","eventType","summary","createdAt")
                       VALUES ($1,$2,$3,$4,$5) ON CONFLICT ("taskId","sequence") DO NOTHING''',
                    task_id, source_sequence, event["eventType"], event.get("summary"), now,
                )
                seq = source_sequence
                # Events may mirror worker state but cannot undo a newer phone
                # control or consume/promote an action review.
                event_state = event["eventType"]
                next_state = None
                if task["state"] == "running" and task["requestedControl"] in (None, "resume"):
                    if event_state in {"paused", "waiting_for_user"}:
                        next_state = event_state
                elif (task["state"] == "waiting_for_user" and not task["currentProposalId"]
                      and task["requestedControl"] is None and event_state == "running"):
                    next_state = "running"
                if next_state:
                    await tx.execute_raw(
                        '''UPDATE "BrowserTask" SET "state"=$2::"BrowserRemoteTaskState",
                           "waitingForUserType"=CASE WHEN $2::text='waiting_for_user' THEN 'local_takeover' ELSE NULL END
                           WHERE "id"=$1''', task_id, next_state)
                    task["state"] = next_state
            await tx.execute_raw('UPDATE "BrowserTask" SET "eventCursor"=$2 WHERE "id"=$1', task_id, seq)
            await tx.execute_raw(
                '''DELETE FROM "BrowserTaskEvent" WHERE "taskId"=$1 AND "sequence" <= GREATEST(0,$2-200)''', task_id, seq,
            )
            return True

    async def read_worker_events(self, *, task_id: str, owner_id: str, laptop_id: str, boot_id: str,
                                 lease_hash: str, fence: int, after: int) -> dict | None:
        async with self.db.tx() as tx:
            task = _row(await tx.query_raw(
                '''SELECT "state","eventCursor","resultJson" FROM "BrowserTask"
                   WHERE "id"=$1 AND "ownerId"=$2 AND "laptopId"=$3 AND "brokerBootId"=$4
                     AND "claimTokenHash"=$5 AND "fence"=$6 AND "leaseExpiresAt">NOW()
                     AND "state" IN ('running','paused','waiting_for_user','stopping')''',
                task_id, owner_id, laptop_id, boot_id, lease_hash, fence,
            ))
            if not task:
                return None
            first = _row(await tx.query_raw(
                'SELECT MIN("sequence") AS "firstSequence" FROM "BrowserTaskEvent" WHERE "taskId"=$1', task_id,
            ))
            first_sequence = first["firstSequence"] if first else None
            reset = bool(first_sequence is not None and after < first_sequence - 1) or after > task["eventCursor"]
            cursor = 0 if reset else max(0, after)
            events = _rows(await tx.query_raw(
                '''SELECT "sequence","eventType","summary","createdAt" FROM "BrowserTaskEvent"
                   WHERE "taskId"=$1 AND "sequence">$2 ORDER BY "sequence" LIMIT 50''', task_id, cursor,
            ))
        events = [{**event, "createdAt": _aware(event["createdAt"])} for event in events]
        page = _event_page(events, after=after, current_cursor=task["eventCursor"], first_sequence=first_sequence)
        result = json.loads(task["resultJson"]) if task["resultJson"] and task["state"] in {"completed", "partial"} else None
        return {"taskId": task_id, "state": task["state"], **{key: page[key] for key in ("events", "nextCursor", "resetRequired")},
                "result": result}

    async def sweep(self, *, now: datetime, batch_size: int = 100) -> dict[str, int]:
        if not 1 <= batch_size <= 500:
            raise ValueError("batch_size must be between 1 and 500")
        async with self.db.tx() as tx:
            # Single-owner browser records use the same first lock as revoke and
            # review. Cleanup must never lock a session before its owner.
            await tx.query_raw('''SELECT "id" FROM "User" WHERE "id" IN
                                  (SELECT "ownerId" FROM "BrowserRemoteSession") ORDER BY "id" FOR UPDATE''')
            expired_sessions = _rows(await tx.query_raw(
                '''SELECT "id" FROM "BrowserRemoteSession" WHERE "endedAt" IS NULL AND "expiresAt"<=$1
                   ORDER BY "expiresAt" LIMIT $2 FOR UPDATE''', now, batch_size,
            ))
            for session in expired_sessions:
                await self._close_session(tx, session["id"], now)
            ended = len(expired_sessions)
            expired = await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "state"='expired',"goal"=NULL,"resultJson"=NULL,
                          "terminalReason"='expired',"completedAt"=$1,"claimTokenHash"=NULL,"leaseExpiresAt"=NULL
                   WHERE "id" IN (SELECT "id" FROM "BrowserTask" WHERE "state" IN ('queued','claimed') AND "queueExpiresAt"<=$1 LIMIT $2)''', now, batch_size,
            )
            requeued = await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "state"='queued',"claimTokenHash"=NULL,"leaseExpiresAt"=NULL,
                          "activeExpiresAt"=NULL,"brokerBootId"=NULL,"terminalReason"=NULL
                   WHERE "id" IN (SELECT "id" FROM "BrowserTask" WHERE "state"='claimed' AND "startedAt" IS NULL
                     AND "leaseExpiresAt"<=$1 AND "prestartAttempts"<3 AND "queueExpiresAt">$1 LIMIT $2)''', now, batch_size,
            )
            interrupted = await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "state"='unknown',"goal"=NULL,"resultJson"=NULL,
                          "terminalReason"='lease_expired_after_start',"completedAt"=$1,"claimTokenHash"=NULL,"leaseExpiresAt"=NULL
                   WHERE "id" IN (SELECT "id" FROM "BrowserTask" WHERE "state" IN ('running','paused','waiting_for_user','stopping')
                     AND ("leaseExpiresAt"<=$1 OR "activeExpiresAt"<=$1) LIMIT $2)''', now, batch_size,
            )
            await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "state"='failed',"terminalReason"='prestart_claims_exhausted',
                          "completedAt"=$1,"goal"=NULL,"claimTokenHash"=NULL,"leaseExpiresAt"=NULL
                       WHERE "id" IN (SELECT "id" FROM "BrowserTask" WHERE "state"='claimed' AND "startedAt" IS NULL
                     AND "leaseExpiresAt"<=$1 AND "prestartAttempts">=3 LIMIT $2)''', now, batch_size,
            )
            erased = await tx.execute_raw(
                '''UPDATE "BrowserTask" SET "goal"=NULL,"resultJson"=NULL
                   WHERE "id" IN (SELECT "id" FROM "BrowserTask" WHERE "state" IN ('completed','partial','failed','unknown','cancelled','expired')
                     AND ("goal" IS NOT NULL OR "resultJson" IS NOT NULL)
                     AND "completedAt"<=$1::timestamp-INTERVAL '1 hour' LIMIT $2)''', now, batch_size,
            )
            await tx.execute_raw(
                '''DELETE FROM "BrowserTaskEvent" WHERE "taskId" IN
                   (SELECT DISTINCT e."taskId" FROM "BrowserTaskEvent" e JOIN "BrowserTask" t ON t."id"=e."taskId"
                    WHERE t."goal" IS NULL AND t."resultJson" IS NULL LIMIT $1)''', batch_size,
            )
            await tx.execute_raw(
                '''DELETE FROM "BrowserTaskReconciliation" WHERE "taskId" IN
                   (SELECT DISTINCT e."taskId" FROM "BrowserTaskReconciliation" e JOIN "BrowserTask" t ON t."id"=e."taskId"
                    WHERE t."goal" IS NULL AND t."resultJson" IS NULL LIMIT $1)''', batch_size,
            )
            await tx.execute_raw(
                '''UPDATE "BrowserActionReview" SET "proposalJson"=NULL,"decision"=NULL WHERE "id" IN
                   (SELECT r."id" FROM "BrowserActionReview" r JOIN "BrowserTask" t ON t."id"=r."taskId"
                    WHERE (r."proposalJson" IS NOT NULL OR r."decision" IS NOT NULL)
                      AND (r."expiresAt"<=$1 OR (t."goal" IS NULL AND t."resultJson" IS NULL)) LIMIT $2)''', now, batch_size,
            )
            await tx.execute_raw(
                '''DELETE FROM "BrowserReviewAccess" WHERE "id" IN
                   (SELECT "id" FROM "BrowserReviewAccess" WHERE "expiresAt"<=$1 OR "revokedAt" IS NOT NULL LIMIT $2)''', now, batch_size,
            )
            pruned = await tx.execute_raw(
                '''DELETE FROM "BrowserTask" WHERE "id" IN
                   (SELECT "id" FROM "BrowserTask" WHERE "state" IN ('completed','partial','failed','unknown','cancelled','expired')
                    AND "goal" IS NULL AND "resultJson" IS NULL
                    AND "completedAt"<=$1::timestamp-INTERVAL '24 hours' LIMIT $2)''', now, batch_size,
            )
            await tx.execute_raw(
                '''DELETE FROM "BrowserRemoteSession" WHERE "id" IN
                   (SELECT s."id" FROM "BrowserRemoteSession" s WHERE s."endedAt"<=$1::timestamp-INTERVAL '24 hours'
                    AND NOT EXISTS (SELECT 1 FROM "BrowserTask" t WHERE t."sessionId"=s."id") LIMIT $2)''', now, batch_size,
            )
        return {"sessionsEnded": int(ended or 0), "tasksExpired": int(expired or 0), "prestartClaimsRequeued": int(requeued or 0),
                "startedTasksMarkedUnknown": int(interrupted or 0), "payloadsErased": int(erased or 0), "tombstonesPruned": int(pruned or 0)}


from services.browser_task_review import BrowserReviewRepositoryMixin


class PostgresBrowserTaskRepository(BrowserReviewRepositoryMixin, BrowserTaskStorage):
    """Task storage with transactional review and source-channel authority."""

