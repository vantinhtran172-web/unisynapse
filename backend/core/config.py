import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"


def _load_env_file(filepath: Path):
    if filepath.exists():
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass

_load_env_file(BASE_DIR / ".env")
_load_env_file(BACKEND_DIR / ".env")

DATA_DIR = Path(os.getenv("UNISYNAPSE_DATA_DIR", str(BASE_DIR / "data"))).resolve()
UPLOADS_DIR = DATA_DIR / "uploads"
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()
ALLOW_SQLITE = os.getenv("ALLOW_SQLITE", "1" if ENVIRONMENT != "production" else "0") == "1"
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "1" if ENVIRONMENT == "production" else "0") == "1"
DB_PATH = DATA_DIR / "unisynapse.db"

# Create directories if they do not exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000",
    ).split(",")
    if origin.strip()
]

SOLANA_RPC_URL = os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com")
SOLANA_EXPLORER_BASE = "https://explorer.solana.com/tx"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CONSENSUS_DEFAULT_VOTES = 5
CONSENSUS_DEFAULT_THRESHOLD = 0.8


def validate_runtime_config() -> None:
    if ENVIRONMENT == "production":
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL is required in production")
        if not DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg://")):
            raise RuntimeError("Production DATABASE_URL must be PostgreSQL")
        if ALLOW_SQLITE:
            raise RuntimeError("ALLOW_SQLITE must be disabled in production")
        if not COOKIE_SECURE:
            raise RuntimeError("COOKIE_SECURE must be enabled in production")
        if "*" in CORS_ORIGINS:
            raise RuntimeError("Wildcard CORS is not allowed in production")
    elif DATABASE_URL and not DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg://", "sqlite://")):
        raise RuntimeError("DATABASE_URL must be PostgreSQL or SQLite")
