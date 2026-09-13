# Database operations

## Environments

- Production requires `ENVIRONMENT=production` and a PostgreSQL `DATABASE_URL`.
- Production must set `ALLOW_SQLITE=0` and `COOKIE_SECURE=1`.
- Local development may use SQLite only with `ALLOW_SQLITE=1`.
- Never commit credentials or use a public tunnel for database access.

## Migration

1. Back up the source database and verify the backup.
2. Run `alembic upgrade head` against a disposable/staging PostgreSQL database.
3. Use `backend/scripts/migrate_sqlite_to_postgres.py` explicitly for legacy data transfer.
4. Run `backend/scripts/validate_postgres_data.py` against the target database.
5. Run the backend tests and auth/ownership smoke tests.
6. Promote only after staging validation succeeds.

The data transfer utility is not invoked by application startup. Preserve the SQLite file until PostgreSQL validation and restore rehearsal are complete.
