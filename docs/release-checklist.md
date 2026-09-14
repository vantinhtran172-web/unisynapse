# UniSynapse release checklist

## Preconditions

- [ ] Change ticket, owner, maintenance window and rollback owner recorded.
- [ ] CI is green for the exact commit being deployed.
- [ ] No secrets, private keys, database URLs or PII appear in artifacts.
- [ ] Production config has `ENVIRONMENT=production`, PostgreSQL `DATABASE_URL`, `ALLOW_SQLITE=0`, `COOKIE_SECURE=1`, and `SOLANA_SUBMISSION_ENABLED=0`.
- [ ] CORS is explicit and does not contain `*`.

## Database gate

- [ ] Verified backup exists outside the repository `backups/` directory.
- [ ] Alembic migration reviewed and run against disposable/staging PostgreSQL first.
- [ ] Row counts, foreign keys and ledger balance invariants validated.
- [ ] Restore rehearsal completed against a disposable clone.
- [ ] Migration rollback/forward recovery decision recorded.

## Application gate

- [ ] Backend health endpoint responds successfully.
- [ ] Auth login, CSRF-protected mutation and admin guard smoke-tested.
- [ ] Document six-gate status and grounded citation smoke-tested.
- [ ] Reward ledger projection and proof status smoke-tested.
- [ ] `verified` is the only status that exposes a Solana Explorer link.
- [ ] Frontend dashboard and admin page load without console errors.

## Solana staging gate

- [ ] Only if approved: staging uses `SOLANA_NETWORK=devnet`.
- [ ] Authority is loaded via `SOLANA_AUTHORITY_SECRET_REF`; the key is never copied into logs or files.
- [ ] Submission is limited to the rehearsal batch and ledger amount is unchanged.
- [ ] RPC confirmation and backend proof projection are recorded.
- [ ] Submission is disabled after rehearsal and temporary funding is cleaned up.

## Deploy and rollback

- [ ] Deploy exact CI-tested artifact.
- [ ] Monitor health, error rate, auth failures, database latency, queue/reconciliation failures and RAG provider errors.
- [ ] Roll back if migrations, invariants, authentication, ledger or proof verification fail.
- [ ] After rollback, re-run health and invariant checks; preserve evidence with the change record.
