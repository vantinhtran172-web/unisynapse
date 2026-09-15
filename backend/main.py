import os
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import COOKIE_SECURE, CORS_ORIGINS, DATABASE_URL, validate_runtime_config
from .core.database import get_db, init_db
from .core.csrf import CSRF_COOKIE_NAME, CSRF_HEADER_NAME, generate_csrf_token, token_matches
from .core.rate_limit import LOGIN_LIMITER
from .api.v1.auth import router as auth_router
from .api.v1.tasks import router as tasks_router
from .api.v1.documents import router as documents_router
from .api.v1.tutor import router as tutor_router
from .api.v1.rewards import router as rewards_router
from .api.v1.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    validate_runtime_config()
    if not DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg://")):
        init_db()
    if os.getenv("SEED_PUBLIC_DEMO", "1") == "1":
        try:
            from .scripts.seed_demo_public import ensure_demo_user, main as seed_public_demo
            ensure_demo_user()
            seed_public_demo()
        except Exception as err:
            import logging
            logging.getLogger("uvicorn.error").warning("Demo seed skipped or failed: %s", err)
    yield
    # Shutdown

app = FastAPI(
    title="UniSynapse Backend API",
    description="Backend API cho mạng lưới đóng góp dữ liệu và tri thức học thuật UniSynapse",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.netlify\.app)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-CSRF-Token", "X-Request-ID", "X-Admin-Security-Key", "Authorization", "Accept", "Origin"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
    response = None
    try:
        if request.url.path in {"/api/v1/auth/login", "/api/v1/auth/admin/login"}:
            client_key = request.client.host if request.client else "unknown"
            allowed, retry_after = LOGIN_LIMITER.allow(f"{client_key}:{request.url.path}")
            if not allowed:
                response = JSONResponse(
                    status_code=429,
                    content={"detail": "Too many login attempts", "request_id": request_id},
                    headers={"Retry-After": str(retry_after)},
                )

        if response is None and request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            session_cookie = request.cookies.get("unisynapse_member_session") or request.cookies.get(
                "unisynapse_admin_session"
            )
            if session_cookie:
                csrf_cookie = request.cookies.get(CSRF_COOKIE_NAME)
                csrf_header = request.headers.get(CSRF_HEADER_NAME)
                if not token_matches(csrf_cookie, csrf_header):
                    response = JSONResponse(
                        status_code=403,
                        content={"detail": "CSRF token missing or invalid", "request_id": request_id},
                    )

        if response is None:
            response = await call_next(request)
    except Exception:
        response = JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "request_id": request_id},
        )
    if CSRF_COOKIE_NAME not in request.cookies:
        response.set_cookie(
            CSRF_COOKIE_NAME,
            generate_csrf_token(),
            httponly=False,
            secure=COOKIE_SECURE,
            samesite="lax",
            path="/",
        )
    response.headers["X-Request-ID"] = request_id
    return response


# API v1 Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(tutor_router, prefix="/api/v1")
app.include_router(rewards_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ready")
def readiness():
    try:
        with get_db() as conn:
            conn.execute("SELECT 1")
    except Exception:
        return JSONResponse(status_code=503, content={"status": "not_ready"})
    return {"status": "ready"}


@app.get("/")
def root():
    return {
        "project": "UniSynapse",
        "description": "Student-powered academic knowledge network with Solana Devnet proof",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
