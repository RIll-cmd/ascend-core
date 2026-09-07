import os
import sys
import unittest
from types import SimpleNamespace

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.boss_engine import (
    deal_boss_damage,
    resolve_boss_rewards,
    unlock_boss_reward_title,
)
from pydantic import ValidationError
from schemas.bosses import BossCreate


class BossRitualRewardTests(unittest.TestCase):
    def test_custom_spoils_override_gold_and_exp_without_removing_legacy_currency(self):
        self.assertEqual(
            resolve_boss_rewards("HARD", reward_gold=4_500, reward_exp=9_000),
            {"exp": 9_000, "gold": 4_500, "gems": 100, "towerTokens": 250},
        )

    def test_existing_bosses_keep_difficulty_rewards(self):
        self.assertEqual(
            resolve_boss_rewards("EASY"),
            {"exp": 1_000, "gold": 500, "gems": 25, "towerTokens": 50},
        )

    def test_ritual_contract_accepts_calibrated_hp_and_spoils(self):
        payload = BossCreate(
            name="The final release",
            category="CAREER",
            difficulty="LEGENDARY",
            archetype="LEVIATHAN",
            maxHp=125_000,
            rewardGold=24_000,
            rewardExp=40_000,
            rewardTitle="The Unbroken",
            realWorldReward="Weekend trip",
        )

        self.assertEqual(payload.maxHp, 125_000)
        self.assertEqual(payload.rewardTitle, "The Unbroken")

    def test_ritual_contract_rejects_hp_outside_safe_calibration(self):
        with self.assertRaises(ValidationError):
            BossCreate(
                name="Invalid binding",
                category="ACADEMIC",
                difficulty="EASY",
                maxHp=999,
            )

    def test_cosmetic_title_unlock_is_idempotent(self):
        class FakeTitleTable:
            def __init__(self):
                self.rows = {}

            async def upsert(self, where, data):
                existing = self.rows.get(where["name"])
                if existing:
                    return existing
                title = SimpleNamespace(id="title-1", **data["create"])
                self.rows[data["create"]["name"]] = title
                return title

        class FakeCharacterTitleTable:
            def __init__(self):
                self.rows = []

            async def upsert(self, where, data):
                key = where["characterId_titleId"]
                existing = next(
                    (
                        row
                        for row in self.rows
                        if row.characterId == key["characterId"]
                        and row.titleId == key["titleId"]
                    ),
                    None,
                )
                if existing:
                    return existing
                row = SimpleNamespace(**data["create"])
                self.rows.append(row)
                return row

        fake_db = SimpleNamespace(
            title=FakeTitleTable(),
            charactertitle=FakeCharacterTitleTable(),
        )

        import asyncio

        asyncio.run(unlock_boss_reward_title(fake_db, "hunter-1", "The Unbroken"))
        asyncio.run(unlock_boss_reward_title(fake_db, "hunter-1", "The Unbroken"))

        self.assertEqual(len(fake_db.title.rows), 1)
        self.assertIn("The Unbroken", fake_db.title.rows)
        self.assertEqual(len(fake_db.charactertitle.rows), 1)

    def test_protected_title_name_cannot_be_unlocked_by_a_ritual(self):
        protected = SimpleNamespace(
            id="protected-title",
            name="The Scholar",
            requirementType="ACHIEVEMENT",
        )

        class ProtectedTitleTable:
            async def upsert(self, where, data):
                return protected

        class CharacterTitleTable:
            def __init__(self):
                self.created = False

            async def upsert(self, where, data):
                self.created = True

        fake_db = SimpleNamespace(
            title=ProtectedTitleTable(),
            charactertitle=CharacterTitleTable(),
        )

        import asyncio

        unlocked = asyncio.run(
            unlock_boss_reward_title(fake_db, "hunter-1", "The Scholar")
        )
        self.assertFalse(unlocked)
        self.assertFalse(fake_db.charactertitle.created)

    def test_ritual_contract_rejects_rewards_above_the_rank_budget(self):
        with self.assertRaises(ValidationError):
            BossCreate(
                name="Economy exploit",
                category="FITNESS",
                difficulty="HARD",
                maxHp=25_000,
                rewardGold=6_001,
            )

    def test_monarch_override_cannot_drop_below_rank_s_hp(self):
        with self.assertRaises(ValidationError):
            BossCreate(
                name="False monarch",
                category="CAREER",
                difficulty="LEGENDARY",
                maxHp=99_999,
            )

    def test_unknown_difficulty_cannot_bypass_the_reward_budget(self):
        with self.assertRaises(ValidationError):
            BossCreate(
                name="Unknown rank exploit",
                category="CAREER",
                difficulty="UNRANKED",
                maxHp=1_000,
                rewardGold=10_000_000,
            )

    def test_defeat_writes_roll_back_when_title_unlock_fails(self):
        committed = {"hp": 500, "status": "ACTIVE", "gold": 0, "logs": 0}
        activity = SimpleNamespace(
            id="activity-1",
            activityType="HABIT",
            referenceId="habit-1",
            damageValue=500,
        )
        boss = SimpleNamespace(
            id="boss-1",
            name="Protected title boss",
            currentHp=500,
            difficulty="EASY",
            rewardGold=500,
            rewardExp=1000,
            rewardTitle="The Scholar",
            realWorldReward=None,
            activities=[activity],
        )

        class BossTable:
            def __init__(self, state):
                self.state = state

            async def find_many(self, **_kwargs):
                return [boss]

            async def find_unique(self, where):
                return SimpleNamespace(
                    **{
                        **vars(boss),
                        "currentHp": self.state["hp"],
                        "status": self.state["status"],
                    }
                )

            async def update_many(self, where, data):
                if where["currentHp"] != self.state["hp"]:
                    return 0
                self.state["hp"] = data["currentHp"]
                self.state["status"] = data["status"]
                return 1

        class DamageLogTable:
            def __init__(self, state):
                self.state = state

            async def create(self, data):
                self.state["logs"] += 1

        class CharacterTable:
            def __init__(self, state):
                self.state = state

            async def update(self, where, data):
                self.state["gold"] += data["gold"]["increment"]

        class EconomyTable:
            async def create(self, data):
                return None

        class ProtectedTitleTable:
            async def upsert(self, where, data):
                raise RuntimeError("title storage unavailable")

        class CharacterTitleTable:
            async def upsert(self, where, data):
                raise AssertionError("Protected title must not be granted")

        class Transaction:
            def __init__(self, state):
                self.working = dict(state)
                self.boss = BossTable(self.working)
                self.bossdamagelog = DamageLogTable(self.working)
                self.character = CharacterTable(self.working)
                self.economylog = EconomyTable()
                self.title = ProtectedTitleTable()
                self.charactertitle = CharacterTitleTable()

        class TransactionContext:
            def __init__(self, state):
                self.state = state
                self.transaction = Transaction(state)

            async def __aenter__(self):
                return self.transaction

            async def __aexit__(self, exc_type, exc, traceback):
                if exc_type is None:
                    self.state.update(self.transaction.working)
                return False

        class FakeDb:
            def __init__(self, state):
                self.state = state
                self.boss = BossTable(state)
                self.bossdamagelog = DamageLogTable(state)
                self.character = CharacterTable(state)
                self.economylog = EconomyTable()
                self.title = ProtectedTitleTable()
                self.charactertitle = CharacterTitleTable()

            def tx(self):
                return TransactionContext(self.state)

        import asyncio

        with self.assertRaises(RuntimeError):
            asyncio.run(
                deal_boss_damage(FakeDb(committed), "hunter-1", "HABIT", "habit-1")
            )

        self.assertEqual(
            committed,
            {"hp": 500, "status": "ACTIVE", "gold": 0, "logs": 0},
        )

    def test_damage_uses_the_transactional_hp_snapshot(self):
        state = {"hp": 300, "logs": 0}
        activity = SimpleNamespace(
            id="activity-1",
            activityType="HABIT",
            referenceId="habit-1",
            damageValue=100,
        )
        stale_boss = SimpleNamespace(
            id="boss-1",
            name="Concurrent boss",
            currentHp=500,
            status="ACTIVE",
            difficulty="EASY",
            activities=[activity],
        )

        class RootBossTable:
            async def find_many(self, **_kwargs):
                return [stale_boss]

        class TransactionBossTable:
            async def find_unique(self, where):
                return SimpleNamespace(**{**vars(stale_boss), "currentHp": state["hp"]})

            async def update_many(self, where, data):
                if where["currentHp"] != state["hp"]:
                    return 0
                state["hp"] = data["currentHp"]
                return 1

        class DamageLogTable:
            async def create(self, data):
                state["logs"] += 1

        transaction = SimpleNamespace(
            boss=TransactionBossTable(),
            bossdamagelog=DamageLogTable(),
        )

        class TransactionContext:
            async def __aenter__(self):
                return transaction

            async def __aexit__(self, exc_type, exc, traceback):
                return False

        fake_db = SimpleNamespace(
            boss=RootBossTable(),
            tx=lambda: TransactionContext(),
        )

        import asyncio

        results = asyncio.run(
            deal_boss_damage(fake_db, "hunter-1", "HABIT", "habit-1")
        )

        self.assertEqual(results[0]["newHp"], 200)
        self.assertEqual(state, {"hp": 200, "logs": 1})

    def test_exhausted_damage_conflicts_raise_a_retriable_error(self):
        activity = SimpleNamespace(
            id="activity-1",
            activityType="HABIT",
            referenceId="habit-1",
            damageValue=100,
        )
        boss = SimpleNamespace(
            id="boss-1",
            name="Contended boss",
            currentHp=500,
            status="ACTIVE",
            difficulty="EASY",
            activities=[activity],
        )

        class RootBossTable:
            async def find_many(self, **_kwargs):
                return [boss]

        class TransactionBossTable:
            async def find_unique(self, where):
                return boss

            async def update_many(self, where, data):
                return 0

        class TransactionContext:
            async def __aenter__(self):
                return SimpleNamespace(boss=TransactionBossTable())

            async def __aexit__(self, exc_type, exc, traceback):
                return False

        fake_db = SimpleNamespace(
            boss=RootBossTable(),
            tx=lambda: TransactionContext(),
        )

        import asyncio

        with self.assertRaisesRegex(RuntimeError, "retry"):
            asyncio.run(
                deal_boss_damage(fake_db, "hunter-1", "HABIT", "habit-1")
            )


if __name__ == "__main__":
    unittest.main()
