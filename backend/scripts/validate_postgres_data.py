"""Validate referential and identity integrity in a PostgreSQL database."""
import argparse
from sqlalchemy import create_engine, text

CHECKS = {
    "orphan_documents": "SELECT COUNT(*) FROM documents d LEFT JOIN users u ON u.id = d.owner_id WHERE u.id IS NULL",
    "orphan_rewards": "SELECT COUNT(*) FROM reward_ledger r LEFT JOIN users u ON u.id = r.user_id WHERE u.id IS NULL",
    "orphan_task_submissions": "SELECT COUNT(*) FROM task_submissions s LEFT JOIN users u ON u.id = s.user_id LEFT JOIN tasks t ON t.id = s.task_id WHERE u.id IS NULL OR t.id IS NULL",
    "orphan_member_sessions": "SELECT COUNT(*) FROM member_sessions s LEFT JOIN users u ON u.id = s.member_id WHERE u.id IS NULL",
}

def validate(database_url: str) -> None:
    if not database_url.startswith(("postgresql://", "postgresql+psycopg://")):
        raise SystemExit("validation requires PostgreSQL")
    engine = create_engine(database_url)
    failures = []
    with engine.connect() as conn:
        for name, query in CHECKS.items():
            count = conn.execute(text(query)).scalar_one()
            print(f"{name}: {count}")
            if count:
                failures.append(name)
    if failures:
        raise SystemExit("integrity checks failed: " + ", ".join(failures))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--database-url", required=True)
    args = parser.parse_args()
    validate(args.database_url)
