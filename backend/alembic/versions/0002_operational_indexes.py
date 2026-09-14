"""Add operational indexes for PostgreSQL and SQLite query paths.

Revision ID: 0002_operational_indexes
Revises: 0001_initial_schema
Create Date: 2026-09-13
"""
from alembic import op

revision = "0002_operational_indexes"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


_INDEXES = (
    ("ix_tasks_status_created_at", "tasks", ["status", "created_at"]),
    ("ix_documents_owner_status", "documents", ["owner_id", "status"]),
    ("ix_documents_checksum", "documents", ["checksum"]),
    ("ix_document_chunks_document_index", "document_chunks", ["document_id", "chunk_index"]),
    ("ix_reward_ledger_user_created_at", "reward_ledger", ["user_id", "created_at"]),
    ("ix_member_sessions_member_expires", "member_sessions", ["member_id", "expires_at"]),
    ("ix_admin_sessions_admin_expires", "admin_sessions", ["admin_id", "expires_at"]),
)


def upgrade() -> None:
    for name, table, columns in _INDEXES:
        op.create_index(name, table, columns, unique=False)


def downgrade() -> None:
    for name, _table, _columns in reversed(_INDEXES):
        op.drop_index(name)
