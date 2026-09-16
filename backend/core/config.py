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
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,http://localhost:8088,http://127.0.0.1:8088,https://unisynapse-web.netlify.app,https://unisynapse.netlify.app",
    ).split(",")
    if origin.strip()
]

SOLANA_RPC_URL = os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com")
SOLANA_NETWORK = os.getenv("SOLANA_NETWORK", "devnet").strip().lower()
SOLANA_SUBMISSION_ENABLED = os.getenv("SOLANA_SUBMISSION_ENABLED", "0") == "1"
SOLANA_AUTHORITY_SECRET_REF = os.getenv("SOLANA_AUTHORITY_SECRET_REF", "").strip()
SOLANA_COMMITMENT = os.getenv("SOLANA_COMMITMENT", "confirmed").strip().lower()
SOLANA_MAX_RETRIES = int(os.getenv("SOLANA_MAX_RETRIES", "5"))
SOLANA_EXPLORER_BASE = "https://explorer.solana.com/tx"

# Internal credits only; these settings do not enable blockchain payouts.
AI_CHAT_COST_POINTS = 80
POINTS_PER_DEVNET_SOL = 1000
DEVNET_TREASURY_ADDRESS = os.getenv(
    "DEVNET_TREASURY_ADDRESS",
    "DaWyQs198XXbHNNqnM9wHEhjsMRsW8D47bmvtFXtF4Dn",
).strip()
DEVNET_DEPOSIT_COMMITMENT = os.getenv("DEVNET_DEPOSIT_COMMITMENT", "confirmed").strip().lower()
DEVNET_MIN_DEPOSIT_LAMPORTS = 1_000_000
DEVNET_DAILY_DEPOSIT_LIMIT_LAMPORTS = 10_000_000_000
DEVNET_DEPOSITS_ENABLED = os.getenv("DEVNET_DEPOSITS_ENABLED", "1").strip().lower() in ("1", "true", "yes", "on")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ADMIN_SECURITY_KEY = (os.getenv("ADMIN_SECURITY_KEY") or os.getenv("ADMIN_ACCESS_KEY") or "wit-admin-sec-9a8f4c2e1b7d5e3f01829475c8b6a12d").strip()
ADMIN_ACCESS_KEY = ADMIN_SECURITY_KEY
MOCK_MODE = os.getenv("MOCK_MODE", "0") == "1"
CONSENSUS_DEFAULT_VOTES = 5
CONSENSUS_DEFAULT_THRESHOLD = 0.8

# 9Router AI Gateway Configuration
NINEROUTER_BASE_URL = os.getenv("NINEROUTER_BASE_URL", "https://rrzqgu4.abc-tunnel.us/v1").rstrip("/")
NINEROUTER_API_KEY = os.getenv("NINEROUTER_API_KEY", "sk-7d22549baacade14-wn4lw5-471a8dbb").strip()
NINEROUTER_DEFAULT_MODEL = os.getenv("NINEROUTER_DEFAULT_MODEL", "cx/gpt-5.6-luna").strip()

# ACB Bank API Configuration
ACB_API_URL = os.getenv("ACB_API_URL", "https://apiapp.acb.com.vn").rstrip("/")
ACB_CLIENT_ID = os.getenv("ACB_CLIENT_ID", "iuSuHYVufIUuNIREV0FB9EoLn9kHsDbm").strip()
ACB_USERNAME = os.getenv("ACB_USERNAME", "0388890465").strip()
ACB_PASSWORD = os.getenv("ACB_PASSWORD", "Tinhtranvan987@").strip()
ACB_ACCOUNT_NUMBER = os.getenv("ACB_ACCOUNT_NUMBER", "38038627").strip()
ACB_ACCOUNT_NAME = os.getenv("ACB_ACCOUNT_NAME", "TRAN VAN TINH").strip()
ACB_BANK_NAME = os.getenv("ACB_BANK_NAME", "ACB").strip()
ACB_DEPOSITS_ENABLED = os.getenv("ACB_DEPOSITS_ENABLED", "1").strip().lower() in ("1", "true", "yes", "on")
POINTS_PER_10K_VND = int(os.getenv("POINTS_PER_10K_VND", "1000"))  # 10,000 VND = 1,000 UniPoints


def validate_runtime_config() -> None:
    if ENVIRONMENT == "production":
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL is required in production")
        if not DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg://")):
            raise RuntimeError("Production DATABASE_URL must be PostgreSQL")
        if ALLOW_SQLITE:
            raise RuntimeError("ALLOW_SQLITE must be disabled in production")
        if not ADMIN_ACCESS_KEY or not ADMIN_SECURITY_KEY:
            raise RuntimeError("ADMIN_ACCESS_KEY is required in production")
        if MOCK_MODE:
            raise RuntimeError("MOCK_MODE must be disabled in production")
        if "*" in CORS_ORIGINS:
            raise RuntimeError("Wildcard CORS is not allowed in production")
        if SOLANA_SUBMISSION_ENABLED:
            raise RuntimeError("Solana submission must use isolated staging, not production")
    elif ENVIRONMENT == "staging":
        if SOLANA_SUBMISSION_ENABLED and SOLANA_NETWORK != "devnet":
            raise RuntimeError("Staging submission is restricted to Solana Devnet")
        if SOLANA_SUBMISSION_ENABLED and not SOLANA_AUTHORITY_SECRET_REF:
            raise RuntimeError("Solana authority must be supplied by a secret-store reference")
    elif DATABASE_URL and not DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg://", "sqlite://")):
        raise RuntimeError("DATABASE_URL must be PostgreSQL or SQLite")
