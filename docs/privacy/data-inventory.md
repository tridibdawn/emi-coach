# Data inventory (Phase 1)

Phase 1 persists **no** financial SQLite schema and **no** PostgreSQL ledger.

## Planned device entities (SQLCipher, later phases)

See the classification matrix in `docs/architecture/system-architecture.md` section 26.11.

Every new persisted field must declare: sensitivity, source, retention, device/server boundary, encryption, deletion behavior.

## Phase 1 server

No tables. Health/ready only. `Base` metadata is empty.

## Never stored

Bank password, net-banking password, UPI PIN, debit PIN, ATM PIN, CVV, card PIN, full PAN, unmasked account number, CIBIL report on the server, raw FI ledger on the server.
