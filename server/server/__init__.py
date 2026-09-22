"""Compatibility package for running `python -m server.cli...` from server/."""

from pathlib import Path

# Include the real server directory so the CLI is available both from the repo
# root and from the operator-facing `server/` working directory.
__path__.append(str(Path(__file__).resolve().parent.parent))
