from alembic import op
import sqlalchemy as sa

revision = "0005_solana_proof_lifecycle"
down_revision = "0004_double_entry_ledger"
branch_labels = None
depends_on = None


def upgrade() -> None:
    for column in (
        sa.Column("proof_attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("proof_last_error", sa.Text(), nullable=True),
        sa.Column("proof_submitted_at", sa.Float(), nullable=True),
        sa.Column("proof_verified_at", sa.Float(), nullable=True),
        sa.Column("proof_next_retry_at", sa.Float(), nullable=True),
    ):
        op.add_column("reward_ledger", column)
    op.create_index(
        "ix_reward_ledger_proof_retry",
        "reward_ledger",
        ["proof_status", "proof_next_retry_at"],
    )
    op.create_index(
        "ix_reward_ledger_solana_signature",
        "reward_ledger",
        ["solana_signature"],
    )


def downgrade() -> None:
    op.drop_index("ix_reward_ledger_solana_signature", table_name="reward_ledger")
    op.drop_index("ix_reward_ledger_proof_retry", table_name="reward_ledger")
    for column in (
        "proof_next_retry_at",
        "proof_verified_at",
        "proof_submitted_at",
        "proof_last_error",
        "proof_attempts",
    ):
        op.drop_column("reward_ledger", column)
