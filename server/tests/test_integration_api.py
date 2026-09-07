from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

from routers import integration


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("INTEGRATION_API_KEY", "test-integration-key")
    app = FastAPI()
    app.include_router(integration.router)
    return TestClient(app)


@pytest.fixture(autouse=True)
def clear_command_request_cache():
    """Keep idempotency state isolated; duplicate command behavior is route-visible."""
    integration.clear_command_request_cache()


def test_status_requires_a_trusted_client(client):
    denied = client.get("/api/integration/status")
    assert denied.status_code == 401

    response = client.get(
        "/api/integration/status",
        headers={"X-Integration-Key": "test-integration-key"},
    )
    assert response.status_code == 200
    assert response.json()["supportedEvents"] == ["workout_completed"]


def test_workout_event_delegates_to_existing_workout_flow(client, monkeypatch):
    async def fake_dispatch(payload):
        assert payload["characterId"] == "char-id-123"
        assert payload["sets"][0]["exerciseId"] == "bench-press"
        return {"sessionId": "session-1", "message": "Workout successfully logged"}

    monkeypatch.setattr(integration, "dispatch_workout_completed", fake_dispatch)

    response = client.post(
        "/api/integration/event",
        headers={"X-Integration-Key": "test-integration-key"},
        json={
            "source": "watch",
            "type": "workout_completed",
            "timestamp": "2026-09-06T20:30:00+08:00",
            "confidence": 0.98,
            "payload": {
                "characterId": "char-id-123",
                "durationSeconds": 1800,
                "sets": [{"exerciseId": "bench-press", "weight": 60, "reps": 8}],
            },
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "action": "workout_logged",
        "message": "Workout successfully logged",
        "data": {"sessionId": "session-1", "message": "Workout successfully logged"},
        "source": "watch",
        "confidence": 0.98,
    }


def test_event_rejects_unknown_types_and_invalid_payloads(client):
    headers = {"X-Integration-Key": "test-integration-key"}
    unknown = client.post(
        "/api/integration/event",
        headers=headers,
        json={"source": "watch", "type": "sleep_detected", "timestamp": "2026-09-06T20:30:00+08:00", "payload": {}},
    )
    invalid = client.post(
        "/api/integration/event",
        headers=headers,
        json={"source": "watch", "type": "workout_completed", "timestamp": "2026-09-06T20:30:00+08:00", "payload": {}},
    )

    assert unknown.status_code == 422
    assert invalid.status_code == 422


def command_payload(**overrides):
    payload = {
        "source": "watch",
        "characterId": "char-id-123",
        "text": "Mark my morning workout mission complete",
        "timestamp": "2026-09-06T20:30:00+08:00",
        "requestId": "request-123",
    }
    payload.update(overrides)
    return payload


def test_command_requires_a_trusted_client(client):
    response = client.post("/api/integration/command", json=command_payload())

    assert response.status_code == 401


def test_command_completes_one_resolved_mission_via_existing_flow(client, monkeypatch):
    async def fake_interpret(_text):
        return integration.CommandIntent(intent="complete_mission", target="morning workout", confidence=0.96)

    async def fake_find_missions(_character_id, _target):
        return [{"id": "mission-1", "name": "Morning Workout", "status": "PENDING"}]

    async def fake_complete_mission(mission_id):
        assert mission_id == "mission-1"
        return {"id": mission_id, "status": "COMPLETED"}

    monkeypatch.setattr(integration, "interpret_command", fake_interpret)
    monkeypatch.setattr(integration, "find_matching_missions", fake_find_missions)
    monkeypatch.setattr(integration, "complete_existing_mission", fake_complete_mission)

    response = client.post(
        "/api/integration/command",
        headers={"X-Integration-Key": "test-integration-key"},
        json=command_payload(),
    )

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "requestId": "request-123",
        "intent": "complete_mission",
        "action": "mission_completed",
        "message": "Morning Workout completed.",
        "data": {"id": "mission-1", "status": "COMPLETED"},
    }


def test_command_completes_one_resolved_habit_via_existing_flow(client, monkeypatch):
    async def fake_interpret(_text):
        return integration.CommandIntent(intent="complete_habit", target="hydration", confidence=0.97)

    async def fake_find_habits(_character_id, _target):
        return [{"id": "habit-1", "name": "Hydration", "status": "ACTIVE"}]

    async def fake_complete_habit(habit_id):
        assert habit_id == "habit-1"
        return {"id": habit_id, "status": "COMPLETED"}

    monkeypatch.setattr(integration, "interpret_command", fake_interpret)
    monkeypatch.setattr(integration, "find_matching_habits", fake_find_habits)
    monkeypatch.setattr(integration, "complete_existing_habit", fake_complete_habit)

    response = client.post(
        "/api/integration/command",
        headers={"X-Integration-Key": "test-integration-key"},
        json=command_payload(requestId="request-habit"),
    )

    assert response.status_code == 200
    assert response.json()["action"] == "habit_completed"
    assert response.json()["data"] == {"id": "habit-1", "status": "COMPLETED"}


def test_unknown_or_malformed_interpretation_never_mutates_data(client, monkeypatch):
    async def fake_interpret(_text):
        return {"intent": "delete_everything", "target": "all"}

    monkeypatch.setattr(integration, "interpret_command", fake_interpret)

    response = client.post(
        "/api/integration/command",
        headers={"X-Integration-Key": "test-integration-key"},
        json=command_payload(requestId="request-unknown"),
    )

    assert response.status_code == 200
    assert response.json()["success"] is False
    assert response.json()["action"] == "unknown"


def test_completion_without_a_target_does_not_mutate_data(client, monkeypatch):
    async def fake_interpret(_text):
        return integration.CommandIntent(intent="complete_mission", confidence=0.91)

    monkeypatch.setattr(integration, "interpret_command", fake_interpret)

    response = client.post(
        "/api/integration/command",
        headers={"X-Integration-Key": "test-integration-key"},
        json=command_payload(text="Mark it complete", requestId="request-no-target"),
    )

    assert response.status_code == 200
    assert response.json()["success"] is False
    assert response.json()["action"] == "not_found"


def test_ambiguous_target_returns_options_without_completing(client, monkeypatch):
    async def fake_interpret(_text):
        return integration.CommandIntent(intent="complete_mission", target="workout", confidence=0.96)

    async def fake_find_missions(_character_id, _target):
        return [
            {"id": "mission-1", "name": "Morning Workout", "status": "PENDING"},
            {"id": "mission-2", "name": "Evening Workout", "status": "PENDING"},
        ]

    monkeypatch.setattr(integration, "interpret_command", fake_interpret)
    monkeypatch.setattr(integration, "find_matching_missions", fake_find_missions)

    response = client.post(
        "/api/integration/command",
        headers={"X-Integration-Key": "test-integration-key"},
        json=command_payload(requestId="request-ambiguous"),
    )

    assert response.status_code == 200
    assert response.json()["needsConfirmation"] is True
    assert len(response.json()["options"]) == 2


def test_duplicate_request_id_replays_result_without_second_side_effect(client, monkeypatch):
    calls = 0

    async def fake_interpret(_text):
        return integration.CommandIntent(intent="complete_mission", target="morning workout", confidence=0.96)

    async def fake_find_missions(_character_id, _target):
        return [{"id": "mission-1", "name": "Morning Workout", "status": "PENDING"}]

    async def fake_complete_mission(_mission_id):
        nonlocal calls
        calls += 1
        return {"id": "mission-1", "status": "COMPLETED"}

    monkeypatch.setattr(integration, "interpret_command", fake_interpret)
    monkeypatch.setattr(integration, "find_matching_missions", fake_find_missions)
    monkeypatch.setattr(integration, "complete_existing_mission", fake_complete_mission)
    headers = {"X-Integration-Key": "test-integration-key"}

    first = client.post("/api/integration/command", headers=headers, json=command_payload(requestId="request-repeat"))
    second = client.post("/api/integration/command", headers=headers, json=command_payload(requestId="request-repeat"))

    assert first.status_code == second.status_code == 200
    assert second.json() == first.json()
    assert calls == 1


def test_missions_query_returns_existing_mission_data(client, monkeypatch):
    async def fake_interpret(_text):
        return integration.CommandIntent(intent="get_missions", confidence=0.99)

    async def fake_today_missions(_character_id):
        return [{"id": "mission-1", "name": "Morning Workout", "status": "PENDING"}]

    monkeypatch.setattr(integration, "interpret_command", fake_interpret)
    monkeypatch.setattr(integration, "get_existing_today_missions", fake_today_missions)

    response = client.post(
        "/api/integration/command",
        headers={"X-Integration-Key": "test-integration-key"},
        json=command_payload(text="What missions do I have today?", requestId="request-query"),
    )

    assert response.status_code == 200
    assert response.json()["action"] == "missions_query"
    assert response.json()["data"] == [{"id": "mission-1", "name": "Morning Workout", "status": "PENDING"}]


def observation_payload(**overrides):
    payload = {
        "source": "phone_cv",
        "type": "phone_usage_observed",
        "characterId": "char-id-123",
        "timestamp": "2026-09-07T20:30:00+08:00",
        "eventId": "550e8400-e29b-41d4-a716-446655440000",
        "payload": {
            "confidence": 0.91,
            "posture": "texting",
            "detector": "yolo26n+mediapipe",
        },
    }
    payload.update(overrides)
    return payload


@pytest.mark.parametrize("event_type", ["phone_usage_observed", "posture_observed", "sleep_state_observed"])
def test_observation_types_are_persisted_without_domain_side_effects(client, monkeypatch, event_type):
    async def fake_character_exists(character_id):
        assert character_id == "char-id-123"
        return True

    async def fake_persist(event):
        assert event.type == event_type
        return {"id": "observation-1", "eventId": str(event.eventId)}, False

    async def unexpected_workout_dispatch(_payload):
        raise AssertionError("observation must not enter the workout flow")

    monkeypatch.setattr(integration, "integration_character_exists", fake_character_exists)
    monkeypatch.setattr(integration, "persist_observation", fake_persist)
    monkeypatch.setattr(integration, "dispatch_workout_completed", unexpected_workout_dispatch)

    response = client.post(
        "/api/integration/event",
        headers={"X-Integration-Key": "test-integration-key"},
        json=observation_payload(type=event_type),
    )

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "action": "observation_recorded",
        "message": f"{event_type} recorded as an observation.",
        "data": {"id": "observation-1", "eventId": "550e8400-e29b-41d4-a716-446655440000"},
        "duplicate": False,
    }


def test_observation_rejects_unknown_character(client, monkeypatch):
    async def fake_character_exists(_character_id):
        return False

    monkeypatch.setattr(integration, "integration_character_exists", fake_character_exists)

    response = client.post(
        "/api/integration/event",
        headers={"X-Integration-Key": "test-integration-key"},
        json=observation_payload(characterId="unknown-character"),
    )

    assert response.status_code == 404


@pytest.mark.parametrize(
    "payload",
    [
        observation_payload(type="unknown_observation"),
        observation_payload(payload={"confidence": 1.1, "detector": "cv"}),
        observation_payload(timestamp="2026-09-07T20:30:00"),
        observation_payload(payload={"confidence": 0.9, "detector": "cv", "image": "base64-data"}),
        observation_payload(payload={"detector": "cv"}),
    ],
)
def test_observation_rejects_invalid_or_private_payloads(client, payload):
    response = client.post(
        "/api/integration/event",
        headers={"X-Integration-Key": "test-integration-key"},
        json=payload,
    )

    assert response.status_code == 422


def test_observation_requires_integration_key(client):
    response = client.post("/api/integration/event", json=observation_payload())

    assert response.status_code == 401


def test_duplicate_observation_event_id_is_reported_without_a_second_insert(client, monkeypatch):
    async def fake_character_exists(_character_id):
        return True

    async def fake_persist(_event):
        return {"id": "observation-1", "eventId": "550e8400-e29b-41d4-a716-446655440000"}, True

    monkeypatch.setattr(integration, "integration_character_exists", fake_character_exists)
    monkeypatch.setattr(integration, "persist_observation", fake_persist)

    response = client.post(
        "/api/integration/event",
        headers={"X-Integration-Key": "test-integration-key"},
        json=observation_payload(),
    )

    assert response.status_code == 200
    assert response.json()["duplicate"] is True


def test_new_observation_evaluates_rules_after_persistence(client, monkeypatch):
    calls = 0

    async def fake_character_exists(_character_id):
        return True

    observation = type("Observation", (), {"id": "observation-1", "eventId": "550e8400-e29b-41d4-a716-446655440000"})()

    async def fake_persist(_event):
        return observation, False

    async def fake_evaluate(saved_observation):
        nonlocal calls
        assert saved_observation is observation
        calls += 1
        return []

    monkeypatch.setattr(integration, "integration_character_exists", fake_character_exists)
    monkeypatch.setattr(integration, "persist_observation", fake_persist)
    monkeypatch.setattr(integration, "evaluate_observation", fake_evaluate)

    response = client.post("/api/integration/event", headers={"X-Integration-Key": "test-integration-key"}, json=observation_payload())

    assert response.status_code == 200
    assert calls == 1
