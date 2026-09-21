# ADR-012 Redis optional

Status: Accepted

Redis is not required for local/MVP. Production may use Redis for rate-limit, session, and catalog cache only. Redis must never store the financial ledger.
