import os
import pytest
from sqlalchemy import create_engine, inspect, text

from backend.core.models import metadata
def test_postgres_schema_contract():
    url = os.getenv("TEST_DATABASE_URL", "").strip()
    if not url:
        pytest.skip("TEST_DATABASE_URL is not configured")
    if not url.startswith(("postgresql://", "postgresql+psycopg://")):
        pytest.fail("TEST_DATABASE_URL must be PostgreSQL")

    engine = create_engine(url)
    metadata.create_all(engine)
    names = set(inspect(engine).get_table_names())
    expected = set(metadata.tables)
    assert expected.issubset(names)
    with engine.begin() as conn:
        conn.execute(text("SELECT 1"))
