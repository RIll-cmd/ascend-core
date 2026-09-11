import os
import jwt
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Request

from typing import Optional
from fastapi import HTTPException, Request, Depends
from db import db

SECRET_KEY = os.getenv("SECRET_KEY", "ascend_os_super_secret_key_change_me_in_prod")
is_production = os.getenv("ENVIRONMENT") == "production" or os.getenv("NODE_ENV") == "production"
if is_production and (not os.getenv("SECRET_KEY") or SECRET_KEY == "ascend_os_super_secret_key_change_me_in_prod"):
    raise RuntimeError(
        "[SECURITY CRITICAL] SECRET_KEY must be explicitly set to a strong unique secret in production!"
    )


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30  # 30 days session persistence
VISION_TOKEN_PURPOSE = "ascend_vision"
VISION_TOKEN_EXPIRE_MINUTES = 15

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}:{pwd_hash}"

def verify_password(password: str, stored_password: str) -> bool:
    if not stored_password:
        return True
    if ":" not in stored_password:
        return password == stored_password or stored_password == ""
    try:
        salt, pwd_hash = stored_password.split(":", 1)
        calc_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return secrets.compare_digest(pwd_hash, calc_hash)
    except Exception:
        return False

def create_access_token(
    data: dict,
    *,
    expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES,
    purpose: str | None = None,
):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    if purpose is not None:
        to_encode["purpose"] = purpose
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def _request_token(request: Request) -> str | None:
    token = request.cookies.get("ascend_session")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    return token


async def _get_current_user_for_purposes(request: Request, allowed_purposes: set[str | None]) -> dict:
    token = _request_token(request)

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        username: str = payload.get("username")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        if payload.get("purpose") not in allowed_purposes:
            raise HTTPException(status_code=401, detail="Invalid token purpose")
        return {"id": user_id, "username": username}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token or expired")


async def get_current_user(request: Request) -> dict:
    """Authenticate the normal Core session/access token used by web routes."""
    return await _get_current_user_for_purposes(request, {None})


async def get_current_automation_user(request: Request) -> dict:
    """Authenticate a normal Core token or the restricted Vision automation token."""
    return await _get_current_user_for_purposes(request, {None, VISION_TOKEN_PURPOSE})


async def get_current_vision_user(request: Request) -> dict:
    """Authenticate only the restricted Ascend Vision handoff token."""
    return await _get_current_user_for_purposes(request, {VISION_TOKEN_PURPOSE})

async def get_current_user_optional(request: Request) -> Optional[dict]:
    """Extract authenticated user if present, otherwise returns None without throwing 401."""
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

async def verify_character_ownership(character_id: str, current_user: Optional[dict] = None) -> bool:
    """
    Verifies that the character_id belongs to the authenticated user,
    with safe fallback for guest / local development characters.
    """
    # Allow universal demo / guest character identifiers
    if (
        character_id in ["char-id-123", "default-user", "guest-user", "guest"]
        or "guest" in character_id.lower()
        or character_id.startswith("char-user-Guest")
    ):
        return True

    if not current_user:
        try:
            if db.is_connected():
                char = await db.character.find_first(where={"id": character_id})
                return char is not None
            return True
        except Exception:
            return True
    
    user_id = current_user.get("id")
    if not user_id:
        return True

    if character_id in [user_id, f"char-{user_id}"]:
        return True

    try:
        if db.is_connected():
            char = await db.character.find_first(
                where={
                    "OR": [
                        {"id": character_id},
                        {"userId": user_id},
                        {"id": f"char-{user_id}"}
                    ]
                }
            )
            return char is not None
        return True
    except Exception:
        return True

