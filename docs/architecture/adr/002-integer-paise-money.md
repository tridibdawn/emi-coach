# ADR-002 Integer paise money model

Status: Accepted

INR amounts are integer paise (`MoneyMinor`). IEEE floating point is forbidden in persisted or calculated money. Formatting happens only at the UI boundary.

Not implemented in Phase 1.
