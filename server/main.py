import os
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Auto-detect bundled Prisma query engine binary on Linux/Render
server_dir = Path(__file__).resolve().parent
load_dotenv(server_dir / ".env", override=False)
for engine_candidate in [
    server_dir / "prisma-query-engine-debian-openssl-3.0.x",
    server_dir / "prisma-query-engine-rhel-openssl-3.0.x",
    Path.cwd() / "prisma-query-engine-debian-openssl-3.0.x",
]:
    if engine_candidate.exists() and engine_candidate.is_file():
        os.environ.setdefault("PRISMA_QUERY_ENGINE_BINARY", str(engine_candidate.resolve()))
        break

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from prisma.errors import RecordNotFoundError
from db import db
from routers import auth, character, habits, missions, progression, achievements, analytics, tower, inventory, aira, fitness, skills, bosses, workouts, shop, season_pass, crafting, beasts, integration, automations


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to database via modern lifespan context manager
    if not db.is_connected():
        await db.connect()
    try:
        # Auto-seed baseline skills if table is empty
        try:
            from scripts.seed_skills import seed_skills_if_empty
            await seed_skills_if_empty(db)
        except Exception as e:
            print(f"[Startup Warning] Skill seeder error: {e}")

        yield
    finally:
        # Shutdown: Gracefully disconnect database client
        if db.is_connected():
            await db.disconnect()



limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

app = FastAPI(
    title="Ascend OS Core Server",
    description="Backend API service for Ascend OS SaaS Architecture",
    version="2.0.0",
    lifespan=lifespan
)
app.state.limiter = limiter


def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "error": "Too Many Requests",
            "detail": f"Rate limit exceeded: {exc.detail}. Please wait before making further requests.",
            "response": "<< Warning. >> Rate limit exceeded. Calculation processing paused. Please wait a moment before sending further queries, Master."
        }
    )

app.add_exception_handler(RateLimitExceeded, custom_rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "https://ai-habit-omega.vercel.app",
    "https://ai-habit.vercel.app",
]

# Allow dynamic frontend URL overrides from environment
frontend_env = os.getenv("FRONTEND_URL", "").strip()
if frontend_env and frontend_env not in origins:
    origins.append(frontend_env)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.vercel\.app)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    
    # Enforce HSTS in production or over HTTPS
    is_production = os.getenv("ENVIRONMENT") == "production" or os.getenv("NODE_ENV") == "production"
    if is_production or request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
    return response


@app.middleware("http")
async def db_connection_lifecycle_middleware(request: Request, call_next):
    from db import ensure_db_connected, db
    try:
        if not db.is_connected():
            await db.connect()
    except Exception:
        pass

    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        err_str = str(exc)
        if "Closed" in err_str or "connection" in err_str.lower() or "quaint" in err_str.lower():
            print(f"[Prisma Connection Lifecycle] Re-establishing dropped database connection: {exc}")
            try:
                if db.is_connected():
                    await db.disconnect()
                await db.connect()
            except Exception as re_err:
                print(f"[Prisma Reconnect Error]: {re_err}")
        raise exc


@app.exception_handler(RecordNotFoundError)
async def prisma_record_not_found_handler(request: Request, exc: RecordNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": "The requested resource was not found in the database."}
    )


# Register Domain Routers
app.include_router(auth.router)
app.include_router(character.router)
app.include_router(habits.router)
app.include_router(missions.router)
app.include_router(progression.router)
app.include_router(achievements.router)
app.include_router(season_pass.router)
app.include_router(analytics.router)
app.include_router(tower.router)
app.include_router(inventory.router)
app.include_router(aira.router)
app.include_router(skills.router)
app.include_router(fitness.router)
app.include_router(bosses.router, prefix="/api/bosses", tags=["bosses"])
app.include_router(workouts.router, prefix="/api/workouts", tags=["workouts"])
app.include_router(shop.router, prefix="/api/shop", tags=["shop"])
app.include_router(crafting.router)
app.include_router(beasts.router)
app.include_router(integration.router)
app.include_router(automations.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Ascend OS Core Server",
        "version": "2.0.0",
        "architecture": "SaaS Feature Skeleton"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "postgresql (neon)",
        "services": {
            "api": "operational",
            "orm": "prisma",
            "neon": {
                "projectId": "silent-grass-83641044",
                "orgId": "org-calm-art-43579859"
            }
        }
    }


@app.get("/api/user/{user_id_or_email}")
async def get_user(user_id_or_email: str):
    user = await db.user.find_first(
        where={
            "OR": [
                {"id": user_id_or_email},
                {"email": user_id_or_email},
                {"username": user_id_or_email}
            ]
        },
        include={
            "character": True,
        }
    )
    if not user:
        # Fallback query by character name if username/name passed
        char = await db.character.find_first(
            where={"name": user_id_or_email},
            include={"user": True}
        )
        if char and char.user:
            user = await db.user.find_unique(
                where={"id": char.userId},
                include={"character": True}
            )

    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id_or_email}' not found")

    # Security: Strip password hash and private tokens before returning user metadata
    char_dict = None
    if user.character:
        char_dict = user.character.model_dump() if hasattr(user.character, "model_dump") else user.character

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "isEmailVerified": bool(user.isEmailVerified),
        "createdAt": user.createdAt.isoformat() if hasattr(user.createdAt, "isoformat") else str(user.createdAt),
        "character": char_dict
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
