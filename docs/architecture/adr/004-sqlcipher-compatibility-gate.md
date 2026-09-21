# ADR-004 SQLCipher compatibility gate

Status: Accepted

`@op-engineering/op-sqlite` + SQLCipher is compatibility-gated. It must be proven on RN 0.87.1, New Architecture, Yarn 4, Android, iOS, migrations, and encrypted open/close before ledger work. Fail path: another New Architecture SQLCipher binding. Never encrypt SQLite in JavaScript.

See `docs/integrations/phase-1b-sqlcipher-spike.md`.
