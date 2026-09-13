from logging.config import fileConfig
import os
from pathlib import Path
from alembic import context
from sqlalchemy import create_engine, pool
from backend.core.models import metadata

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = metadata

def _database_url():
    url = os.getenv("DATABASE_URL", "").strip()
    environment = os.getenv("ENVIRONMENT", "development").strip().lower()
    if environment == "production" and not url.startswith(("postgresql://", "postgresql+psycopg://")):
        raise RuntimeError("Alembic production migrations require a PostgreSQL DATABASE_URL")
    if not url:
        data_dir = Path(os.getenv("UNISYNAPSE_DATA_DIR", "data"))
        url = f"sqlite:///{(data_dir / 'unisynapse.db').resolve().as_posix()}"
    return url

def run_migrations_offline():
    context.configure(url=_database_url(), target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = create_engine(_database_url(), poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
