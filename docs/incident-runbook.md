# UniSynapse incident runbook

## First response

1. Record UTC time, affected environment, deployment commit and operator.
2. Do not paste secrets, private keys, cookies, database URLs or PII into tickets/logs.
3. Preserve request IDs, redacted error messages, metrics and relevant CI/deploy links.
4. Stop risky mutations when ledger integrity or proof trust is uncertain.

## Authentication or CSRF failures

- Check backend health, cookie attributes, CORS origin and clock skew.
- Confirm the client sends credentials and the CSRF double-submit token for mutations.
- Return to the last known-good artifact if failures began after deployment.
- Rotate secrets only through the secret manager and record the rotation event.

## Database or migration failure

- Stop traffic if schema/data integrity is uncertain.
- Do not run destructive restore without a verified backup and maintenance approval.
- Restore the last verified dump into the approved target, then run Alembic and validation.
- Check row counts, foreign keys and ledger invariants before reopening traffic.

## Ledger or reward discrepancy

- Freeze reward mutations and preserve the affected source IDs/request IDs.
- Compare double-entry/invariant results and audit events.
- Never edit balances manually or replay an event without idempotency protection.
- Escalate to the owner of the source task/document and ledger service.

## Solana proof stuck or RPC outage

- Keep production `SOLANA_SUBMISSION_ENABLED=0` unless an approved staging exercise is active.
- Inspect redacted `proof_status`, `proof_attempts`, `proof_next_retry_at` and `proof_last_error`.
- Retry through the reconciliation worker; never manually mark a proof `verified`.
- Verify confirmation and memo/metadata through the configured RPC before trusting a signature.
- If retry budget is exhausted, leave the proof failed/reviewable and escalate.

## RAG/provider outage or secret exposure

- Use the grounded extractive fallback when the provider is unavailable.
- Do not accept client-provided API keys in production.
- If a key may be exposed, revoke/rotate it via the secret manager, invalidate affected sessions if required, and preserve only redacted evidence.
- Review audit logs for PII and prompt-injection indicators.

## Closure

- Document impact, timeline, root cause, remediation and validation.
- Attach redacted CI, health, migration and reconciliation evidence.
- Add a regression test or runbook correction before closing the incident.
