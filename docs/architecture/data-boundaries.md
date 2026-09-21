# Data boundaries

## On device (default)

Accounts, loans, payments, credit cards, statements, the transaction ledger, recurring/income profiles, cash-flow and debt scenarios, documents, consent copies, derived analytics.

## Backend allowed

Opaque user/device identity, sessions, app config, published catalog, subscription store identifiers, minimum AA/CIBIL **session** metadata if a verified contract requires it, redacted diagnostics.

## Forbidden on the backend

See `docs/privacy/forbidden-fields.yml`.

Also forbidden: raw transaction history, salary amounts, loan balances, statement files, CIBIL report bodies, bank passwords, UPI/ATM/debit PINs, CVV, full PAN, unmasked account numbers.

## Exceptions

If a future Account Aggregator FIU contract requires a transient FI payload on the server, an architecture amendment and TTL are mandatory. Until then those routes are not implemented.
