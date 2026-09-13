"""Explicit, idempotent SQLite-to-PostgreSQL data transfer utility."""
import argparse
from sqlalchemy import create_engine, insert, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from backend.core.models import metadata

TABLE_ORDER = ["users", "tasks", "task_submissions", "documents", "document_chunks", "reward_ledger", "audit_events", "member_sessions", "admin_accounts", "admin_sessions"]


def migrate(source_url: str, target_url: str) -> None:
    source = create_engine(source_url)
    target = create_engine(target_url)
    metadata.create_all(target)
    with source.connect() as source_conn, target.begin() as target_conn:
        for name in TABLE_ORDER:
            table = metadata.tables[name]
            rows = source_conn.execute(select(table)).mappings().all()
            if not rows:
                continue
            for row in rows:
                values = dict(row)
                if target.dialect.name == "postgresql":
                    statement = pg_insert(table).values(**values).on_conflict_do_nothing()
                else:
                    statement = insert(table).values(**values).prefix_with("OR IGNORE")
                target_conn.execute(statement)
            print(f"{name}: {len(rows)} records transferred")

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, help="SQLite SQLAlchemy URL")
    parser.add_argument("--target", required=True, help="PostgreSQL SQLAlchemy URL")
    args = parser.parse_args()
    if not args.target.startswith(("postgresql://", "postgresql+psycopg://")):
        raise SystemExit("target must be PostgreSQL")
    migrate(args.source, args.target)

if __name__ == "__main__":
    main()
