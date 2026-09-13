import os
import sqlite3
import json
import time
from contextlib import contextmanager
from functools import lru_cache
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine
from sqlalchemy.engine import Connection, Engine
from .config import ALLOW_SQLITE, DATABASE_URL, DB_PATH, ENVIRONMENT

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


def get_db():
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
            proof_status TEXT DEFAULT 'unsubmitted',
            solana_signature TEXT,
            proof_hash TEXT NOT NULL,
            created_at REAL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

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

            # Insert sample cross-validation peer votes for task_101 to demonstrate consensus!
            # When current user votes "negative" or "neutral", they can see other peer votes
            peer_votes = [
                ("sub_p1", "task_101", "usr_peer_1", "negative", 1, now - 300),
                ("sub_p2", "task_101", "usr_peer_2", "negative", 1, now - 200),
                ("sub_p3", "task_101", "usr_peer_3", "negative", 1, now - 100),
            ]
            # Ensure peer users exist
            for uid, uname in [("usr_peer_1", "Alex"), ("usr_peer_2", "Bao"), ("usr_peer_3", "Chi")]:
                cursor.execute("INSERT OR IGNORE INTO users (id, address, username, unipoints, reputation, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                               (uid, f"0x{uid}solana", uname, 120, 95, "student", now))
            
            cursor.executemany("""
            INSERT OR IGNORE INTO task_submissions (id, task_id, user_id, label, is_gold_correct, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """, peer_votes)

        conn.commit()
