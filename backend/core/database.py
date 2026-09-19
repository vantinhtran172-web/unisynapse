import os
import re
import sqlite3
import json
import time
from contextlib import contextmanager
from functools import lru_cache
from typing import Optional, List, Dict, Any, Iterable

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Connection, Engine

from .config import ALLOW_SQLITE, DATABASE_URL, DB_PATH, ENVIRONMENT


class _CompatRow:
    """Small DB-API row facade supporting both numeric and named access."""

    def __init__(self, values: Iterable[Any], keys: Iterable[str]):
        self._values = tuple(values)
        self._mapping = dict(zip(keys, self._values))

    def __getitem__(self, key: Any) -> Any:
        if isinstance(key, int):
            return self._values[key]
        return self._mapping[key]

    def __iter__(self):
        return iter(self._values)

    def keys(self):
        return self._mapping.keys()


_QMARK_RE = re.compile(r"(?<!['\"])[?](?!['\"])")


def _compile_sql(sql: str, params: Optional[Iterable[Any]]):
    """Translate legacy qmark parameters into SQLAlchemy named parameters."""
    values = tuple(params or ())
    if not values:
        return sql, {}
    names = [f"p{index}" for index in range(len(values))]
    compiled = _QMARK_RE.sub(lambda match: f":{names.pop(0)}", sql)
    return compiled, {f"p{index}": value for index, value in enumerate(values)}


def _translate_postgres_sql(sql: str) -> str:
    """Translate only audited SQLite constructs used by the legacy runtime."""
    translated = re.sub(
        r"INSERT\s+OR\s+IGNORE\s+INTO",
        "INSERT INTO",
        sql,
        flags=re.IGNORECASE,
    )
    if translated != sql and "ON CONFLICT" not in translated.upper():
        translated = f"{translated.rstrip().rstrip(';')} ON CONFLICT DO NOTHING"
    translated = re.sub(
        r"MIN\(\s*100\s*,",
        "LEAST(100,",
        translated,
        flags=re.IGNORECASE,
    )
    translated = re.sub(
        r"\bdisabled\s*=\s*0\b",
        "disabled = false",
        translated,
        flags=re.IGNORECASE,
    )
    translated = re.sub(
        r"\bis_gold_correct\s*=\s*1\b",
        "is_gold_correct = true",
        translated,
        flags=re.IGNORECASE,
    )
    return translated


class _CompatCursor:
    def __init__(self, connection: "_PostgresCompatConnection"):
        self.connection = connection
        self._result = None
        self.rowcount = -1

    def execute(self, sql: str, params=None):
        compiled, values = _compile_sql(_translate_postgres_sql(sql), params)
        self._result = self.connection._connection.execute(text(compiled), values)
        self.rowcount = self._result.rowcount
        return self

    def executemany(self, sql: str, parameter_rows):
        for params in parameter_rows:
            self.execute(sql, params)
        return self

    def _row(self, row):
        if row is None:
            return None
        mapping = row._mapping
        return _CompatRow(mapping.values(), mapping.keys())

    def fetchone(self):
        return self._row(self._result.fetchone()) if self._result else None

    def fetchall(self):
        return [self._row(row) for row in self._result.fetchall()] if self._result else []


class _PostgresCompatConnection:
    """Legacy connection facade backed by SQLAlchemy PostgreSQL."""

    def __init__(self, connection: Connection, transaction):
        self._connection = connection
        self._transaction = transaction

    def cursor(self):
        return _CompatCursor(self)

    def execute(self, sql: str, params=None):
        cursor = self.cursor()
        cursor.execute(sql, params)
        return cursor

    def commit(self):
        # The context manager owns the SQLAlchemy transaction boundary.
        return None

    def rollback(self):
        self._transaction.rollback()

    def close(self):
        self._connection.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        try:
            if exc_type:
                self._transaction.rollback()
            else:
                self._transaction.commit()
        finally:
            self._connection.close()
        return False


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """Return the configured SQLAlchemy engine for migrations and new queries."""
    url = DATABASE_URL
    if not url:
        if ENVIRONMENT == "production" or not ALLOW_SQLITE:
            raise RuntimeError("A PostgreSQL DATABASE_URL is required outside local SQLite mode")
        url = f"sqlite:///{DB_PATH.as_posix()}"
    return create_engine(url, future=True, pool_pre_ping=True)


@contextmanager
def get_connection() -> Connection:
    """Provide a transactional SQLAlchemy connection."""
    with get_engine().begin() as connection:
        yield connection


@contextmanager
def _get_postgres_db():
    connection = get_engine().connect()
    transaction = connection.begin()
    facade = _PostgresCompatConnection(connection, transaction)
    try:
        yield facade
    except Exception:
        transaction.rollback()
        connection.close()
        raise
    else:
        transaction.commit()
        connection.close()


def get_db():
    """Return the legacy DB facade for local SQLite or configured PostgreSQL."""
    if DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg://")):
        return _get_postgres_db()
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False, timeout=30.0)
    conn.row_factory = sqlite3.Row
    # Enable WAL mode for high concurrency
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            address TEXT UNIQUE,
            username TEXT UNIQUE,
            password_hash TEXT,
            disabled INTEGER NOT NULL DEFAULT 0,
            unipoints INTEGER DEFAULT 0,
            reputation INTEGER DEFAULT 100,
            role TEXT DEFAULT 'student',
            created_at REAL
        )
        """)
        # Compatibility upgrades for databases created before member authentication.
        user_columns = {
            row["name"] for row in cursor.execute("PRAGMA table_info(users)").fetchall()
        }
        if "password_hash" not in user_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
        if "disabled" not in user_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0")
        
        # 2. Tasks (Data Labeling)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            input_text TEXT NOT NULL,
            labels TEXT NOT NULL, -- JSON array of strings e.g. ["neutral", "positive", "negative"]
            required_votes INTEGER DEFAULT 5,
            consensus_threshold REAL DEFAULT 0.8,
            reward_points INTEGER DEFAULT 10,
            gold_label TEXT,
            status TEXT DEFAULT 'open', -- open, completed, rejected
            consensus TEXT,
            completed_at REAL,
            created_at REAL
        )
        """)
        
        # 3. Task Submissions
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS task_submissions (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            label TEXT NOT NULL,
            is_gold_correct INTEGER DEFAULT 1,
            created_at REAL,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(task_id, user_id)
        )
        """)
        
        # 4. Documents
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            owner_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_type TEXT NOT NULL,
            size_bytes INTEGER NOT NULL,
            checksum TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'pending_review', -- pending_review, approved, rejected
            mime_check TEXT DEFAULT 'pending',
            pii_check TEXT DEFAULT 'pending',
            dedupe_check TEXT DEFAULT 'pending',
            copyright_check TEXT DEFAULT 'pending',
            quality_check TEXT DEFAULT 'pending',
            rejection_reason TEXT,
            chunk_count INTEGER DEFAULT 0,
            created_at REAL,
            approved_at REAL,
            FOREIGN KEY (owner_id) REFERENCES users(id)
        )
        """)
        
        # 5. Document Chunks (for RAG)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            document_name TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            page_number INTEGER,
            content TEXT NOT NULL,
            embedding TEXT NOT NULL, -- JSON array of floats
            created_at REAL,
            FOREIGN KEY (document_id) REFERENCES documents(id)
        )
        """)
        
        # CPU-sharing schema retired. Existing legacy tables are preserved and never used.
        
        # 7. Double-Entry Reward Ledger
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reward_ledger (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            delta INTEGER NOT NULL,
            reason TEXT NOT NULL,
            source_type TEXT NOT NULL,
            source_id TEXT NOT NULL,
            reward_event_key TEXT UNIQUE,
            proof_status TEXT DEFAULT 'unsubmitted',
            solana_signature TEXT,
            proof_hash TEXT NOT NULL,
            created_at REAL,
            proof_attempts INTEGER NOT NULL DEFAULT 0,
            proof_last_error TEXT,
            proof_submitted_at REAL,
            proof_verified_at REAL,
            proof_next_retry_at REAL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)
        ledger_columns = {
            row["name"] for row in cursor.execute("PRAGMA table_info(reward_ledger)").fetchall()
        }
        legacy_columns = {
            "reward_event_key": "ALTER TABLE reward_ledger ADD COLUMN reward_event_key TEXT",
            "proof_attempts": "ALTER TABLE reward_ledger ADD COLUMN proof_attempts INTEGER NOT NULL DEFAULT 0",
            "proof_last_error": "ALTER TABLE reward_ledger ADD COLUMN proof_last_error TEXT",
            "proof_submitted_at": "ALTER TABLE reward_ledger ADD COLUMN proof_submitted_at REAL",
            "proof_verified_at": "ALTER TABLE reward_ledger ADD COLUMN proof_verified_at REAL",
            "proof_next_retry_at": "ALTER TABLE reward_ledger ADD COLUMN proof_next_retry_at REAL",
        }
        for column_name, alter_sql in legacy_columns.items():
            if column_name not in ledger_columns:
                cursor.execute(alter_sql)
        cursor.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_reward_ledger_event_key "
            "ON reward_ledger(reward_event_key)"
        )
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS ix_reward_ledger_proof_retry "
            "ON reward_ledger(proof_status, proof_next_retry_at)"
        )
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS ix_reward_ledger_solana_signature "
            "ON reward_ledger(solana_signature)"
        )

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ledger_accounts (
            id TEXT PRIMARY KEY,
            account_type TEXT NOT NULL,
            user_id TEXT,
            created_at REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ledger_transactions (
            id TEXT PRIMARY KEY,
            transaction_key TEXT NOT NULL UNIQUE,
            source_type TEXT NOT NULL,
            source_id TEXT NOT NULL,
            delta INTEGER NOT NULL CHECK (delta > 0),
            created_at REAL NOT NULL
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ledger_entries (
            id TEXT PRIMARY KEY,
            transaction_id TEXT NOT NULL,
            account_id TEXT NOT NULL,
            debit INTEGER NOT NULL DEFAULT 0 CHECK (debit >= 0),
            credit INTEGER NOT NULL DEFAULT 0 CHECK (credit >= 0),
            FOREIGN KEY (transaction_id) REFERENCES ledger_transactions(id) ON DELETE CASCADE,
            FOREIGN KEY (account_id) REFERENCES ledger_accounts(id),
            CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_usage (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            request_hash TEXT NOT NULL,
            status TEXT NOT NULL,
            response TEXT,
            cost INTEGER NOT NULL,
            created_at REAL NOT NULL,
            UNIQUE(user_id, id)
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS solana_deposits (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            sender TEXT NOT NULL,
            created_at REAL NOT NULL,
            signature TEXT UNIQUE,
            points INTEGER,
            lamports INTEGER,
            credited_at REAL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS bank_deposits (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            order_code TEXT UNIQUE NOT NULL,
            amount_vnd INTEGER NOT NULL,
            points INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            qr_url TEXT,
            bank_name TEXT DEFAULT 'ACB',
            account_number TEXT DEFAULT '38038627',
            account_name TEXT DEFAULT 'TRAN VAN TINH',
            created_at REAL NOT NULL,
            credited_at REAL
        )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bank_deposits_user ON bank_deposits(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bank_deposits_code ON bank_deposits(order_code)")

        for col_def in [
            "initial_balance REAL",
            "final_balance REAL",
            "payout_mode TEXT DEFAULT 'unipoints'",
            "sol_amount REAL DEFAULT 0.0",
            "target_wallet TEXT",
            "solana_signature TEXT",
            "bank_tx_ref TEXT",
        ]:
            try:
                cursor.execute(f"ALTER TABLE bank_deposits ADD COLUMN {col_def}")
            except Exception:
                pass

        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_bank_deposits_tx_ref ON bank_deposits(bank_tx_ref)")
        except Exception:
            pass

        for tbl, col_def in [
            ("documents", "solana_tx TEXT"),
            ("documents", "attestation_pda TEXT"),
            ("documents", "university TEXT DEFAULT 'Đại học Bách Khoa TP.HCM'"),
            ("documents", "subject_code TEXT DEFAULT 'CS101'"),
            ("documents", "subject_name TEXT DEFAULT 'Lập trình C & Cấu trúc Dữ liệu'"),
            ("tasks", "solana_tx TEXT"),
        ]:
            try:
                cursor.execute(f"ALTER TABLE {tbl} ADD COLUMN {col_def}")
            except Exception:
                pass

        # 7.5. Autonomous On-Chain Oracle Jobs
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS oracle_jobs (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            owner_id TEXT NOT NULL,
            checksum_sha256 TEXT NOT NULL,
            quality_score INTEGER NOT NULL,
            chunk_count INTEGER NOT NULL,
            nonce INTEGER NOT NULL,
            oracle_version TEXT NOT NULL DEFAULT 'v1',
            idempotency_key TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'queued', -- queued, processed, confirmed, finalized, failed
            tx_signature TEXT,
            attestation_pda TEXT,
            error_message TEXT,
            fast_gate_latency_ms REAL,
            submit_latency_ms REAL,
            confirmed_latency_ms REAL,
            finalized_latency_ms REAL,
            created_at REAL NOT NULL,
            updated_at REAL NOT NULL,
            FOREIGN KEY (document_id) REFERENCES documents(id),
            FOREIGN KEY (owner_id) REFERENCES users(id)
        )
        """)
        # Compatibility upgrades for local databases created before idempotency hardening.
        oracle_job_columns = {
            row["name"] for row in cursor.execute("PRAGMA table_info(oracle_jobs)").fetchall()
        }
        if "oracle_version" not in oracle_job_columns:
            cursor.execute("ALTER TABLE oracle_jobs ADD COLUMN oracle_version TEXT NOT NULL DEFAULT 'v1'")
        if "idempotency_key" not in oracle_job_columns:
            cursor.execute("ALTER TABLE oracle_jobs ADD COLUMN idempotency_key TEXT NOT NULL DEFAULT ''")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_oracle_jobs_doc ON oracle_jobs(document_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_oracle_jobs_status ON oracle_jobs(status)")
        cursor.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_oracle_jobs_owner_idempotency "
            "ON oracle_jobs(owner_id, idempotency_key) WHERE idempotency_key <> ''"
        )
        duplicate_nonce = cursor.execute(
            """
            SELECT 1
            FROM oracle_jobs
            GROUP BY oracle_version, nonce
            HAVING COUNT(*) > 1
            LIMIT 1
            """
        ).fetchone()
        if duplicate_nonce is None:
            cursor.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_oracle_jobs_oracle_nonce "
                "ON oracle_jobs(oracle_version, nonce)"
            )
        else:
            # Do not rewrite historical jobs automatically: a submitted job's nonce
            # is part of its replay PDA. New jobs still allocate MAX(nonce)+1.
            import logging
            logging.getLogger("database").warning(
                "Skipped oracle nonce unique index because legacy duplicate nonces exist; "
                "historical jobs require an explicit maintenance migration"
            )


        # 8. Audit Events
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_events (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            action TEXT NOT NULL,
            details TEXT,
            timestamp REAL
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS member_sessions (
            token_hash TEXT PRIMARY KEY,
            member_id TEXT NOT NULL,
            expires_at REAL NOT NULL,
            created_at REAL NOT NULL,
            revoked_at REAL,
            FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)

        # 10. Internal admin accounts and revocable sessions
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_accounts (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            totp_secret TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin',
            disabled INTEGER NOT NULL DEFAULT 0,
            created_at REAL NOT NULL
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_sessions (
            token_hash TEXT PRIMARY KEY,
            admin_id TEXT NOT NULL,
            expires_at REAL NOT NULL,
            created_at REAL NOT NULL,
            FOREIGN KEY (admin_id) REFERENCES admin_accounts(id) ON DELETE CASCADE
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS wallet_challenges (
            nonce TEXT PRIMARY KEY,
            wallet_address TEXT NOT NULL,
            issued_at REAL NOT NULL,
            expires_at REAL NOT NULL,
            consumed_at REAL
        )
        """)

        conn.commit()

def seed_initial_data():
    if os.getenv("SEED_DEMO_DATA", "0") != "1":
        return

    with get_db() as conn:
        cursor = conn.cursor()
        
        member_id = os.getenv("DEMO_MEMBER_ID", "").strip()
        if not member_id:
            raise RuntimeError("DEMO_MEMBER_ID is required when SEED_DEMO_DATA=1")
        member = cursor.execute(
            "SELECT id FROM users WHERE id = ? AND disabled = 0",
            (member_id,),
        ).fetchone()
        if not member:
            raise RuntimeError("DEMO_MEMBER_ID must reference an existing active member")

        # Seed open tasks for Data Labeling
        cursor.execute("SELECT COUNT(*) FROM tasks")
        if cursor.fetchone()[0] == 0:
            now = time.time()
            tasks = [
                (
                    "task_101",
                    "Phân loại phản hồi bài giảng CS101",
                    "Gán nhãn cảm xúc và tính hữu ích từ đánh giá của sinh viên về bài giảng Con trỏ (Pointers) và Cấp phát động.",
                    "Sentiment Analysis",
                    "The explanation of pointers in the recent lecture notes was confusing and lacked practical memory-leak examples.",
                    json.dumps(["neutral", "positive", "negative"]),
                    5,
                    0.8,
                    10,
                    "negative",
                    "open",
                    None,
                    None,
                    now
                ),
                (
                    "task_102",
                    "Đánh giá độ rõ ràng của giải thích thuật toán BFS",
                    "Kiểm tra câu trả lời của AI giải thích thuật toán Tìm kiếm theo chiều rộng (BFS) có chính xác và dễ hiểu không.",
                    "Quality Evaluation",
                    "Thuật toán BFS duyệt cây theo từng tầng bằng cách sử dụng hàng đợi (Queue). Đỉnh bắt đầu được đưa vào hàng đợi trước, sau đó lần lượt lấy từng đỉnh ra và thêm các đỉnh kề chưa duyệt vào hàng đợi.",
                    json.dumps(["clear", "unclear", "inaccurate"]),
                    4,
                    0.75,
                    15,
                    "clear",
                    "open",
                    None,
                    None,
                    now + 1
                ),
                (
                    "task_103",
                    "Phân loại dạng bài tập Cấu trúc dữ liệu",
                    "Gán nhãn thể loại bài toán để hệ thống gợi ý bài tập tương ứng cho sinh viên ôn thi.",
                    "Topic Classification",
                    "Cho một mảng số nguyên A gồm N phần tử. Hãy thiết kế cấu trúc dữ liệu cho phép cập nhật một phần tử và tính tổng một đoạn [L, R] với độ phức tạp O(log N).",
                    json.dumps(["Segment Tree / Fenwick", "Dynamic Programming", "Graph Theory"]),
                    3,
                    0.66,
                    12,
                    "Segment Tree / Fenwick",
                    "open",
                    None,
                    None,
                    now + 2
                )
            ]
            
            cursor.executemany("""
            INSERT INTO tasks (
                id, title, description, category, input_text, labels,
                required_votes, consensus_threshold, reward_points, gold_label,
                status, consensus, completed_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, tasks)

        conn.commit()
