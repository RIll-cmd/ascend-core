"""Small, dependency-free policies for application startup."""

import os
from collections.abc import Mapping


def should_seed_skills_on_startup(
    environ: Mapping[str, str] | None = None,
) -> bool:
    """Keep optional seed work out of Render/production cold starts by default."""
    env = os.environ if environ is None else environ
    explicit = env.get("AUTO_SEED_SKILLS_ON_STARTUP")

    if explicit is not None:
        return explicit.strip().lower() in {"1", "true", "yes", "on"}

    environment = env.get("ENVIRONMENT", "").strip().lower()
    node_environment = env.get("NODE_ENV", "").strip().lower()
    is_production = environment in {"prod", "production"} or node_environment in {
        "prod",
        "production",
    }
    is_render = env.get("RENDER", "").strip().lower() == "true"

    return not (is_render or is_production)
