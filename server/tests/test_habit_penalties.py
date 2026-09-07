from types import SimpleNamespace

import pytest

from services.habit_penalties import calculate_penalty, normalize_penalty_target, validate_stat_modifier


def test_vitality_maps_to_endurance_and_clamps_at_zero():
    result = calculate_penalty("VITALITY", 10, None, SimpleNamespace(endurance=4))
    assert result == {
        "storage": "endurance",
        "previousValue": 4,
        "newValue": 0,
        "amount": 4,
        "target": "VITALITY",
    }


def test_hp_penalty_uses_current_hp():
    character = SimpleNamespace(currentHp=20, exp=50)
    assert calculate_penalty("HP", 15, character, None)["newValue"] == 5


def test_unknown_target_and_non_positive_modifier_are_rejected():
    with pytest.raises(ValueError):
        normalize_penalty_target("MANA")
    with pytest.raises(ValueError):
        validate_stat_modifier(0)
