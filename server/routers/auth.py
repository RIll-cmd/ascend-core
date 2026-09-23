from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Response, Depends, Request
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address
import re
import sqlite3
import uuid
import secrets
import os
from datetime import datetime, timedelta, timezone
from db import db
from prisma.errors import UniqueViolationError
from db_utils import ensure_character_exists
from auth_utils import (
    VISION_TOKEN_EXPIRE_MINUTES,
    VISION_TOKEN_PURPOSE,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from services.decay_service import process_midnight_decay
from services.email_service import (
    can_request_otp,
    create_and_store_otp,
    validate_otp_code,
    send_verification_email,
    is_email_sender_configured,
    get_db_connection
)

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["auth"])

def set_auth_cookie(response: Response, token: str) -> None:
    """Sets a hardened session cookie with HttpOnly, SameSite, and production Secure flags."""
    is_prod = os.getenv("ENVIRONMENT") == "production" or os.getenv("NODE_ENV") == "production"
    response.set_cookie(
        key="ascend_session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=is_prod,
        max_age=86400 * 30
    )

RESERVED_USERNAMES = {"admin", "system", "aira", "ciel", "ascend", "guest", "root", "moderator", "support", "null", "undefined"}
EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
USERNAME_REGEX = r"^[a-zA-Z0-9_]{3,20}$"

# =========================================================================
# SCHEMAS
# =========================================================================

class CheckAvailabilityInput(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None

class SendOtpInput(BaseModel):
    email: str
    context: Optional[str] = "Registration"
    bot_trap: Optional[str] = Field(None, description="Honeypot field for bot protection")

class VerifyOtpInput(BaseModel):
    email: str
    otp: str
    bot_trap: Optional[str] = Field(None, description="Honeypot field for bot protection")

class RegisterInput(BaseModel):
    username: str
    email: str
    password: str
    bot_trap: Optional[str] = Field(None, description="Honeypot field for bot protection")

class LoginInput(BaseModel):
    identifier: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = ""
    bot_trap: Optional[str] = Field(None, description="Honeypot field for bot protection")

class GuestLoginInput(BaseModel):
    password: str


class AccountDeleteInput(BaseModel):
    username: str
    password: Optional[str] = None

class LinkEmailRequestInput(BaseModel):
    email: str

class LinkEmailVerifyInput(BaseModel):
    email: str
    otp: str

class UpdateUsernameInput(BaseModel):
    username: str


# =========================================================================
# USER QUERIES (PRISMA POSTGRESQL WITH FALLBACK)
# =========================================================================

async def get_all_users() -> List[Dict[str, Any]]:
    all_users: List[Dict[str, Any]] = []
    if db.is_connected():
        try:
            users = await db.user.find_many()
            all_users.extend([
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "password": u.password,
                    "isEmailVerified": bool(u.isEmailVerified),
                }
                for u in users
            ])
        except Exception:
            pass

    try:
        conn = get_db_connection()
        c = conn.cursor()
        try:
            c.execute("SELECT id, username, email, password, isEmailVerified FROM User")
            rows = c.fetchall()
            all_users.extend(dict(r) for r in rows)
        finally:
            conn.close()
    except Exception:
        pass

    return all_users

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    if db.is_connected():
        try:
            u = await db.user.find_unique(where={"id": user_id})
            if u:
                return {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "password": u.password,
                    "isEmailVerified": bool(u.isEmailVerified),
                }
        except Exception:
            pass

    try:
        conn = get_db_connection()
        c = conn.cursor()
        try:
            c.execute("SELECT id, username, email, password, isEmailVerified FROM User WHERE id = ?", (user_id,))
            row = c.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()
    except Exception:
        return None

async def get_user_by_identifier(ident: str) -> Optional[Dict[str, Any]]:
    if db.is_connected():
        try:
            u = await db.user.find_first(
                where={
                    "OR": [
                        {"username": ident},
                        {"email": ident.lower()}
                    ]
                }
            )
            if u:
                return {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "password": u.password,
                    "isEmailVerified": bool(u.isEmailVerified),
                }
        except Exception:
            pass

    try:
        conn = get_db_connection()
        c = conn.cursor()
        try:
            c.execute(
                "SELECT id, username, email, password, isEmailVerified FROM User WHERE LOWER(username) = ? OR LOWER(email) = ?",
                (ident.lower(), ident.lower())
            )
            row = c.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()
    except Exception:
        return None

async def insert_user(user_id: str, username: str, email: Optional[str], password_hash: str, is_verified: bool = False) -> Dict[str, Any]:
    if db.is_connected():
        try:
            u = await db.user.create(
                data={
                    "id": user_id,
                    "username": username,
                    "email": email,
                    "password": password_hash,
                    "isEmailVerified": is_verified,
                }
            )
            return {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "isEmailVerified": bool(u.isEmailVerified),
            }
        except UniqueViolationError:
            raise HTTPException(status_code=409, detail="That handle or email is already registered.")
        except Exception:
            raise HTTPException(status_code=503, detail="Account storage is unavailable. Please try again later.")

    conn = get_db_connection()
    c = conn.cursor()
    try:
        try:
            c.execute(
                """
                INSERT INTO User (id, username, email, password, isEmailVerified, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """,
                (user_id, username, email, password_hash, 1 if is_verified else 0)
            )
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail="That handle or email is already registered.")
        conn.commit()
        return {
            "id": user_id,
            "username": username,
            "email": email,
            "isEmailVerified": is_verified,
        }
    finally:
        conn.close()

async def update_user_email(user_id: str, email: str, is_verified: bool = True):
    if db.is_connected():
        try:
            await db.user.update(
                where={"id": user_id},
                data={
                    "email": email,
                    "isEmailVerified": is_verified,
                }
            )
            return
        except Exception:
            pass

    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("UPDATE User SET email = ?, isEmailVerified = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", (email, 1 if is_verified else 0, user_id))
        conn.commit()
    finally:
        conn.close()

async def update_user_username(user_id: str, username: str):
    if db.is_connected():
        try:
            await db.user.update(
                where={"id": user_id},
                data={"username": username}
            )
            return
        except Exception:
            pass

    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("UPDATE User SET username = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", (username, user_id))
        conn.commit()
    finally:
        conn.close()



# =========================================================================
# VALIDATION HELPERS
# =========================================================================

def validate_username_format(username: str) -> None:
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")
    if len(username) < 3 or len(username) > 20:
        raise HTTPException(status_code=400, detail="Username must be between 3 and 20 characters.")
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        raise HTTPException(status_code=400, detail="Username can only contain letters, numbers, and underscores (_).")
    if username.lower() in RESERVED_USERNAMES:
        raise HTTPException(status_code=400, detail=f"Username '{username}' is a reserved system identifier. Please choose another name.")

def validate_email_format(email: str) -> None:
    if not email or not re.match(EMAIL_REGEX, email.strip()):
        raise HTTPException(status_code=400, detail="Invalid email format. Please provide a valid email address.")

def validate_password_strength(password: str) -> None:
    if not password or len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    if not re.search(r"[0-9]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one numeric digit (0-9).")
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character (e.g. !@#$%^&*).")


# =========================================================================
# 1. REAL-TIME PRE-VALIDATION & AVAILABILITY ENDPOINTS
# =========================================================================

@router.post("/api/auth/check-availability")
async def check_availability(data: CheckAvailabilityInput):
    """
    Check if a username or email is available (case-insensitive) and validates format constraints.
    """
    result = {
        "usernameAvailable": True,
        "usernameError": None,
        "emailAvailable": True,
        "emailError": None,
    }

    all_users = await get_all_users()

    if data.username is not None:
        u_clean = data.username.strip()
        if not u_clean:
            result["usernameAvailable"] = False
            result["usernameError"] = "Username cannot be empty."
        elif len(u_clean) < 3 or len(u_clean) > 20:
            result["usernameAvailable"] = False
            result["usernameError"] = "Must be between 3 and 20 characters."
        elif not re.match(r"^[a-zA-Z0-9_]+$", u_clean):
            result["usernameAvailable"] = False
            result["usernameError"] = "Alphanumeric characters and underscores only."
        elif u_clean.lower() in RESERVED_USERNAMES:
            result["usernameAvailable"] = False
            result["usernameError"] = "Reserved system identifier."
        else:
            taken = any(u["username"] and u["username"].lower() == u_clean.lower() for u in all_users)
            if taken:
                result["usernameAvailable"] = False
                result["usernameError"] = f"Username '{u_clean}' is already registered."

    if data.email is not None:
        e_clean = data.email.strip()
        if not e_clean or not re.match(EMAIL_REGEX, e_clean):
            result["emailAvailable"] = False
            result["emailError"] = "Invalid email format."
        else:
            taken = any(u["email"] and u["email"].lower() == e_clean.lower() for u in all_users)
            if taken:
                result["emailAvailable"] = False
                result["emailError"] = f"Email '{e_clean}' is already linked to another account."

    return result


# =========================================================================
# 2. EMAIL OTP ENGINE ENDPOINTS
# =========================================================================

@router.post("/api/auth/send-otp")
@limiter.limit("5/minute")
async def send_otp(request: Request, data: SendOtpInput):
    """
    Send a 6-digit OTP code to the provided email address with rate limiting.
    """
    if data.bot_trap:
        raise HTTPException(status_code=400, detail="Automated submission blocked.")

    email_clean = data.email.strip().lower()
    validate_email_format(email_clean)
    if not is_email_sender_configured():
        raise HTTPException(status_code=503, detail="Email verification is temporarily unavailable.")

    allowed, rate_msg = await can_request_otp(email_clean)
    if not allowed:
        raise HTTPException(status_code=429, detail=rate_msg)

    token_id, otp = await create_and_store_otp(email_clean)
    if not send_verification_email(email_clean, otp, context=data.context or "Verification"):
        raise HTTPException(status_code=503, detail="Verification email could not be sent. Please try again later.")

    return {
        "message": f"Verification cipher successfully transmitted to {email_clean}.",
        "expiresInMinutes": 5
    }

@router.post("/api/auth/verify-otp")
@limiter.limit("10/minute")
async def verify_otp(request: Request, data: VerifyOtpInput):
    """
    Verify submitted 6-digit OTP code for an email address.
    """
    if data.bot_trap:
        raise HTTPException(status_code=400, detail="Automated submission blocked.")

    email_clean = data.email.strip().lower()
    otp_clean = data.otp.strip()

    validate_email_format(email_clean)
    if not otp_clean or len(otp_clean) != 6:
        raise HTTPException(status_code=400, detail="Please enter a valid 6-digit verification code.")

    is_valid, msg = await validate_otp_code(email_clean, otp_clean)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    return {"message": "Email verification confirmed.", "verified": True}


# =========================================================================
# 3. REGISTRATION FLOW (EMAIL VERIFICATION PAUSED)
# =========================================================================

@router.post("/api/auth/register")
@router.post("/api/register")
@limiter.limit("5/minute")
async def register(request: Request, data: RegisterInput, response: Response):
    if data.bot_trap:
        raise HTTPException(status_code=400, detail="Automated submission blocked.")

    username_clean = data.username.strip()
    email_clean = data.email.strip().lower()
    password = data.password.strip()
    validate_username_format(username_clean)
    validate_email_format(email_clean)
    validate_password_strength(password)

    all_users = await get_all_users()
    if any(u["username"] and u["username"].lower() == username_clean.lower() for u in all_users):
        raise HTTPException(status_code=409, detail=f"Handle '{username_clean}' is already registered. Please sign in or choose another handle.")
    if any(u["email"] and u["email"].lower() == email_clean for u in all_users):
        raise HTTPException(status_code=409, detail=f"Email '{email_clean}' is already registered. Please sign in.")

    new_user_id = f"user-{str(uuid.uuid4())[:8]}"
    hashed_pwd = hash_password(password)
    user = await insert_user(new_user_id, username_clean, email_clean, hashed_pwd, is_verified=False)

    character_id = f"char-{user['id']}"
    character = await ensure_character_exists(character_id, user["id"], user["username"])

    token = create_access_token(data={"sub": user["id"], "username": user["username"]})
    set_auth_cookie(response, token)

    return {
        "message": "Registration successful. Email verification is pending.",
        "username": user["username"],
        "email": email_clean,
        "isEmailVerified": False,
        "characterId": character.id,
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": email_clean,
            "isEmailVerified": False,
        }
    }


# =========================================================================
# 4. UNIFIED DUAL-IDENTIFIER LOGIN (USERNAME OR EMAIL)
# =========================================================================

@router.post("/api/auth/login")
@router.post("/api/login")
@limiter.limit("5/minute")
async def login(request: Request, data: LoginInput, response: Response):
    if data.bot_trap:
        raise HTTPException(status_code=400, detail="Automated submission blocked.")

    ident = (data.identifier or data.username or "").strip()
    password = (data.password or "").strip()

    if not ident:
        raise HTTPException(status_code=400, detail="Hunter identifier or email is required.")

    user = await get_user_by_identifier(ident)

    if not user:
        raise HTTPException(status_code=404, detail=f"Account '{ident}' not found. Please check your credentials or register.")

    if not user["password"] or not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password. Please verify your access cipher.")

    character = await db.character.find_first(where={"userId": user["id"]})
    character_id = character.id if character else f"char-{user['id']}"

    if not character:
        await ensure_character_exists(character_id, user["id"], user["username"])

    token = create_access_token(data={"sub": user["id"], "username": user["username"]})
    set_auth_cookie(response, token)

    is_email_verified = bool(user.get("isEmailVerified", False))

    return {
        "message": "Authentication successful.",
        "username": user["username"],
        "email": user["email"],
        "isEmailVerified": is_email_verified,
        "characterId": character_id,
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "isEmailVerified": is_email_verified,
        }
    }


@router.post("/api/auth/vision-token", status_code=201)
async def issue_vision_token(current_user: dict = Depends(get_current_user)):
    """Mint a short-lived Bearer token for Vision's user-scoped automation calls."""
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=VISION_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": current_user["id"], "username": current_user["username"]},
        expires_minutes=VISION_TOKEN_EXPIRE_MINUTES,
        purpose=VISION_TOKEN_PURPOSE,
    )
    return {
        "accessToken": token,
        "tokenType": "Bearer",
        "expiresIn": VISION_TOKEN_EXPIRE_MINUTES * 60,
        "expiresAt": expires_at.isoformat(),
    }


# =========================================================================
# 5. GUEST LOGIN & ACCOUNT MANAGEMENT
# =========================================================================

@router.post("/api/auth/guest")
@router.post("/api/guest")
@limiter.limit("10/minute")
async def guest_login(request: Request, response: Response, data: GuestLoginInput):
    configured_password = os.getenv("GUEST_ACCESS_PASSWORD")
    if not configured_password:
        raise HTTPException(status_code=503, detail="Guest access is not configured.")
    if not secrets.compare_digest(data.password, configured_password):
        raise HTTPException(status_code=401, detail="Guest access password is incorrect.")

    guest_id = f"Guest_{str(uuid.uuid4())[:4]}"
    new_user_id = f"user-{guest_id}"

    user = await insert_user(new_user_id, guest_id, None, "", is_verified=False)

    character_id = f"char-{user['id']}"
    character = await ensure_character_exists(character_id, user["id"], guest_id)

    token = create_access_token(data={"sub": user["id"], "username": user["username"]})
    set_auth_cookie(response, token)

    return {
        "message": "Guest sandbox access granted.",
        "username": guest_id,
        "email": None,
        "isEmailVerified": False,
        "characterId": character.id,
        "token": token,
        "user": {
            "id": user["id"],
            "username": guest_id,
            "email": None,
            "isEmailVerified": False,
        }
    }

@router.delete("/api/auth/account")
async def delete_account(data: AccountDeleteInput, current_user: dict = Depends(get_current_user)):
    username = data.username.strip()
    if current_user.get("username", "").lower() != username.lower():
        raise HTTPException(status_code=403, detail="Unauthorized to delete this account.")

    all_users = await get_all_users()
    user = next((u for u in all_users if u["username"] and u["username"].lower() == username.lower()), None)

    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")

    if db.is_connected():
        try:
            await db.user.delete(where={"id": user["id"]})
            return {"message": "Account successfully terminated."}
        except Exception:
            pass

    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("DELETE FROM User WHERE id = ?", (user["id"],))
        conn.commit()
    finally:
        conn.close()

    return {"message": "Account successfully terminated."}

@router.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("ascend_session")
    return {"message": "Successfully logged out"}

@router.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await get_user_by_id(current_user["id"])
    if not user:
        return {"user": None, "character": None}

    character = await db.character.find_first(where={"userId": current_user["id"]})

    if character:
        await process_midnight_decay(db, character.id)
        character = await db.character.find_first(where={"userId": current_user["id"]})

    is_verified = bool(user.get("isEmailVerified", False))

    return {
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "isEmailVerified": is_verified,
        },
        "character": character.model_dump() if character else None
    }


# =========================================================================
# 6. BIDIRECTIONAL PROFILE LINKING & ACCOUNT SETTINGS
# =========================================================================

@router.post("/api/user/link-email/request-otp")
async def link_email_request_otp(data: LinkEmailRequestInput, current_user: dict = Depends(get_current_user)):
    """
    Initiate email linking flow for an authenticated user by sending a 6-digit OTP.
    """
    email_clean = data.email.strip().lower()
    validate_email_format(email_clean)
    if not is_email_sender_configured():
        raise HTTPException(status_code=503, detail="Email verification is temporarily unavailable.")

    all_users = await get_all_users()
    if any(u["email"] and u["email"].lower() == email_clean and u["id"] != current_user["id"] for u in all_users):
        raise HTTPException(status_code=400, detail=f"Email '{email_clean}' is already linked to another account.")

    allowed, rate_msg = await can_request_otp(email_clean)
    if not allowed:
        raise HTTPException(status_code=429, detail=rate_msg)

    token_id, otp = await create_and_store_otp(email_clean, user_id=current_user["id"])
    if not send_verification_email(email_clean, otp, context="Email Account Linking"):
        raise HTTPException(status_code=503, detail="Verification email could not be sent. Please try again later.")

    return {
        "message": f"Verification cipher dispatched to {email_clean}.",
        "expiresInMinutes": 5
    }

@router.post("/api/user/link-email/verify")
async def link_email_verify(data: LinkEmailVerifyInput, current_user: dict = Depends(get_current_user)):
    """
    Verify OTP and permanently link email to the authenticated user account.
    """
    email_clean = data.email.strip().lower()
    validate_email_format(email_clean)

    all_users = await get_all_users()
    if any(u["email"] and u["email"].lower() == email_clean and u["id"] != current_user["id"] for u in all_users):
        raise HTTPException(status_code=400, detail=f"Email '{email_clean}' is already linked to another account.")

    is_valid, msg = await validate_otp_code(email_clean, data.otp.strip(), user_id=current_user["id"])
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    # Update User Record
    await update_user_email(current_user["id"], email_clean, is_verified=True)

    return {
        "message": "Email successfully linked and verified.",
        "email": email_clean,
        "isEmailVerified": True
    }

@router.patch("/api/user/update-username")
async def update_username(data: UpdateUsernameInput, current_user: dict = Depends(get_current_user)):
    """
    Update unique username/handle for the authenticated user.
    """
    new_username = data.username.strip()
    validate_username_format(new_username)

    all_users = await get_all_users()
    if any(u["username"] and u["username"].lower() == new_username.lower() and u["id"] != current_user["id"] for u in all_users):
        raise HTTPException(status_code=400, detail=f"Username '{new_username}' is already taken. Please choose another username.")

    await update_user_username(current_user["id"], new_username)

    # Also update Character name
    character = await db.character.find_first(where={"userId": current_user["id"]})
    if character:
        await db.character.update(
            where={"id": character.id},
            data={"name": new_username}
        )

    return {
        "message": "Hunter handle successfully updated.",
        "username": new_username
    }


# =========================================================================
# 7. GDPR/CCPA COMPLIANCE & DATA SOVEREIGNTY ENDPOINTS
# =========================================================================

@router.get("/api/auth/export-data")
async def export_user_data(current_user: dict = Depends(get_current_user)):
    """
    GDPR/CCPA Data Subject Access Request (Portability).
    Exports complete personal telemetry, character state, and progression logs.
    """
    user_id = current_user["id"]
    char = None
    user = None

    if db.is_connected():
        try:
            char = await db.character.find_first(
                where={"userId": user_id},
                include={
                    "stats": True,
                    "habits": True,
                    "missions": True,
                    "achievements": True,
                    "characterTitles": True,
                    "workoutSessions": True,
                    "beasts": True,
                    "eggs": True,
                    "history": {"take": 50},
                }
            )
            user = await db.user.find_unique(where={"id": user_id})
        except Exception as e:
            print(f"[Export Warning] Database query failed ({e}). Using session fallback.")

    export_payload = {
        "exportVersion": "1.0",
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "user": {
            "id": user.id if user else user_id,
            "username": user.username if user else current_user.get("username"),
            "email": user.email if user else None,
            "createdAt": user.createdAt.isoformat() if user and hasattr(user.createdAt, "isoformat") else str(user.createdAt if user else ""),
        },
        "character": char.model_dump() if char and hasattr(char, "model_dump") else (char if char else None),
    }
    return export_payload


@router.delete("/api/auth/account")
async def delete_user_account(
    data: AccountDeleteInput,
    response: Response,
    current_user: dict = Depends(get_current_user),
):
    """
    GDPR/CCPA Right to Erasure. Permanently removes user account and all cascaded data.
    """
    user_id = current_user["id"]
    current_username = current_user.get("username", "")

    if data.username.strip().lower() != current_username.strip().lower():
        raise HTTPException(status_code=400, detail="Username confirmation does not match account handle.")

    if db.is_connected():
        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")

        if user.password:
            if not data.password or not verify_password(data.password, user.password):
                raise HTTPException(status_code=400, detail="Incorrect password verification.")

        # Delete User (Prisma schema relations specify onDelete: Cascade)
        await db.user.delete(where={"id": user_id})

    # Clear auth cookie
    response.delete_cookie("ascend_session")

    return {
        "success": True,
        "message": "Account and all associated telemetry records permanently erased.",
        "deletedUserId": user_id
    }

