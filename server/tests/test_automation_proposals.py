from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers import automations


class FakeAutomationRuleStore:
    def __init__(self):
        self.create_calls = []

    async def create(self, **kwargs):
        self.create_calls.append(kwargs)
        return SimpleNamespace(
            id="rule-1",
            characterId=kwargs["data"]["characterId"],
            name=kwargs["data"]["name"],
            enabled=kwargs["data"]["enabled"],
            triggerType=kwargs["data"]["triggerType"],
            matchMode=kwargs["data"]["matchMode"],
            conditionsJson="[]",
            actionsJson='[{"type":"log_bad_habit","habitId":"habit-negative"}]',
            cooldownSeconds=kwargs["data"]["cooldownSeconds"],
            lastTriggeredAt=None,
            createdAt=None,
            updatedAt=None,
        )

    async def find_many(self, **_kwargs):
        return []


class FakeProposalDatabase:
    def __init__(self, *, owned=True, habit=None, habits=None):
        self.character = SimpleNamespace(find_first=self.find_character)
        self.habit = SimpleNamespace(find_unique=self.find_habit, find_many=self.find_habits)
        self.automationrule = FakeAutomationRuleStore()
        self.automationexecution = SimpleNamespace(create=self.unexpected_execution_write)
        self.owned = owned
        self.habit_value = habit or SimpleNamespace(id="habit-negative", characterId="character-1", type="NEGATIVE", name="Avoid scrolling")
        self.habits_value = habits or [self.habit_value]
        self.find_many_calls = []

    async def find_character(self, **_kwargs):
        return SimpleNamespace(id="character-1") if self.owned else None

    async def find_habit(self, **_kwargs):
        return self.habit_value

    async def find_habits(self, **kwargs):
        self.find_many_calls.append(kwargs)
        return self.habits_value

    async def unexpected_execution_write(self, **_kwargs):
        raise AssertionError("proposal validation must not create an execution")


def valid_proposal(**overrides):
    proposal = {
        "characterId": "character-1",
        "name": "Log scrolling after phone use",
        "triggerType": "phone_usage_observed",
        "matchMode": "all",
        "conditions": [{"field": "payload.confidence", "operator": "greater_than_or_equal", "value": 0.8}],
        "actions": [{"type": "log_bad_habit", "habitId": "habit-negative"}],
        "cooldownSeconds": 300,
    }
    proposal.update(overrides)
    return proposal


@pytest.fixture
def app():
    application = FastAPI()
    application.include_router(automations.router)
    return application


@pytest.fixture
def authenticated_client(app):
    async def current_user():
        return {"id": "user-1", "username": "tester"}

    app.dependency_overrides[automations.get_current_automation_user] = current_user
    return TestClient(app)


def test_capabilities_require_authenticated_user(app):
    response = TestClient(app).get("/api/automations/capabilities")

    assert response.status_code == 401


def test_capabilities_expose_versioned_core_allowlists(authenticated_client):
    response = authenticated_client.get("/api/automations/capabilities")

    assert response.status_code == 200
    body = response.json()
    assert body["version"]
    assert body["triggers"] == ["phone_usage_observed", "drowsiness_observed", "posture_observed"]
    assert body["matchModes"] == ["all", "any"]
    assert body["actions"] == [{"type": "log_bad_habit", "target": "owned_negative_habit"}]
    assert body["limits"]["maxConditions"] == 20


def test_eligible_habits_returns_only_id_and_name_for_owned_character(authenticated_client, monkeypatch):
    database = FakeProposalDatabase()
    monkeypatch.setattr(automations, "db", database)

    response = authenticated_client.get("/api/automations/eligible-habits?characterId=character-1")

    assert response.status_code == 200
    assert response.json() == {"characterId": "character-1", "habits": [{"id": "habit-negative", "name": "Avoid scrolling"}]}
    assert database.find_many_calls == [{"where": {"characterId": "character-1", "type": "NEGATIVE"}}]


def test_eligible_habits_rejects_unowned_character(authenticated_client, monkeypatch):
    monkeypatch.setattr(automations, "db", FakeProposalDatabase(owned=False))

    response = authenticated_client.get("/api/automations/eligible-habits?characterId=other-character")

    assert response.status_code == 403


def test_valid_proposal_is_normalized_without_persistence_or_side_effects(authenticated_client, monkeypatch):
    database = FakeProposalDatabase()
    monkeypatch.setattr(automations, "db", database)

    response = authenticated_client.post("/api/automations/proposals/validate", json=valid_proposal())

    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is True
    assert body["requiresConfirmation"] is False
    assert body["normalizedProposal"] == valid_proposal(enabled=True)
    assert body["preview"]["targetHabit"] == {"id": "habit-negative", "name": "Avoid scrolling"}
    assert body["preview"]["sideEffectsDuringValidation"] is False
    assert database.automationrule.create_calls == []


def test_supported_trigger_with_empty_conditions_is_automatically_confirmable(authenticated_client, monkeypatch):
    database = FakeProposalDatabase()
    monkeypatch.setattr(automations, "db", database)

    response = authenticated_client.post(
        "/api/automations/proposals/validate",
        json=valid_proposal(triggerType="drowsiness_observed", conditions=[]),
    )

    assert response.status_code == 200
    assert response.json()["requiresConfirmation"] is False
    assert response.json()["normalizedProposal"]["conditions"] == []


def test_unsupported_capability_version_is_rejected(authenticated_client, monkeypatch):
    monkeypatch.setattr(automations, "db", FakeProposalDatabase())

    response = authenticated_client.post(
        "/api/automations/proposals/validate",
        json=valid_proposal(capabilityVersion="old-version"),
    )

    assert response.status_code == 422
    assert response.json()["errors"][0]["code"] == "unsupported_capability_version"


@pytest.mark.parametrize(
    ("change", "value"),
    [
        ("triggerType", "made_up_trigger"),
        ("matchMode", "xor"),
        ("conditions", [{"field": "payload.command", "operator": "equals", "value": "run"}]),
        ("conditions", [{"field": "payload.confidence", "operator": "exec", "value": 1}]),
        ("conditions", [{"type": "time_window", "start": "25:00", "end": "10:00"}]),
        ("actions", [{"type": "run_shell", "habitId": "habit-negative"}]),
    ],
)
def test_invalid_proposal_components_return_normalized_errors(authenticated_client, monkeypatch, change, value):
    monkeypatch.setattr(automations, "db", FakeProposalDatabase())

    response = authenticated_client.post("/api/automations/proposals/validate", json=valid_proposal(**{change: value}))

    assert response.status_code == 422
    assert response.json()["valid"] is False
    assert response.json()["errors"]


def test_fabricated_or_cross_character_habit_is_a_generic_ineligible_target(authenticated_client, monkeypatch):
    database = FakeProposalDatabase(habit=SimpleNamespace(id="other-habit", characterId="other-character", type="NEGATIVE", name="Private"))
    monkeypatch.setattr(automations, "db", database)

    response = authenticated_client.post("/api/automations/proposals/validate", json=valid_proposal())

    assert response.status_code == 422
    assert response.json() == {"valid": False, "requiresConfirmation": False, "errors": [{"code": "target_not_eligible"}]}
    assert database.automationrule.create_calls == []


def test_fabricated_habit_id_does_not_disclose_existence(authenticated_client, monkeypatch):
    database = FakeProposalDatabase()
    database.habit_value = None
    monkeypatch.setattr(automations, "db", database)

    response = authenticated_client.post("/api/automations/proposals/validate", json=valid_proposal())

    assert response.status_code == 422
    assert response.json() == {"valid": False, "requiresConfirmation": False, "errors": [{"code": "target_not_eligible"}]}
    assert database.automationrule.create_calls == []


def test_existing_persistence_reuses_semantic_validation(authenticated_client, monkeypatch):
    database = FakeProposalDatabase()
    monkeypatch.setattr(automations, "db", database)

    response = authenticated_client.post(
        "/api/automations",
        json=valid_proposal(conditions=[{"field": "payload.posture", "operator": "greater_than", "value": 2}]),
    )

    assert response.status_code == 422
    assert database.automationrule.create_calls == []


def test_existing_post_is_the_only_rule_persistence_path(authenticated_client, monkeypatch):
    database = FakeProposalDatabase()
    monkeypatch.setattr(automations, "db", database)

    response = authenticated_client.post("/api/automations", json=valid_proposal())

    assert response.status_code == 201
    assert len(database.automationrule.create_calls) == 1
    assert response.json()["id"] == "rule-1"
