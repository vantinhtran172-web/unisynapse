from alembic import context, op
import sqlalchemy as sa

revision = "0003_reward_event_key"
down_revision = "0002_operational_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if context.is_offline_mode():
        op.add_column(
            "reward_ledger",
            sa.Column("reward_event_key", sa.String(length=512), nullable=True),
        )
        op.create_index(
            "uq_reward_ledger_event_key",
            "reward_ledger",
            ["reward_event_key"],
            unique=True,
        )
        return

    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {
        column["name"] for column in inspector.get_columns("reward_ledger")
    }
    if "reward_event_key" not in columns:
        op.add_column(
            "reward_ledger",
            sa.Column("reward_event_key", sa.String(length=512), nullable=True),
        )

    indexes = {index["name"] for index in inspector.get_indexes("reward_ledger")}
    if "uq_reward_ledger_event_key" not in indexes:
        op.create_index(
            "uq_reward_ledger_event_key",
            "reward_ledger",
            ["reward_event_key"],
            unique=True,
        )


def downgrade() -> None:
    if context.is_offline_mode():
        op.drop_index("uq_reward_ledger_event_key", table_name="reward_ledger")
        op.drop_column("reward_ledger", "reward_event_key")
        return

    bind = op.get_bind()
    inspector = sa.inspect(bind)
    indexes = {index["name"] for index in inspector.get_indexes("reward_ledger")}
    if "uq_reward_ledger_event_key" in indexes:
        op.drop_index("uq_reward_ledger_event_key", table_name="reward_ledger")

    columns = {
        column["name"] for column in inspector.get_columns("reward_ledger")
    }
    if "reward_event_key" in columns:
        op.drop_column("reward_ledger", "reward_event_key")
