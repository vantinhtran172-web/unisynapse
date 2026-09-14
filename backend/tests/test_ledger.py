import sqlite3

import pytest

from backend.services.ledger_service import LedgerInvariantError, settle_reward


@pytest.fixture
def ledger_db(tmp_path):
    path = tmp_path / "ledger.sqlite"
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.executescript(
        """
        PRAGMA foreign_keys = ON;
        CREATE TABLE users (id TEXT PRIMARY KEY, unipoints INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE reward_ledger (
            id TEXT PRIMARY KEY, user_id TEXT NOT NULL, delta INTEGER NOT NULL,
            reason TEXT NOT NULL, source_type TEXT NOT NULL, source_id TEXT NOT NULL,
            reward_event_key TEXT UNIQUE, proof_status TEXT, solana_signature TEXT,
            proof_hash TEXT NOT NULL, created_at REAL
        );
        CREATE TABLE ledger_accounts (
            id TEXT PRIMARY KEY, account_type TEXT NOT NULL, user_id TEXT,
            created_at REAL NOT NULL
        );
        CREATE TABLE ledger_transactions (
            id TEXT PRIMARY KEY, transaction_key TEXT NOT NULL UNIQUE,
            source_type TEXT NOT NULL, source_id TEXT NOT NULL,
            delta INTEGER NOT NULL CHECK (delta > 0), created_at REAL NOT NULL
        );
        CREATE TABLE ledger_entries (
            id TEXT PRIMARY KEY, transaction_id TEXT NOT NULL, account_id TEXT NOT NULL,
            debit INTEGER NOT NULL DEFAULT 0 CHECK (debit >= 0),
            credit INTEGER NOT NULL DEFAULT 0 CHECK (credit >= 0),
            FOREIGN KEY (transaction_id) REFERENCES ledger_transactions(id),
            FOREIGN KEY (account_id) REFERENCES ledger_accounts(id),
            CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
        );
        INSERT INTO users (id, unipoints) VALUES ('member-1', 20);
        """
    )
    try:
        yield connection
    finally:
        connection.close()


def settle(connection, *, event_key="reward:event:1", delta=15, user_id="member-1"):
    return settle_reward(
        connection,
        user_id=user_id,
        delta=delta,
        reason="Test reward",
        source_type="test",
        source_id="event-1",
        reward_event_key=event_key,
        proof_hash="proof-hash",
        created_at=100.0,
    )


def test_settlement_creates_balanced_entries_and_updates_projection(ledger_db):
    result = settle(ledger_db)
    ledger_db.commit()

    assert result["created"] is True
    entries = ledger_db.execute(
        "SELECT debit, credit FROM ledger_entries WHERE transaction_id = ?",
        (result["transaction_id"],),
    ).fetchall()
    assert len(entries) == 2
    assert sum(row["debit"] for row in entries) == 15
    assert sum(row["credit"] for row in entries) == 15
    assert ledger_db.execute(
        "SELECT unipoints FROM users WHERE id = 'member-1'"
    ).fetchone()[0] == 35
    assert ledger_db.execute("SELECT COUNT(*) FROM reward_ledger").fetchone()[0] == 1


def test_duplicate_event_key_does_not_double_credit(ledger_db):
    first = settle(ledger_db)
    second = settle(ledger_db)
    ledger_db.commit()

    assert first["created"] is True
    assert second["created"] is False
    assert second["transaction_id"] == first["transaction_id"]
    assert ledger_db.execute(
        "SELECT unipoints FROM users WHERE id = 'member-1'"
    ).fetchone()[0] == 35
    assert ledger_db.execute("SELECT COUNT(*) FROM ledger_transactions").fetchone()[0] == 1


@pytest.mark.parametrize("delta", [0, -1, 1.5, True])
def test_settlement_rejects_non_positive_or_non_integer_amounts(ledger_db, delta):
    with pytest.raises(LedgerInvariantError):
        settle(ledger_db, delta=delta)
    ledger_db.rollback()
    assert ledger_db.execute("SELECT COUNT(*) FROM ledger_transactions").fetchone()[0] == 0


def test_missing_member_rolls_back_every_accounting_write(ledger_db):
    with pytest.raises(LedgerInvariantError, match="owner does not exist"):
        settle(ledger_db, user_id="missing-member")
    ledger_db.rollback()

    assert ledger_db.execute("SELECT COUNT(*) FROM ledger_transactions").fetchone()[0] == 0
    assert ledger_db.execute("SELECT COUNT(*) FROM ledger_entries").fetchone()[0] == 0
    assert ledger_db.execute("SELECT COUNT(*) FROM reward_ledger").fetchone()[0] == 0
