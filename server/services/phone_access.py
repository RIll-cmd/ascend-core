"""Shared phone/PWA identity, origin and bearer parsing helpers."""
from __future__ import annotations

import os

from fastapi import HTTPException, Request


def owner_id_from_user(user: dict) -> str:
    value = user.get("id")
    if not value:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return str(value)


def require_same_origin(request: Request) -> None:
    # Bearer requests do not use ambient browser cookies and are validated by their token.
    if (not request.cookies.get("ascend_session")
            and request.headers.get("authorization", "").lower().startswith("bearer ")):
        return
    origin = request.headers.get("origin")
    if not origin:
        raise HTTPException(status_code=403, detail="Origin is required for cookie-authenticated writes")
    allowed = {
        value.strip().rstrip("/") for value in [
            os.getenv("FRONTEND_URL", ""),
            "http://localhost:3000", "http://127.0.0.1:3000",
            "http://localhost:3001", "http://127.0.0.1:3001",
            "http://localhost:3002", "http://127.0.0.1:3002",
            "https://ai-habit-omega.vercel.app", "https://ai-habit.vercel.app",
            "https://ascend-core.vercel.app", "https://ascend-os.vercel.app",
        ] if value.strip()
    }
    clean = origin.rstrip("/")
    if clean in allowed:
        return
    if os.getenv("ENVIRONMENT") == "staging" and clean.startswith("https://ascend-core") and clean.endswith(".vercel.app"):
        return
    raise HTTPException(status_code=403, detail="Origin is not allowed")


def bearer_credential(authorization: str | None, *, label: str = "Worker") -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail=f"{label} bearer credential required")
    token = authorization[7:]
    if not token or token.strip() != token:
        raise HTTPException(status_code=401, detail=f"{label} bearer credential required")
    return token
