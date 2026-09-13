from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import CORS_ORIGINS, validate_runtime_config
from .core.database import init_db
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
    init_db()
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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/")
def root():
    return {
        "project": "UniSynapse",
        "description": "Student-powered academic knowledge network with Solana Devnet proof",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
