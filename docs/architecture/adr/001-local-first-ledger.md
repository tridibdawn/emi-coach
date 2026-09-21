# ADR-001 Local-first ledger

Status: Accepted

The detailed financial ledger lives in an on-device encrypted database. The FastAPI backend stores only metadata (config, catalog, entitlements, consent session ids).

No transaction, loan balance, salary, statement, or CIBIL report body tables are allowed on PostgreSQL unless this ADR is superseded.
