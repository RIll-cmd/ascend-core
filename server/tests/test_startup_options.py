from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from startup_options import should_seed_skills_on_startup


def test_render_disables_optional_startup_seed_by_default():
    assert should_seed_skills_on_startup({"RENDER": "true"}) is False


def test_production_disables_optional_startup_seed_by_default():
    assert should_seed_skills_on_startup({"ENVIRONMENT": "production"}) is False


def test_development_keeps_existing_startup_seed_behavior():
    assert should_seed_skills_on_startup({"ENVIRONMENT": "development"}) is True


def test_explicit_startup_seed_setting_overrides_environment():
    assert should_seed_skills_on_startup(
        {"RENDER": "true", "AUTO_SEED_SKILLS_ON_STARTUP": "true"}
    ) is True
    assert should_seed_skills_on_startup(
        {"AUTO_SEED_SKILLS_ON_STARTUP": "false"}
    ) is False
