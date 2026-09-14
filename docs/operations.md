# Database operations

## Environments

- Production requires `ENVIRONMENT=production` and a PostgreSQL `DATABASE_URL`.
- Production must set `ALLOW_SQLITE=0` and `COOKIE_SECURE=1`.
- Local development may use SQLite only with `ALLOW_SQLITE=1`.
- Never commit credentials or use a public tunnel for database access.

## PostgreSQL backup

Set `PGURL` in the current shell from the deployment secret store; do not place
credentials in this repository or command history.

```powershell
$env:PGURL = '<DATABASE_URL_FROM_SECRET_STORE>'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
pg_dump --dbname=$env:PGURL --format=custom --file="backups/unisynapse-$stamp.dump"
pg_restore --list "backups/unisynapse-$stamp.dump" | Select-Object -First 20
```

Store the dump in protected backup storage. The repository `backups/` directory
is ignored and must not be treated as durable production storage.

## Migration and staging rehearsal

1. Preserve the source SQLite file and create a separate copy for rehearsal.
2. Set `TEST_DATABASE_URL` to a disposable PostgreSQL database.
3. Run `.\.venv\Scripts\alembic.exe upgrade head`.
4. Transfer legacy data explicitly:
   `.\.venv\Scripts\python.exe -m backend.scripts.migrate_sqlite_to_postgres --source sqlite:///data/unisynapse.db --target $env:TEST_DATABASE_URL`.
5. Validate referential integrity:
   `.\.venv\Scripts\python.exe -m backend.scripts.validate_postgres_data --database-url $env:TEST_DATABASE_URL`.
6. Run `.\.venv\Scripts\python.exe -m pytest backend/tests -q` and auth/ownership smoke tests.
7. Promote only after schema, row counts, integrity checks, and application health checks succeed.

## Restore rehearsal and rollback

```powershell
pg_restore --clean --if-exists --no-owner --dbname=$env:PGURL "backups/<verified-dump>.dump"
.\.venv\Scripts\alembic.exe upgrade head
.\.venv\Scripts\python.exe -m backend.scripts.validate_postgres_data --database-url $env:PGURL
```

If validation fails, stop application traffic, restore the last verified dump,
rerun validation, and keep the SQLite source unchanged until reconciliation is
complete. Do not run destructive restore commands against production without a
verified backup and an approved maintenance window.

The data-transfer utility is never invoked by application startup.

## Solana proof reconciliation

- Production must keep `SOLANA_SUBMISSION_ENABLED=0`; client signatures and
  browser storage are never accepted as proof credentials.
- Staging submission is restricted to `SOLANA_NETWORK=devnet` and requires a
  secret-store reference in `SOLANA_AUTHORITY_SECRET_REF`. Never put the funded
  authority key in `.env`, logs, CI output, or the repository.
- Reconcile existing trusted signatures without submission:
  `.\\.venv\\Scripts\\python.exe -m backend.scripts.reconcile_solana --dry-run`.
- The worker claims rows with a compare-and-set transition, verifies confirmed
  or finalized Devnet transactions, and retries with bounded exponential delay.
  It never changes the internal reward amount.
- A non-zero worker exit code means terminal proof failures require operator
  review; inspect `proof_last_error`, `proof_attempts`, and the signature before
  retrying. Never manually mark a proof `verified`.

### Staging Devnet rehearsal

1. Use a disposable PostgreSQL staging database and a funded Devnet authority
   loaded only through the deployment secret store.
2. Run `alembic upgrade head`, then validate row counts and ledger balance
   invariants before enabling submission.
3. Set `ENVIRONMENT=staging`, `SOLANA_NETWORK=devnet`,
   `SOLANA_SUBMISSION_ENABLED=1`, and `SOLANA_AUTHORITY_SECRET_REF`.
4. Run the reconciliation worker with a small `--limit`, capture RPC response,
   signature, explorer URL, and resulting proof status.
5. Disable submission after the rehearsal and remove temporary Devnet funds.
6. Preserve the rehearsal evidence with the staging change record; do not reuse
   the authority key for production.

