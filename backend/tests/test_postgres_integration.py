import os
import pytest
from sqlalchemy import create_engine, inspect, text

from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import CreateTable
from backend.core.models import metadata


def test_postgres_metadata_ddl_compilation():
    dialect = postgresql.dialect()
    for table in metadata.tables.values():
        ddl = str(CreateTable(table).compile(dialect=dialect)).strip()
        assert ddl.startswith(f"CREATE TABLE {table.name}")


def test_postgres_schema_contract():
    url = os.getenv("TEST_DATABASE_URL", "").strip()
    if not url:
        pytest.skip("TEST_DATABASE_URL is not configured; live PostgreSQL integration test skipped")
    if not url.startswith(("postgresql://", "postgresql+psycopg://")):
        pytest.fail("TEST_DATABASE_URL must be PostgreSQL")

    engine = create_engine(url)
    metadata.create_all(engine)
    names = set(inspect(engine).get_table_names())
    expected = set(metadata.tables)
    assert expected.issubset(names)
    with engine.begin() as conn:
        conn.execute(text("SELECT 1"))

