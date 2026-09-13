import os
import pytest

from backend.core.config import validate_runtime_config


def test_production_requires_postgres(monkeypatch):
    monkeypatch.setattr("backend.core.config.ENVIRONMENT", "production")
    monkeypatch.setattr("backend.core.config.DATABASE_URL", "")
    monkeypatch.setattr("backend.core.config.ALLOW_SQLITE", False)
    monkeypatch.setattr("backend.core.config.COOKIE_SECURE", True)
    with pytest.raises(RuntimeError, match="DATABASE_URL"):
        validate_runtime_config()


def test_production_rejects_sqlite(monkeypatch):
    monkeypatch.setattr("backend.core.config.ENVIRONMENT", "production")
    monkeypatch.setattr("backend.core.config.DATABASE_URL", "sqlite:///local.db")
    monkeypatch.setattr("backend.core.config.ALLOW_SQLITE", False)
    monkeypatch.setattr("backend.core.config.COOKIE_SECURE", True)
    with pytest.raises(RuntimeError, match="PostgreSQL"):
        validate_runtime_config()
