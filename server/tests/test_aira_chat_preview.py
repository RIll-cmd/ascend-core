from services.aira_chat_preview import normalize_chat_action_candidate


def test_chat_candidate_maps_legacy_habit_fields_to_preview_contract():
    candidate = normalize_chat_action_candidate(
        "create_habit",
        {"name": "Read", "primary_stat": "knowledge", "difficulty": "EASY"},
    )

    assert candidate == {
        "operation": "create_habit",
        "arguments": {"name": "Read", "primaryStat": "knowledge", "difficulty": "EASY"},
    }


def test_chat_candidate_rejects_actions_without_local_adapters():
    assert normalize_chat_action_candidate("buy_shop_item", {"item_name": "Sword"}) is None
    assert normalize_chat_action_candidate("create_new_mission", {"title": "New Mission"}) is None


def test_chat_candidate_maps_automation_rules_to_preview_contract():
    create_auto = normalize_chat_action_candidate(
        "create_automation_rule",
        {"name": "Phone Alert", "trigger_type": "phone_usage_observed"},
    )
    assert create_auto == {
        "operation": "create_automation",
        "arguments": {"name": "Phone Alert", "triggerType": "phone_usage_observed"},
    }

    toggle_auto = normalize_chat_action_candidate(
        "toggle_automation_rule",
        {"rule_id": "rule-123", "enabled": False},
    )
    assert toggle_auto == {
        "operation": "update_automation",
        "arguments": {"ruleId": "rule-123", "enabled": False},
    }

    delete_auto = normalize_chat_action_candidate(
        "delete_automation_rule",
        {"rule_id": "rule-123"},
    )
    assert delete_auto == {
        "operation": "delete_automation",
        "arguments": {"ruleId": "rule-123"},
    }


def test_chat_candidate_maps_calendar_schedules_to_preview_contract():
    create_sched = normalize_chat_action_candidate(
        "create_calendar_schedule",
        {"title": "Lecture", "time": "11:00", "schedule_type": "WEEKLY", "day_of_week": 3},
    )
    assert create_sched == {
        "operation": "create_calendar_schedule",
        "arguments": {"title": "Lecture", "time": "11:00", "scheduleType": "WEEKLY", "dayOfWeek": 3},
    }

    del_sched = normalize_chat_action_candidate(
        "delete_calendar_schedule",
        {"schedule_id": "sched-99"},
    )
    assert del_sched == {
        "operation": "delete_calendar_schedule",
        "arguments": {"scheduleId": "sched-99"},
    }


def test_chat_candidate_maps_calendar_multi_bundle():
    multi_candidate = normalize_chat_action_candidate(
        "create_calendar_schedule_multi",
        {
            "schedules": [
                {"title": "Math", "time": "09:00", "day_of_week": 1},
                {"title": "Math", "time": "09:00", "day_of_week": 4},
            ],
            "title": "Math",
            "time": "09:00",
            "days": ["Monday", "Thursday"],
        },
    )
    assert multi_candidate is not None
    assert multi_candidate["operation"] == "create_calendar_schedule_multi"
    assert len(multi_candidate["arguments"]["schedules"]) == 2



