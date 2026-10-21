"""Opt-in real PostgreSQL acceptance; never connects to an arbitrary database.

ASCEND_BROWSER_TEST_POSTGRES_URL must name the loopback-only database
ascend_browser_b4_test. ASCEND_BROWSER_TEST_BASELINE points at the full SQL
schema generated from the pre-B4 HEAD Prisma schema (not a hand-made subset).
Each scenario owns a new schema and removes only that schema at exit.
"""
from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
import hashlib
import json
import os
from pathlib import Path
import re
from urllib.parse import urlsplit
from uuid import uuid4

import pytest

from schemas.browser_tasks import BrowserProposalPublish, BrowserSessionCreate, BrowserTaskCreate, BrowserDiscordStart, BrowserWorkerCompletion
from services.browser_task_repository import PostgresBrowserTaskRepository
from services.browser_tasks import BrowserTaskService
from services.phone_chat_pairing import PhoneChatPairing

URL = os.getenv("ASCEND_BROWSER_TEST_POSTGRES_URL", "")
ROOT = Path(__file__).resolve().parents[2]
BASELINE = Path(os.getenv("ASCEND_BROWSER_TEST_BASELINE", str(ROOT / ".superpowers/b4-postgres/baseline.sql")))
pytestmark = pytest.mark.skipif(not URL, reason="Explicit isolated loopback PostgreSQL opt-in is required")


def validated_url():
    parsed = urlsplit(URL)
    if (parsed.scheme not in {"postgres", "postgresql"} or parsed.hostname not in {"127.0.0.1", "::1", "localhost"}
            or parsed.path != "/ascend_browser_b4_test" or parsed.query or parsed.fragment
            or parsed.password is not None):
        raise RuntimeError("Refusing PostgreSQL acceptance outside the explicit isolated loopback database")
    return URL


def parameters(values):
    # Prisma's raw SQL encodes UTC values for its TIMESTAMP(3) columns.
    return tuple(v.astimezone(timezone.utc).replace(tzinfo=None)
                 if isinstance(v, datetime) and v.tzinfo is not None else v for v in values)


class RawDatabase:
    def __init__(self, connection):
        self.connection = connection

    async def query_raw(self, sql, *values):
        return [dict(r) for r in await self.connection.fetch(sql, *parameters(values))]

    async def execute_raw(self, sql, *values):
        tag = await self.connection.execute(sql, *parameters(values))
        return int(tag.split()[-1]) if tag.split()[-1].isdigit() else 0

    @asynccontextmanager
    async def tx(self):
        async with self.connection.acquire() as connection:
            async with connection.transaction():
                yield RawDatabase(connection)


class Scenario:
    def __init__(self, db):
        self.db = db
        self.repo = PostgresBrowserTaskRepository(db)
        self.now = datetime.now(timezone.utc)
        self.service = BrowserTaskService(self.repo, owner_id="owner", laptop_id="laptop", worker_token="test-worker",
                                          enabled=True, writes_enabled=True, clock=lambda: self.now)
        self.scope = {"scopeId": "form", "version": 1, "origin": "https://example.com", "actions": ["fill", "select", "click"]}
        self.descriptor = {"provider": "gemini", "scopes": [self.scope]}

    async def boot(self):
        await self.repo.ensure_laptop("owner", "laptop")
        assert await self.service.register_boot(None, "boot")
        assert await self.service.heartbeat("boot", "online", self.descriptor)

    async def session(self, device="device"):
        return (await self.service.create_session("owner", BrowserSessionCreate(deviceId=device, providerConsent="gemini")))["browserSessionId"]

    async def enqueue(self, session=None, scope="form", task_id=None, device="device"):
        session = session or await self.session(device)
        task_id = task_id or str(uuid4())
        payload = BrowserTaskCreate(taskId=task_id, browserSessionId=session, laptopId="laptop",
                                    goal="Review a sample form", scopeId=scope, scopeVersion=1)
        receipt = await self.service.enqueue("owner", device, payload)
        return task_id, session, payload, receipt

    async def running(self, scope="form"):
        task, session, _, _ = await self.enqueue(scope=scope)
        claim = await self.service.claim("boot")
        binding = claim["binding"]
        assert await self.service.start(task, "boot", binding["lease_id"], binding["fence"])
        return task, session, binding

    def proposal(self, task, *, action_id="action", action="fill", **changes):
        value = dict(task_id=task, action_id=action_id, owner="owner", observation_id="obs-1",
                     document_revision=1, origin="https://example.com", action=action,
                     target_ref="element-1", target_label="Name", arguments={"value": "Example"} if action != "click" else {},
                     expected_effect="Update the sample form", expires_at=(self.now + timedelta(seconds=90)).timestamp())
        value.update(changes)
        value["digest"] = hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
        return value

    async def publish(self, task, binding, **changes):
        proposal = self.proposal(task, **changes)
        assert await self.service.publish_proposal(task, "boot", binding["lease_id"], binding["fence"],
            BrowserProposalPublish(waitingForUserType="action_review", proposal=proposal))
        return proposal

    async def approve(self, task, session, proposal, approved=True, device="device"):
        return await self.service.decide_review("owner", device, session, task, proposal["action_id"], proposal["digest"], approved)

    async def dispatch(self, task, binding, proposal=None, attempt="attempt", action="fill"):
        return await self.service.authorize_dispatch("boot", task, binding["lease_id"], binding["fence"],
                                                     attempt, action, proposal["digest"] if proposal else None)

    async def discord(self):
        payload = BrowserDiscordStart(discordUserId="123456", taskId=str(uuid4()), goal="Read a page")
        consent = await self.service.discord_start(payload)
        assert consent == {"consentRequired": True, "provider": "gemini", "linkGeneration": 1}
        receipt = await self.service.discord_start(payload.model_copy(update={"provider_consent": "gemini", "expected_link_generation": 1}))
        return str(payload.task_id), receipt["browserSessionId"], payload

    async def discord_review(self):
        task, source, _ = await self.discord()
        # Discord starts public research by contract. Fixture changes the stored
        # task to an explicitly configured scope to exercise cross-channel review.
        await self.db.execute_raw('UPDATE "BrowserTask" SET "scopeId"=\'form\',"scopeDescriptorJson"=$2 WHERE "id"=$1', task,
                                  json.dumps(self.scope, sort_keys=True, separators=(",", ":")))
        binding = (await self.service.claim("boot"))["binding"]
        await self.service.start(task, "boot", binding["lease_id"], binding["fence"])
        proposal = await self.publish(task, binding)
        session = await self.session("reviewer")
        access = await self.service.discord_operation("review-link", "123456", task)
        return task, source, binding, proposal, session, access

    async def unlink_relink(self):
        # Actual production invalidation SQL under the same owner lock, with
        # link mutations mirroring the Prisma update_many pairing boundary.
        async with self.db.tx() as tx:
            await tx.query_raw('SELECT "id" FROM "User" WHERE "id"=\'owner\' FOR UPDATE')
            await PhoneChatPairing._invalidate_browser_generation(tx, "link", 1, self.now)
            await tx.execute_raw('UPDATE "PhoneDiscordLink" SET "generation"=3 WHERE "id"=\'link\'')


@asynccontextmanager
async def scenario():
    import asyncpg
    url = validated_url()
    if not BASELINE.is_file():
        raise RuntimeError("Full pre-B4 baseline SQL is required")
    schema = "b4_acceptance_" + uuid4().hex
    assert re.fullmatch(r"b4_acceptance_[a-f0-9]{32}", schema)
    admin = await asyncpg.connect(url)
    pool = None
    try:
        await admin.execute(f'CREATE SCHEMA "{schema}"')
        pool = await asyncpg.create_pool(url, min_size=1, max_size=8,
                                        server_settings={"search_path": f'"{schema}"', "timezone": "UTC", "statement_timeout": "10000"})
        db = RawDatabase(pool)
        await pool.execute(BASELINE.read_text(encoding="utf-8-sig"))
        await db.execute_raw('INSERT INTO "User" ("id","username","updatedAt") VALUES (\'owner\',\'owner\',NOW()),(\'other\',\'other\',NOW())')
        await db.execute_raw('INSERT INTO "PhoneChatDevice" ("id","ownerId") VALUES (\'device\',\'owner\'),(\'reviewer\',\'owner\'),(\'other-device\',\'other\')')
        await db.execute_raw('INSERT INTO "PhoneDiscordLink" ("id","ownerId","discordUserId") VALUES (\'link\',\'owner\',\'123456\')')
        await db.execute_raw('INSERT INTO "PhoneChatJob" ("messageId","ownerId","deviceId","sessionId","text","expiresAt") VALUES (\'prior-message\',\'owner\',\'device\',\'prior-session\',\'Preserve this phone message\',NOW()+INTERVAL \'1 day\')')
        before = await db.query_raw('SELECT * FROM "PhoneChatJob"')
        for _ in range(2):
            for name in ("20260928_browser_tasks_b4", "20260929_browser_review_authority"):
                await pool.execute((ROOT / "server/prisma/migrations" / name / "migration.sql").read_text(encoding="utf-8"))
        assert await db.query_raw('SELECT * FROM "PhoneChatJob"') == before
        value = Scenario(db)
        await value.boot()
        yield value
    finally:
        if pool:
            await pool.close()
        await admin.execute(f'DROP SCHEMA "{schema}" CASCADE')
        await admin.close()


def test_postgres_review_is_immutable_idempotent_and_single_use():
    async def check():
        async with scenario() as s:
            task, session, binding = await s.running()
            proposal = await s.publish(task, binding)
            assert await s.approve(task, session, proposal)
            assert await s.approve(task, session, proposal)
            with pytest.raises(ValueError):
                await s.approve(task, session, proposal, False)
            with pytest.raises(ValueError):
                await s.publish(task, binding, arguments={"value": "Different content"})
            renew = await s.service.renew(task, "boot", binding["lease_id"], binding["fence"])
            assert renew["decision"] == {"actionId": "action", "proposalDigest": proposal["digest"], "approved": True}
            permit = await s.dispatch(task, binding, proposal)
            assert permit["proposalDigest"] == proposal["digest"]
            for attempt in ("attempt", "new-attempt-after-response-loss"):
                with pytest.raises(PermissionError):
                    await s.dispatch(task, binding, proposal, attempt=attempt)
            view = await s.service.read_task("owner", "device", session, task)
            assert view["review"] is None and view["status"] == "running"
    asyncio.run(check())


def test_postgres_simultaneous_stop_and_approval_never_allows_later_dispatch():
    async def check():
        async with scenario() as s:
            task, session, binding = await s.running()
            proposal = await s.publish(task, binding)
            results = await asyncio.gather(s.approve(task, session, proposal),
                s.service.control("owner", "device", session, task, "stop"), return_exceptions=True)
            assert results[1] == "stopping"
            with pytest.raises(PermissionError):
                await s.dispatch(task, binding, proposal)
            assert not await s.db.query_raw('SELECT * FROM "BrowserDispatchAttempt"')
    asyncio.run(check())


def test_postgres_handoff_is_bound_to_one_task_owner_and_consuming_device():
    async def check():
        async with scenario() as s:
            task, _, _, _, reviewer_session, access = await s.discord_review()
            with pytest.raises(PermissionError):
                await s.service.consume_review_access("other", "other-device", reviewer_session, access["token"])
            await s.service.consume_review_access("owner", "reviewer", reviewer_session, access["token"])
            with pytest.raises(PermissionError):
                await s.service.read_task("owner", "device", reviewer_session, task)
            second = str(uuid4())
            await s.service.discord_start(BrowserDiscordStart(discordUserId="123456", taskId=second, goal="Read another page"))
            with pytest.raises(PermissionError):
                await s.service.read_task("owner", "reviewer", reviewer_session, second)
            assert (await s.service.read_task("owner", "reviewer", reviewer_session, task))["taskId"] == task
    asyncio.run(check())


def test_postgres_boot_and_device_revocation_deny_approved_dispatch():
    async def check():
        async with scenario() as s:
            task, session, binding = await s.running()
            proposal = await s.publish(task, binding)
            await s.approve(task, session, proposal)
            await s.db.execute_raw('UPDATE "PhoneChatDevice" SET "revokedAt"=$2 WHERE "id"=$1', "device", s.now)
            with pytest.raises(PermissionError):
                await s.dispatch(task, binding, proposal)
            assert not await s.db.query_raw('SELECT * FROM "BrowserDispatchAttempt"')
        async with scenario() as s:
            task, session, binding = await s.running()
            proposal = await s.publish(task, binding)
            await s.approve(task, session, proposal)
            assert await s.service.register_boot("boot", "new-boot")
            with pytest.raises(PermissionError):
                await s.dispatch(task, binding, proposal)
            assert not await s.db.query_raw('SELECT * FROM "BrowserDispatchAttempt"')
    asyncio.run(check())


def test_postgres_only_one_worker_claim_can_own_a_laptop():
    async def check():
        async with scenario() as s:
            await s.enqueue(scope="public_research")
            await s.enqueue(scope="public_research")
            claims = await asyncio.gather(s.service.claim("boot"), s.service.claim("boot"))
            assert sum(claim is not None for claim in claims) == 1
            assert len(await s.db.query_raw('SELECT "id" FROM "BrowserTask" WHERE "state"=\'claimed\'')) == 1
    asyncio.run(check())


def test_postgres_discord_redelivery_reports_the_active_task_deadline():
    async def check():
        async with scenario() as s:
            task, source, payload = await s.discord()
            binding = (await s.service.claim("boot"))["binding"]
            await s.service.start(task, "boot", binding["lease_id"], binding["fence"])
            status = await s.service.discord_operation("status", "123456", task)
            receipt = await s.service.discord_start(payload)
            assert receipt["status"] == "running"
            # asyncpg raw TIMESTAMP values are naive UTC; receipts normalize UTC.
            assert receipt["expiresAt"].replace(tzinfo=None) == status["expiresAt"].replace(tzinfo=None)
    asyncio.run(check())


def test_postgres_queue_capacity_is_four_waiting_plus_one_active():
    async def check():
        async with scenario() as s:
            await s.running(scope="public_research")
            for _ in range(4):
                await s.enqueue(scope="public_research")
            with pytest.raises(OverflowError):
                await s.enqueue(scope="public_research")
            assert len(await s.db.query_raw('SELECT "id" FROM "BrowserTask" WHERE "state"=\'queued\'')) == 4
    asyncio.run(check())


def test_postgres_paused_lease_renewal_does_not_convert_pause_into_stop():
    async def check():
        async with scenario() as s:
            task, session, binding = await s.running(scope="public_research")
            await s.service.control("owner", "device", session, task, "pause")
            renewal = await s.service.renew(task, "boot", binding["lease_id"], binding["fence"])
            assert renewal["state"] == "paused" and renewal["requestedControl"] == "pause"
            assert renewal["cancelRequested"] is False and renewal["decision"] is None
    asyncio.run(check())


def test_postgres_handoff_is_one_use_task_specific_and_reviewer_logout_revokes_dispatch():
    async def check():
        async with scenario() as s:
            task, source, binding, proposal, reviewer, access = await s.discord_review()
            with pytest.raises(PermissionError):
                await s.service.read_task("owner", "reviewer", reviewer, task)
            grant = await s.service.consume_review_access("owner", "reviewer", reviewer, access["token"])
            assert grant["taskId"] == task
            with pytest.raises(PermissionError):
                await s.service.consume_review_access("owner", "reviewer", reviewer, access["token"])
            assert (await s.service.read_task("owner", "reviewer", reviewer, task))["channel"] == "discord_dm"
            assert await s.approve(task, reviewer, proposal, device="reviewer")
            assert await s.service.end_session("owner", "reviewer", reviewer)
            with pytest.raises(PermissionError):
                await s.dispatch(task, binding, proposal)
            with pytest.raises(PermissionError):
                await s.service.read_task("owner", "reviewer", reviewer, task)
    asyncio.run(check())


def test_postgres_stop_wins_before_later_approval_or_dispatch():
    async def check():
        async with scenario() as s:
            task, session, binding = await s.running()
            proposal = await s.publish(task, binding)
            assert await s.approve(task, session, proposal)
            await s.service.control("owner", "device", session, task, "stop")
            with pytest.raises(PermissionError):
                await s.approve(task, session, proposal)
            with pytest.raises(PermissionError):
                await s.dispatch(task, binding, proposal)
    asyncio.run(check())


def test_postgres_discord_generation_change_invalidates_handoff_and_source():
    async def check():
        async with scenario() as s:
            task, source, binding, proposal, reviewer, access = await s.discord_review()
            await s.unlink_relink()
            with pytest.raises(PermissionError):
                await s.service.consume_review_access("owner", "reviewer", reviewer, access["token"])
            with pytest.raises(PermissionError):
                await s.service.discord_operation("status", "123456", task)
            with pytest.raises(PermissionError):
                await s.dispatch(task, binding, proposal)
    asyncio.run(check())


def test_postgres_session_end_prevents_late_event_content_from_reappearing():
    async def check():
        async with scenario() as s:
            task, session, binding = await s.running()
            await s.service.end_session("owner", "device", session)
            accepted = await s.service.append_events(task, "boot", binding["lease_id"], binding["fence"], [
                {"sequence": 1, "eventType": "running", "summary": "Sensitive late page result"}])
            assert not accepted
            assert await s.db.query_raw('SELECT "summary" FROM "BrowserTaskEvent" WHERE "taskId"=$1', task) == []
    asyncio.run(check())


def test_postgres_ending_source_erases_already_completed_result():
    async def check():
        async with scenario() as s:
            task, session, binding = await s.running(scope="public_research")
            payload = BrowserWorkerCompletion(state="completed", summary="A private result", eventsCursor=0,
                                               result={"findings": [{"text": "Erase on logout"}]})
            assert await s.service.complete(task, "boot", binding["lease_id"], binding["fence"], payload)
            assert await s.service.end_session("owner", "device", session)
            stored = (await s.db.query_raw('SELECT "state","goal","resultJson" FROM "BrowserTask" WHERE "id"=$1', task))[0]
            assert stored == {"state": "completed", "goal": None, "resultJson": None}
    asyncio.run(check())


def test_postgres_expired_source_caps_result_lifetime_and_tombstones_are_bounded():
    async def check():
        async with scenario() as s:
            task, session, binding = await s.running(scope="public_research")
            payload = BrowserWorkerCompletion(state="completed", summary="A result", eventsCursor=0,
                                               result={"findings": [{"text": "Erase at session expiry"}]})
            assert await s.service.complete(task, "boot", binding["lease_id"], binding["fence"], payload)
            await s.db.execute_raw('UPDATE "BrowserRemoteSession" SET "expiresAt"=$2 WHERE "id"=$1', session, s.now + timedelta(seconds=1))
            await s.repo.sweep(now=s.now + timedelta(seconds=2), batch_size=2)
            assert (await s.db.query_raw('SELECT "resultJson" FROM "BrowserTask" WHERE "id"=$1', task))[0]["resultJson"] is None
            await s.repo.sweep(now=s.now + timedelta(hours=25), batch_size=2)
            assert await s.db.query_raw('SELECT "id" FROM "BrowserTask" WHERE "id"=$1', task) == []
    asyncio.run(check())


def test_postgres_sweep_progresses_past_already_erased_tombstones():
    async def check():
        async with scenario() as s:
            session = await s.session()
            ids = []
            for number in range(5):
                task, _, _, _ = await s.enqueue(session=session, scope="public_research")
                ids.append(task)
                await s.db.execute_raw('UPDATE "BrowserTask" SET "state"=\'completed\',"goal"=NULL,"resultJson"=$2,"completedAt"=$3 WHERE "id"=$1',
                                       task, json.dumps({"private": number}), s.now - timedelta(hours=2))
            for _ in range(3):
                await s.repo.sweep(now=s.now, batch_size=2)
            assert all(r["resultJson"] is None for r in await s.db.query_raw('SELECT "resultJson" FROM "BrowserTask"'))
    asyncio.run(check())


def test_postgres_lock_wait_cannot_extend_an_expiring_approval():
    async def check():
        async with scenario() as s:
            task, session, binding = await s.running()
            proposal = await s.publish(task, binding)
            await s.approve(task, session, proposal)
            await s.db.execute_raw('UPDATE "BrowserActionReview" SET "expiresAt"=$2 WHERE "taskId"=$1',
                                   task, datetime.now(timezone.utc) + timedelta(seconds=.5))
            s.service.clock = lambda: datetime.now(timezone.utc)
            async with s.db.tx() as tx:
                await tx.query_raw('SELECT "id" FROM "User" WHERE "id"=\'owner\' FOR UPDATE')
                dispatch = asyncio.create_task(s.dispatch(task, binding, proposal))
                await asyncio.sleep(.7)
                assert not dispatch.done()
            with pytest.raises(PermissionError):
                await asyncio.wait_for(dispatch, timeout=3)
            assert await s.db.query_raw('SELECT * FROM "BrowserDispatchAttempt" WHERE "taskId"=$1', task) == []
    asyncio.run(check())
