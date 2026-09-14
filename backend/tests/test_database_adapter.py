import pytest

from backend.core.database import (
    _CompatRow,
    _compile_sql,
    _translate_postgres_sql,
)


def test_compile_sql_translates_qmark_parameters_without_interpolation():
    sql, params = _compile_sql(
        "SELECT * FROM users WHERE id = ? AND username = ?",
        ("member-1", "alice"),
    )

    assert sql == "SELECT * FROM users WHERE id = :p0 AND username = :p1"
    assert params == {"p0": "member-1", "p1": "alice"}
    assert "member-1" not in sql
    assert "alice" not in sql


def test_compile_sql_preserves_literal_question_marks():
    sql, params = _compile_sql(
        "SELECT '?' AS literal_value WHERE id = ?",
        ("member-1",),
    )

    assert sql == "SELECT '?' AS literal_value WHERE id = :p0"
    assert params == {"p0": "member-1"}


def test_compat_row_supports_numeric_and_named_access():
    row = _CompatRow(("member-1", "alice"), ("id", "username"))

    assert row[0] == "member-1"
    assert row["id"] == "member-1"
    assert row[1] == "alice"
    assert row["username"] == "alice"
    assert list(row.keys()) == ["id", "username"]
    assert dict(row) == {"id": "member-1", "username": "alice"}


@pytest.mark.parametrize(
    ("source", "expected"),
    [
        (
            "INSERT OR IGNORE INTO users (id) VALUES (?)",
            "INSERT INTO users (id) VALUES (?) ON CONFLICT DO NOTHING",
        ),
        (
            "UPDATE users SET reputation = MIN(100, reputation + ?)",
            "UPDATE users SET reputation = LEAST(100, reputation + ?)",
        ),
        (
            "UPDATE users SET disabled = 0 WHERE id = ?",
            "UPDATE users SET disabled = false WHERE id = ?",
        ),
        (
            "SELECT * FROM task_submissions WHERE is_gold_correct = 1",
            "SELECT * FROM task_submissions WHERE is_gold_correct = true",
        ),
    ],
)
def test_translate_audited_sqlite_constructs(source, expected):
    assert _translate_postgres_sql(source) == expected

class _FakeResult:
    rowcount = 1

    def __init__(self):
        self._rows = []

    def fetchone(self):
        return None

    def fetchall(self):
        return self._rows


class _FakeConnection:
    def __init__(self):
        self._connection = self
        self.calls = []
        self.result = _FakeResult()

    def execute(self, statement, params):
        self.calls.append((str(statement), params))
        return self.result


def test_compat_cursor_executes_parameterized_statement():
    from backend.core.database import _CompatCursor

    connection = _FakeConnection()
    cursor = _CompatCursor(connection)

    returned = cursor.execute(
        "SELECT id FROM users WHERE username = ?",
        ("alice",),
    )

    assert returned is cursor
    assert connection.calls == [
        ("SELECT id FROM users WHERE username = :p0", {"p0": "alice"})
    ]
    assert cursor.rowcount == 1
