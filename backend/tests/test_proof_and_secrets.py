import os
import pytest
from unittest.mock import patch

from backend.core.config import validate_runtime_config
from backend.services.solana_service import SolanaService
from backend.services.solana_onramp_service import SolanaOnRampService


def test_solana_service_has_no_fake_offline_signature():
    assert not hasattr(SolanaService, "generate_devnet_signature")
    assert SolanaService.get_explorer_url(None) is None
    assert SolanaService.get_explorer_url("") is None
    assert SolanaService.get_explorer_url("invalid_short") is None
    assert SolanaService.get_explorer_url("bad!char" * 5) is None


def test_solana_onramp_service_fails_closed_without_secrets(monkeypatch, tmp_path):
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.delenv("SOLANA_TREASURY_SECRET_KEY", raising=False)
    monkeypatch.delenv("SOLANA_SIGNER_SECRET_KEY", raising=False)
    monkeypatch.setattr(SolanaOnRampService, "_keypair", None)
    monkeypatch.setattr(SolanaOnRampService, "_pubkey", None)
    monkeypatch.setattr("backend.services.solana_onramp_service.TREASURY_KEYPAIR_FILE", str(tmp_path / "missing.json"))

    with pytest.raises(RuntimeError, match="Solana Treasury secret is not configured"):
        SolanaOnRampService.get_keypair()


def test_record_label_submission_proof_returns_failure_when_rpc_fails(monkeypatch):
    monkeypatch.setattr(
        SolanaOnRampService,
        "transfer_sol_to_student",
        lambda **kwargs: {"ok": False, "onchain_confirmed": False, "signature": None, "explorer_url": None, "error": "RPC timeout"}
    )
    res = SolanaOnRampService.record_label_submission_proof_onchain(
        task_id="t123",
        user_id="u456",
        label="test_label"
    )
    assert res["ok"] is False
    assert res["signature"] is None
    assert res["explorer_url"] is None


def test_validate_runtime_config_strict_production_checks(monkeypatch):
    monkeypatch.setattr("backend.core.config.ENVIRONMENT", "production")
    monkeypatch.setattr("backend.core.config.DATABASE_URL", "postgresql+psycopg://user:pw@host/db")
    monkeypatch.setattr("backend.core.config.ALLOW_SQLITE", False)
    monkeypatch.setattr("backend.core.config.COOKIE_SECURE", True)
    monkeypatch.setattr("backend.core.config.ADMIN_ACCESS_KEY", "")
    monkeypatch.setattr("backend.core.config.ADMIN_SECURITY_KEY", "")

    with pytest.raises(RuntimeError, match="ADMIN_ACCESS_KEY is required in production"):
        validate_runtime_config()

    monkeypatch.setattr("backend.core.config.ADMIN_ACCESS_KEY", "test-admin-key")
    monkeypatch.setattr("backend.core.config.ADMIN_SECURITY_KEY", "test-admin-key")
    monkeypatch.setattr("backend.core.config.ACB_DEPOSITS_ENABLED", True)
    monkeypatch.setattr("backend.core.config.ACB_CLIENT_ID", "")

    with pytest.raises(RuntimeError, match="ACB credentials and account details are required"):
        validate_runtime_config()
