# ADR-004: SQLCipher compatibility gate (Phase 1B)

## Status

Accepted — **Phase 1B implementation complete; Android native runtime gates PASS (Pixel_10 Debug spike); iOS native runtime gates NOT RUN; CI does not execute runtime gates**.

## Context

EMI Coach stores sensitive financial data in an on-device SQLCipher database. Before Phase 2 ledger work, we must prove the chosen binding compiles and encrypts correctly on our pinned stack:

- React Native **0.87.1**, New Architecture, Hermes
- Yarn **4.10.3**, `nodeLinker: node-modules`
- Android: Gradle **9.4.1**, Kotlin **2.2.0**, compileSdk **37**, NDK **27.1.12297006**, JDK **17**
- iOS: CocoaPods via `op-sqlite.podspec`

## Decision

Use **`@op-engineering/op-sqlite` 18.2.5** (exact pin) with root and app-level `"op-sqlite": { "sqlcipher": true }`.

### Why 18.2.5

Current stable OP-SQLite release for RN 0.87.x. Locked in `apps/mobile/package.json` and `yarn.lock` (`yarn why @op-engineering/op-sqlite` → 18.2.5 only).

### Inspected native versions (from installed package)

| Artifact | Version |
|---|---|
| OP-SQLite npm | 18.2.5 |
| SQLCipher (bundled) | 4.19.0 community |
| SQLite baseline in SQLCipher amalgamation | 3.53.4 |
| Android module | 18.2.5 (+ Yarn patch for config discovery) |
| iOS pod | 18.2.5 |

### Configuration discovery

- **iOS (`op-sqlite.podspec`):** walks up from `@op-engineering/op-sqlite` parent → first `package.json` = **`apps/mobile/package.json`**
- **Android (`android/build.gradle`):** unpatched 18.2.5 reads the package’s own `package.json` (no `op-sqlite` key). **Yarn patch** aligns traversal with the podspec so Android also reads **`apps/mobile/package.json`**
- **Monorepo root** `package.json` duplicates the same `op-sqlite` object; CI `yarn op-sqlite-config` enforces semantic identity

No hoisting changes were made.

### Phase 1B spike (TEST ONLY)

Isolated code under `apps/mobile/src/dev/sqlcipher-spike/`:

- `TestDatabaseKeyProvider` + fixture key (not PIN-derived)
- Migration 001 `sqlcipher_compatibility_test` + `schema_migrations`
- Wrong-key **authenticated-read** gate (`SELECT sqlite_master` must fail)
- `DevSqlCipherSpikeEntry` — `__DEV__` only; no `BootstrapScreen` button

`packages/local-db` status: `spike_only`, `nextPhase: 2` (does not import op-sqlite).

### Link-time SQLite policy

One active native SQLite at link time = OP-SQLite + SQLCipher. Scanner (`yarn sqlite-conflicts`) ignores OP-SQLite’s mutually exclusive `cpp/sqlite3.c` + `cpp/sqlcipher/sqlite3.c` sources; fails on independent second implementations.

## Gate matrix

| Gate | CI / local | Current (2026-09-24) |
|---|---|---|
| BUILD COMPATIBILITY (Android) | CI `assembleDebug` (`.github/workflows/ci.yml`) | **PASS** — GitHub Actions `ci / Android debug assemble (push)` completed successfully. `assembleDebug` does not prove RUNTIME ENCRYPTION, MIGRATION, or PERSISTENCE. |
| BUILD COMPATIBILITY (iOS) | Gated `ios.yml` when `ENABLE_IOS_CI=true`; `build-ios --mode Debug --extra-params "-sdk iphonesimulator"` | Local FAIL (`xcodebuild` plug-in); CI NOT RUN (`ENABLE_IOS_CI` not enabled) |
| RUNTIME ENCRYPTION (Android) | Local `__DEV__` spike on emulator/device | **PASS** — Pixel_10 emulator Android Debug spike; `isSQLCipher()` true; wrong-key authenticated read failed (`[op-sqlite] sqlite query error: file is not a database`) |
| MIGRATION (Android) | Same Android spike run | **PASS** — migration 001 version 1 (`sqlcipher_compatibility_test`) in `schema_migrations` |
| PERSISTENCE (Android) | Same Android spike run | **PASS** — correct-key reopen; marker `phase1b-spike-v1` |
| SQLITE CONFLICT CHECK | `yarn sqlite-conflicts` | PASS |

**Overall Phase 1B: NOT YET PASS.** iOS native runtime evidence is still outstanding. Android RUNTIME ENCRYPTION, MIGRATION, and PERSISTENCE are proven by the Pixel_10 local spike, not by `assembleDebug`.

**Phase 1B PASS** requires all five runtime/build/conflict gates PASS. CI **must not** treat `assembleDebug` or `build-ios` alone as RUNTIME ENCRYPTION / MIGRATION / PERSISTENCE PASS.

### CI vs local spike

- **CI proves:** native compile with SQLCipher linked (Android always; iOS when `ENABLE_IOS_CI=true`).
- **Local spike proves:** wrong-key authenticated-read failure, migration 001, close/reopen persistence — see `docs/integrations/phase-1b-sqlcipher-spike.md` runbook.

## Consequences

- Phase 2 may proceed only after native runtime gates are PASS on Android and iOS
- Production DEK wrapping (OS keystore / Secure Enclave) remains Phase 2+
- Fail path: alternate New Architecture SQLCipher binding; never JS-side file encryption

## References

- `docs/integrations/phase-1b-sqlcipher-spike.md`
- `apps/mobile/src/dev/sqlcipher-spike/`
- `scripts/scan-sqlite-conflicts.mjs`
- `.yarn/patches/@op-engineering-op-sqlite-npm-18.2.5-*.patch`
