# Phase 1b — op-sqlite + SQLCipher compatibility spike

**Do not start this phase until Phase 1 CI is green.**

## Goal

Prove `@op-engineering/op-sqlite` with `"op-sqlite": { "sqlcipher": true }` on **this** React Native 0.87.1 Yarn 4 monorepo **before** implementing the ledger schema.

## Checklist (all required)

- [ ] React Native 0.87.1 (already pinned)
- [ ] New Architecture (`newArchEnabled=true`, already set)
- [ ] Yarn 4 + `nodeLinker: node-modules`
- [ ] `op-sqlite.sqlcipher: true` on the **repository root** `package.json`
- [ ] Android `assembleDebug` with encrypted open
- [ ] iOS simulator build with encrypted open
- [ ] Wrong key fails to open
- [ ] Right key round-trips a trivial table
- [ ] A no-op SQL migration records `schema_migrations`
- [ ] Process kill + reopen still decrypts
- [ ] DEK is random and OS-wrapped — never the user PIN

## Fail path

Stop all feature work. Choose another New Architecture SQLCipher binding. Update ADR-004. Never encrypt the SQLite file in JavaScript.

## Out of scope for 1b

Loan tables, money math, AA, CIBIL, NotificationListener.
