"""Consent-scoped notification intent and delivery state machine."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import asyncio
import hashlib
import json
import re
from urllib.parse import urlsplit
from uuid import uuid4


CHANNELS = frozenset({"pwa_push", "discord_dm"})
PUSH_HOSTS = (
    "fcm.googleapis.com",
    "push.services.mozilla.com",
    "push.apple.com",
    "notify.windows.com",
)
MAX_DETAIL_LENGTH = 2_000
MAX_DELIVERIES_PER_INTENT = 8
MAX_ATTEMPTS = 3
CLAIM_TTL = timedelta(seconds=60)
INTENT_TTL = timedelta(hours=24)


@dataclass
class PushDestination:
    owner_id: str
    device_id: str
    endpoint: str
    p256dh: str
    auth: str
    revoked_at: datetime | None = None


@dataclass
class NotificationIntent:
    intent_id: str
    owner_id: str
    trigger_key: str
    category: str
    detail: str
    created_at: datetime
    expires_at: datetime


@dataclass
class NotificationDelivery:
    delivery_id: str
    intent_id: str
    owner_id: str
    channel: str
    destination_id: str
    status: str = "queued"
    attempt: int = 0
    claim_id: str | None = None
    claim_expires_at: datetime | None = None
    next_attempt_at: datetime | None = None
    outcome: str | None = None


class InMemoryNotificationRepository:
    """Unit-test adapter; durable operation uses PostgresNotificationRepository."""

    def __init__(self):
        self.preferences: dict[str, dict[str, bool]] = {}
        self.push_destinations: dict[tuple[str, str], PushDestination] = {}
        self.discord_destinations: dict[str, str] = {}
        self.intents: dict[str, NotificationIntent] = {}
        self.trigger_index: dict[tuple[str, str], str] = {}
        self.deliveries: dict[str, NotificationDelivery] = {}
        self._lock = asyncio.Lock()

    async def get_preferences(self, owner_id: str) -> dict[str, bool]:
        return dict(self.preferences.get(owner_id, {"pwa_push": False, "discord_dm": False}))

    async def has_destination(self, owner_id: str, channel: str, device_id: str | None = None) -> bool:
        if channel == "pwa_push":
            return any(key[0] == owner_id and (device_id is None or key[1] == device_id)
                       and value.revoked_at is None for key, value in self.push_destinations.items())
        return owner_id in self.discord_destinations

    async def set_preference(self, owner_id: str, channel: str, enabled: bool) -> None:
        async with self._lock:
            self.preferences.setdefault(owner_id, {"pwa_push": False, "discord_dm": False})[channel] = enabled

    async def register_push(self, destination: PushDestination) -> None:
        async with self._lock:
            self.push_destinations[(destination.owner_id, destination.device_id)] = destination

    async def revoke_push(self, owner_id: str, device_id: str, now: datetime) -> bool:
        async with self._lock:
            destination = self.push_destinations.get((owner_id, device_id))
            if not destination:
                return False
            destination.revoked_at = now
            return True

    async def set_discord_destination(self, owner_id: str, discord_user_id: str, linked: bool) -> None:
        async with self._lock:
            if linked:
                self.discord_destinations[owner_id] = discord_user_id
            else:
                self.discord_destinations.pop(owner_id, None)

    async def publish(self, intent: NotificationIntent, *, daily_limit: int) -> NotificationIntent | None:
        trigger = (intent.owner_id, intent.trigger_key)
        async with self._lock:
            existing_id = self.trigger_index.get(trigger)
            if existing_id:
                return self.intents[existing_id]
            prefs = self.preferences.get(intent.owner_id, {"pwa_push": False, "discord_dm": False})
            destinations: list[tuple[str, str]] = []
            if prefs["pwa_push"]:
                destinations.extend(("pwa_push", device_id) for (candidate, device_id), item in self.push_destinations.items()
                                    if candidate == intent.owner_id and item.revoked_at is None)
            if prefs["discord_dm"] and intent.owner_id in self.discord_destinations:
                destinations.append(("discord_dm", self.discord_destinations[intent.owner_id]))
            if not destinations:
                return None
            if len(destinations) > MAX_DELIVERIES_PER_INTENT:
                raise ValueError("Too many notification destinations")
            day = intent.created_at.astimezone(timezone.utc).date()
            used = sum(1 for row in self.intents.values()
                       if row.owner_id == intent.owner_id and row.created_at.astimezone(timezone.utc).date() == day)
            if used >= daily_limit:
                return None
            self.intents[intent.intent_id] = intent
            self.trigger_index[trigger] = intent.intent_id
            for channel, destination_id in destinations:
                delivery = NotificationDelivery(str(uuid4()), intent.intent_id, intent.owner_id, channel, destination_id)
                self.deliveries[delivery.delivery_id] = delivery
            return intent

    async def claim(self, *, now: datetime, channel: str | None = None):
        async with self._lock:
            for delivery in sorted(self.deliveries.values(), key=lambda value: value.delivery_id):
                if channel is not None and delivery.channel != channel:
                    continue
                intent = self.intents[delivery.intent_id]
                preferences = self.preferences.get(delivery.owner_id, {"pwa_push": False, "discord_dm": False})
                if not preferences.get(delivery.channel, False):
                    delivery.status = "revoked"
                    continue
                if intent.expires_at <= now:
                    delivery.status, delivery.claim_id = "expired", None
                    continue
                destination = self.push_destinations.get((delivery.owner_id, delivery.destination_id)) if delivery.channel == "pwa_push" else None
                if delivery.channel == "pwa_push" and (not destination or destination.revoked_at is not None):
                    delivery.status = "revoked"
                    continue
                if delivery.channel == "discord_dm" and self.discord_destinations.get(delivery.owner_id) != delivery.destination_id:
                    delivery.status = "revoked"
                    continue
                available = delivery.status == "queued" or (
                    delivery.status == "retry" and delivery.next_attempt_at and delivery.next_attempt_at <= now
                ) or (delivery.status == "claimed" and delivery.claim_expires_at and delivery.claim_expires_at <= now)
                if not available or delivery.attempt >= MAX_ATTEMPTS:
                    continue
                delivery.status, delivery.attempt = "claimed", delivery.attempt + 1
                delivery.claim_id, delivery.claim_expires_at = str(uuid4()), now + CLAIM_TTL
                return self._claim_record(delivery, intent, destination)
        return None

    async def record_outcome(self, delivery_id: str, claim_id: str, outcome: str, *, retryable: bool,
                             revoke_destination: bool = False, now: datetime) -> str:
        async with self._lock:
            delivery = self.deliveries.get(delivery_id)
            if (delivery and delivery.claim_id == claim_id and delivery.outcome == outcome
                    and delivery.status in {outcome, "retry"}):
                return delivery.status
            if not delivery or delivery.status != "claimed" or delivery.claim_id != claim_id:
                raise PermissionError("Notification claim is no longer active")
            if outcome == "failed" and retryable and delivery.attempt < MAX_ATTEMPTS:
                delivery.status, delivery.next_attempt_at = "retry", now + timedelta(seconds=2 ** delivery.attempt)
            else:
                delivery.status = outcome
            if revoke_destination and delivery.channel == "pwa_push":
                destination = self.push_destinations.get((delivery.owner_id, delivery.destination_id))
                if destination:
                    destination.revoked_at = now
                self.preferences.setdefault(delivery.owner_id, {"pwa_push": False, "discord_dm": False})["pwa_push"] = False
            delivery.outcome, delivery.claim_expires_at = outcome, None
            return delivery.status

    async def read_detail(self, owner_id: str, device_id: str, intent_id: str, *, now: datetime) -> dict:
        intent = self.intents.get(intent_id)
        if not intent or intent.owner_id != owner_id or intent.expires_at <= now:
            raise LookupError("Notification detail is unavailable")
        delivered_to_device = any(
            row.intent_id == intent_id and row.channel == "pwa_push" and row.destination_id == device_id
            for row in self.deliveries.values()
        )
        destination = self.push_destinations.get((owner_id, device_id))
        if not delivered_to_device or not destination or destination.revoked_at is not None:
            raise PermissionError("Notification detail is not bound to this device")
        return {"intentId": intent.intent_id, "category": intent.category, "detail": intent.detail,
                "createdAt": intent.created_at.isoformat(), "expiresAt": intent.expires_at.isoformat()}

    @staticmethod
    def _claim_record(delivery, intent, destination):
        return {
            "deliveryId": delivery.delivery_id, "intentId": intent.intent_id, "ownerId": intent.owner_id,
            "channel": delivery.channel, "destinationId": delivery.destination_id,
            "destination": ({"endpoint": destination.endpoint, "p256dh": destination.p256dh, "auth": destination.auth}
                            if destination else {"discordUserId": delivery.destination_id}),
            "expiresAt": intent.expires_at, "attempt": delivery.attempt,
            "claimId": delivery.claim_id,
            "lockScreen": {"title": "Ascend Vision", "body": "You have a private update."},
        }


class CompanionNotificationService:
    def __init__(self, repository, *, owner_id: str, worker_token: str = "worker-secret",
                 daily_limit: int = 5, clock=lambda: datetime.now(timezone.utc)):
        if not owner_id.strip() or not worker_token.strip():
            raise ValueError("notification owner and worker credential must be configured")
        if type(daily_limit) is not int or not 1 <= daily_limit <= 100:
            raise ValueError("notification daily limit must be 1..100")
        self.repository = repository
        self.owner_id = owner_id
        self.worker_token = worker_token
        self.daily_limit = daily_limit
        self.clock = clock

    def _owner(self, owner_id: str) -> None:
        if owner_id != self.owner_id:
            raise PermissionError("Notification is not available to this owner")

    async def get_preferences(self, owner_id: str) -> dict[str, bool]:
        self._owner(owner_id)
        return await self.repository.get_preferences(owner_id)

    async def has_destination(self, owner_id: str, channel: str, device_id: str | None = None) -> bool:
        self._owner(owner_id)
        return await self.repository.has_destination(owner_id, channel, device_id)

    async def set_preference(self, owner_id: str, channel: str, enabled: bool) -> None:
        self._owner(owner_id)
        if channel not in CHANNELS or type(enabled) is not bool:
            raise ValueError("Notification preference is invalid")
        if enabled and not await self.repository.has_destination(owner_id, channel):
            raise ValueError("Notification destination must be linked before enabling this channel")
        await self.repository.set_preference(owner_id, channel, enabled)

    async def register_push(self, owner_id: str, device_id: str, *, endpoint: str, p256dh: str, auth: str) -> None:
        self._owner(owner_id)
        parts = urlsplit(endpoint)
        host = (parts.hostname or "").lower().rstrip(".")
        if (parts.scheme != "https" or not host or parts.username or parts.password
                or parts.fragment or len(endpoint) > 2_048
                or not any(host == provider or host.endswith(f".{provider}") for provider in PUSH_HOSTS)):
            raise ValueError("Push endpoint must be an HTTPS URL from a supported browser push provider")
        if (not re.fullmatch(r"[A-Za-z0-9_-]{16,256}", p256dh)
                or not re.fullmatch(r"[A-Za-z0-9_-]{8,128}", auth)):
            raise ValueError("Push subscription keys are invalid")
        if not device_id or len(device_id) > 128:
            raise ValueError("Push device identity is invalid")
        await self.repository.register_push(PushDestination(owner_id, device_id, endpoint, p256dh, auth))

    async def revoke_push(self, owner_id: str, device_id: str, *, now: datetime | None = None) -> bool:
        self._owner(owner_id)
        return await self.repository.revoke_push(owner_id, device_id, now or self.clock())

    async def set_discord_destination(self, owner_id: str, discord_user_id: str, *, linked: bool) -> None:
        self._owner(owner_id)
        if linked:
            if not discord_user_id.isdecimal() or not discord_user_id or int(discord_user_id) <= 0:
                raise ValueError("Discord destination is invalid")
        await self.repository.set_discord_destination(owner_id, discord_user_id, linked)

    async def publish(self, owner_id: str, trigger_key: str, category: str, detail: str, *,
                      now: datetime | None = None, expires_at: datetime | None = None) -> NotificationIntent | None:
        self._owner(owner_id)
        if (not isinstance(trigger_key, str) or not re.fullmatch(r"[A-Za-z0-9._:-]{1,128}", trigger_key)
                or not isinstance(category, str) or not 1 <= len(category.strip()) <= 64
                or "\n" in category or "\r" in category
                or not isinstance(detail, str) or not detail.strip() or len(detail) > MAX_DETAIL_LENGTH
                or "\n" in detail or "\r" in detail):
            raise ValueError("Notification intent is invalid")
        checked = now or self.clock()
        ends = expires_at or checked + INTENT_TTL
        if ends.tzinfo is None or ends.utcoffset() is None or checked.tzinfo is None or checked.utcoffset() is None:
            raise ValueError("Notification timestamps must include a timezone")
        if ends <= checked or ends > checked + INTENT_TTL:
            raise ValueError("Notification expiry must be within 24 hours")
        intent = NotificationIntent(str(uuid4()), owner_id, trigger_key, category.strip(), detail.strip(), checked, ends)
        return await self.repository.publish(intent, daily_limit=self.daily_limit)

    async def claim(self, worker_token: str, *, channel: str | None = None, now: datetime | None = None):
        if worker_token != self.worker_token:
            raise PermissionError("Notification worker credential rejected")
        if channel is not None and channel not in CHANNELS:
            raise ValueError("Notification channel is invalid")
        return await self.repository.claim(now=now or self.clock(), channel=channel)

    async def record_outcome(self, worker_token: str, delivery_id: str, claim_id: str, outcome: str, *,
                             retryable: bool = False, revoke_destination: bool = False,
                             now: datetime | None = None) -> str:
        if worker_token != self.worker_token:
            raise PermissionError("Notification worker credential rejected")
        if outcome not in {"attempted", "acknowledged", "unknown", "failed"}:
            raise ValueError("Notification outcome is invalid")
        if revoke_destination and (outcome != "failed" or retryable):
            raise ValueError("Only a permanent failed delivery may revoke its destination")
        return await self.repository.record_outcome(delivery_id, claim_id, outcome, retryable=retryable,
                                                    revoke_destination=revoke_destination,
                                                    now=now or self.clock())

    async def read_detail(self, owner_id: str, device_id: str, intent_id: str, *, now: datetime | None = None) -> dict:
        self._owner(owner_id)
        return await self.repository.read_detail(owner_id, device_id, intent_id, now=now or self.clock())


def endpoint_fingerprint(endpoint: str) -> str:
    """Stable dedup key; never log or use the push capability URL as an identifier."""
    return hashlib.sha256(endpoint.encode("utf-8")).hexdigest()


class PostgresNotificationRepository:
    """Durable adapter. Owner-row locking serializes budget and idempotency checks."""

    def __init__(self, database, cipher):
        self.db = database
        self.cipher = cipher

    async def get_preferences(self, owner_id: str) -> dict[str, bool]:
        row = await self.db.companionnotificationpreference.find_unique(where={"ownerId": owner_id})
        return {"pwa_push": bool(row.pwaPushEnabled), "discord_dm": bool(row.discordDmEnabled)} if row else {
            "pwa_push": False, "discord_dm": False,
        }

    async def has_destination(self, owner_id: str, channel: str, device_id: str | None = None) -> bool:
        if channel == "pwa_push":
            where = {"ownerId": owner_id, "revokedAt": None}
            if device_id:
                where["deviceId"] = device_id
            return bool(await self.db.companionpushsubscription.find_first(where=where))
        link = await self.db.phonediscordlink.find_unique(where={"ownerId": owner_id})
        return bool(link and link.discordUserId and not link.revokedAt)

    async def set_preference(self, owner_id: str, channel: str, enabled: bool) -> None:
        values = {"pwaPushEnabled": enabled} if channel == "pwa_push" else {"discordDmEnabled": enabled}
        await self.db.companionnotificationpreference.upsert(where={"ownerId": owner_id}, data={
            "create": {"ownerId": owner_id, **values}, "update": values,
        })

    async def register_push(self, destination: PushDestination) -> None:
        payload = self.cipher.encrypt(json.dumps({
            "endpoint": destination.endpoint, "p256dh": destination.p256dh, "auth": destination.auth,
        }, separators=(",", ":")))
        await self.db.companionpushsubscription.upsert(where={"deviceId": destination.device_id}, data={
            "create": {"ownerId": destination.owner_id, "deviceId": destination.device_id,
                       "endpointHash": endpoint_fingerprint(destination.endpoint), "payloadCiphertext": payload},
            "update": {"ownerId": destination.owner_id,
                       "endpointHash": endpoint_fingerprint(destination.endpoint),
                       "payloadCiphertext": payload, "revokedAt": None},
        })

    async def revoke_push(self, owner_id: str, device_id: str, now: datetime) -> bool:
        result = await self.db.companionpushsubscription.update_many(where={
            "ownerId": owner_id, "deviceId": device_id, "revokedAt": None,
        }, data={"revokedAt": now})
        return getattr(result, "count", result if isinstance(result, int) else 0) > 0

    async def set_discord_destination(self, owner_id: str, discord_user_id: str, linked: bool) -> None:
        if linked:
            await self.db.phonediscordlink.upsert(where={"ownerId": owner_id}, data={
                "create": {"ownerId": owner_id, "discordUserId": discord_user_id},
                "update": {"discordUserId": discord_user_id, "revokedAt": None},
            })
        else:
            await self.db.phonediscordlink.update_many(where={"ownerId": owner_id},
                                                       data={"discordUserId": None, "revokedAt": datetime.now(timezone.utc)})

    async def publish(self, intent: NotificationIntent, *, daily_limit: int) -> NotificationIntent | None:
        async with self.db.tx() as tx:
            if not await tx.query_raw('SELECT id FROM "User" WHERE id = $1 FOR UPDATE', intent.owner_id):
                raise PermissionError("Notification owner is unavailable")
            existing = await tx.companionnotificationintent.find_unique(where={
                "ownerId_triggerKey": {"ownerId": intent.owner_id, "triggerKey": intent.trigger_key},
            })
            if existing:
                return NotificationIntent(existing.id, existing.ownerId, existing.triggerKey, existing.category,
                                          self.cipher.decrypt(existing.detailCiphertext), existing.createdAt, existing.expiresAt)
            preferences = await tx.companionnotificationpreference.find_unique(where={"ownerId": intent.owner_id})
            pwa_enabled = bool(preferences and preferences.pwaPushEnabled)
            discord_enabled = bool(preferences and preferences.discordDmEnabled)
            destinations: list[tuple[str, str]] = []
            if pwa_enabled:
                rows = await tx.companionpushsubscription.find_many(where={"ownerId": intent.owner_id, "revokedAt": None})
                destinations.extend(("pwa_push", row.deviceId) for row in rows)
            if discord_enabled:
                link = await tx.phonediscordlink.find_unique(where={"ownerId": intent.owner_id})
                if link and link.discordUserId and not link.revokedAt:
                    destinations.append(("discord_dm", link.discordUserId))
            if not destinations:
                return None
            if len(destinations) > MAX_DELIVERIES_PER_INTENT:
                raise ValueError("Too many notification destinations")
            utc_day = intent.created_at.astimezone(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            budget = await tx.companionnotificationdailybudget.upsert(where={
                "ownerId_day": {"ownerId": intent.owner_id, "day": utc_day},
            }, data={
                "create": {"ownerId": intent.owner_id, "day": utc_day, "used": 0},
                "update": {},
            })
            if budget.used >= daily_limit:
                return None
            reserved = await tx.companionnotificationdailybudget.update_many(where={
                "ownerId": intent.owner_id, "day": utc_day, "used": budget.used,
            }, data={"used": {"increment": 1}})
            if getattr(reserved, "count", reserved if isinstance(reserved, int) else 0) != 1:
                return None
            row = await tx.companionnotificationintent.create(data={
                "id": intent.intent_id, "ownerId": intent.owner_id, "triggerKey": intent.trigger_key,
                "category": intent.category, "detailCiphertext": self.cipher.encrypt(intent.detail),
                "createdAt": intent.created_at, "expiresAt": intent.expires_at,
            })
            for channel, destination_id in destinations:
                await tx.companionnotificationdelivery.create(data={
                    "id": str(uuid4()), "intentId": row.id, "ownerId": intent.owner_id,
                    "channel": channel, "destinationId": destination_id,
                })
        return intent

    async def claim(self, *, now: datetime, channel: str | None = None):
        where = {"OR": [
            {"status": "queued"},
            {"status": "retry", "nextAttemptAt": {"lte": now}},
            {"status": "claimed", "claimExpiresAt": {"lte": now}},
        ], "intent": {"expiresAt": {"gt": now}}}
        if channel is not None:
            where["channel"] = channel
        candidates = await self.db.companionnotificationdelivery.find_many(
            where=where,
            order={"createdAt": "asc"}, take=32,
        )
        for row in candidates:
            if row.attempt >= MAX_ATTEMPTS:
                continue
            intent = await self.db.companionnotificationintent.find_unique(where={"id": row.intentId})
            if not intent or intent.expiresAt <= now:
                await self.db.companionnotificationdelivery.update_many(where={"id": row.id}, data={"status": "expired"})
                continue
            preferences = await self.db.companionnotificationpreference.find_unique(where={"ownerId": row.ownerId})
            enabled = bool(preferences and (preferences.pwaPushEnabled if row.channel == "pwa_push" else preferences.discordDmEnabled))
            if not enabled:
                await self.db.companionnotificationdelivery.update_many(where={"id": row.id}, data={"status": "revoked"})
                continue
            destination_payload = {"discordUserId": row.destinationId}
            if row.channel == "pwa_push":
                destination = await self.db.companionpushsubscription.find_unique(where={"deviceId": row.destinationId})
                if not destination or destination.ownerId != row.ownerId or destination.revokedAt:
                    await self.db.companionnotificationdelivery.update_many(where={"id": row.id}, data={"status": "revoked"})
                    continue
                link = await self.db.phonechatdevice.find_unique(where={"id": row.destinationId})
                if not link or link.revokedAt:
                    await self.db.companionnotificationdelivery.update_many(where={"id": row.id}, data={"status": "revoked"})
                    continue
                destination_payload = json.loads(self.cipher.decrypt(destination.payloadCiphertext))
            else:
                link = await self.db.phonediscordlink.find_unique(where={"ownerId": row.ownerId})
                if not link or link.revokedAt or link.discordUserId != row.destinationId:
                    await self.db.companionnotificationdelivery.update_many(where={"id": row.id}, data={"status": "revoked"})
                    continue
            claim_id = str(uuid4())
            won = await self.db.companionnotificationdelivery.update_many(where={
                "id": row.id, "status": row.status, "claimId": row.claimId,
                "claimExpiresAt": row.claimExpiresAt,
            }, data={"status": "claimed", "attempt": {"increment": 1}, "claimId": claim_id,
                    "claimExpiresAt": now + CLAIM_TTL})
            if getattr(won, "count", won if isinstance(won, int) else 0) != 1:
                continue
            return {
                "deliveryId": row.id, "intentId": intent.id, "ownerId": row.ownerId,
                "channel": row.channel, "destinationId": row.destinationId,
                "destination": destination_payload,
                "expiresAt": intent.expiresAt,
                "attempt": row.attempt + 1, "claimId": claim_id,
                "lockScreen": {"title": "Ascend Vision", "body": "You have a private update."},
            }
        return None

    async def record_outcome(self, delivery_id: str, claim_id: str, outcome: str, *, retryable: bool,
                             revoke_destination: bool = False, now: datetime) -> str:
        async with self.db.tx() as tx:
            row = await tx.companionnotificationdelivery.find_unique(where={"id": delivery_id})
            if (row and row.claimId == claim_id and row.outcome == outcome
                    and row.status in {outcome, "retry"}):
                return row.status
            if not row or row.status != "claimed" or row.claimId != claim_id or row.claimExpiresAt <= now:
                raise PermissionError("Notification claim is no longer active")
            if outcome == "failed" and retryable and row.attempt < MAX_ATTEMPTS:
                state = "retry"
                changes = {"status": state, "outcome": outcome,
                           "nextAttemptAt": now + timedelta(seconds=2 ** row.attempt), "claimId": claim_id, "claimExpiresAt": None}
            else:
                state = outcome
                changes = {"status": state, "outcome": outcome, "claimId": claim_id, "claimExpiresAt": None}
            result = await tx.companionnotificationdelivery.update_many(where={
                "id": delivery_id, "status": "claimed", "claimId": claim_id,
                "claimExpiresAt": row.claimExpiresAt,
            }, data=changes)
            if getattr(result, "count", result if isinstance(result, int) else 0) != 1:
                raise PermissionError("Notification claim is no longer active")
            if revoke_destination and row.channel == "pwa_push":
                await tx.companionpushsubscription.update_many(where={
                    "ownerId": row.ownerId, "deviceId": row.destinationId, "revokedAt": None,
                }, data={"revokedAt": now})
                await tx.companionnotificationpreference.update_many(where={
                    "ownerId": row.ownerId, "pwaPushEnabled": True,
                }, data={"pwaPushEnabled": False})
            return state

    async def read_detail(self, owner_id: str, device_id: str, intent_id: str, *, now: datetime) -> dict:
        destination = await self.db.companionpushsubscription.find_unique(where={"deviceId": device_id})
        if not destination or destination.ownerId != owner_id or destination.revokedAt:
            raise PermissionError("Notification detail is not bound to this device")
        delivery = await self.db.companionnotificationdelivery.find_first(where={
            "intentId": intent_id, "ownerId": owner_id, "channel": "pwa_push", "destinationId": device_id,
        })
        intent = await self.db.companionnotificationintent.find_unique(where={"id": intent_id})
        if not delivery or not intent or intent.ownerId != owner_id or intent.expiresAt <= now:
            raise LookupError("Notification detail is unavailable")
        return {"intentId": intent.id, "category": intent.category,
                "detail": self.cipher.decrypt(intent.detailCiphertext),
                "createdAt": intent.createdAt.isoformat(), "expiresAt": intent.expiresAt.isoformat()}
