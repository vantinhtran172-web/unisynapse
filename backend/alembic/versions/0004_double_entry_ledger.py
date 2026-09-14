from alembic import context, op
import sqlalchemy as sa

revision = "0004_double_entry_ledger"
down_revision = "0003_reward_event_key"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ledger_accounts",
        sa.Column("id", sa.String(length=255), primary_key=True),
        sa.Column("account_type", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    op.create_table(
        "ledger_transactions",
        sa.Column("id", sa.String(length=255), primary_key=True),
        sa.Column("transaction_key", sa.String(length=512), nullable=False),
        sa.Column("source_type", sa.String(length=128), nullable=False),
        sa.Column("source_id", sa.String(length=255), nullable=False),
        sa.Column("delta", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.Float(), nullable=False),
        sa.CheckConstraint("delta > 0", name="ck_ledger_transaction_positive_delta"),
        sa.UniqueConstraint("transaction_key", name="uq_ledger_transaction_key"),
    )
    op.create_table(
        "ledger_entries",
        sa.Column("id", sa.String(length=255), primary_key=True),
        sa.Column("transaction_id", sa.String(length=255), nullable=False),
        sa.Column("account_id", sa.String(length=255), nullable=False),
        sa.Column("debit", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("credit", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["transaction_id"], ["ledger_transactions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["account_id"], ["ledger_accounts.id"]),
        sa.CheckConstraint("debit >= 0 AND credit >= 0", name="ck_ledger_entry_nonnegative"),
        sa.CheckConstraint("(debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)", name="ck_ledger_entry_one_side"),
    )


def downgrade() -> None:
    op.drop_table("ledger_entries")
    op.drop_table("ledger_transactions")
    op.drop_table("ledger_accounts")
