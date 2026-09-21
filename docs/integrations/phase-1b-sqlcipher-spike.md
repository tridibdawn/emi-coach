# Phase 1B — OP-SQLite + SQLCipher compatibility spike

**Scope:** Prove `@op-engineering/op-sqlite` **18.2.5** with SQLCipher on React Native **0.87.1** (Yarn 4 monorepo).  
**Not in scope:** Phase 2 ledger schema, FinancialState wiring, production DEK wrapping, PIN-derived keys.

## Package selection

| Component | Version | Source |
|---|---|---|
| OP-SQLite | **18.2.5** (exact pin) | `apps/mobile/package.json` + `yarn.lock` |
| SQLCipher | **4.19.0 community** | `cpp/sqlcipher/sqlite3.c` (`CIPHER_VERSION_NUMBER`) |
| SQLite baseline (SQLCipher bundle) | **3.53.4** | `cpp/sqlcipher/sqlite3.h` (`SQLITE_VERSION`) |
| Android native module | **18.2.5** (patched) | `@op-engineering/op-sqlite` Gradle / CMake |
| iOS native module | **18.2.5** | `op-sqlite.podspec` |

Why **18.2.5:** current stable OP-SQLite release compatible with RN 0.87.1; exact pin (no `^` / `latest`).

## Configuration source (inspected from installed 18.2.5)

| Platform | Native script | Resolved `package.json` | `op-sqlite` config |
|---|---|---|---|
| iOS | `op-sqlite.podspec` | `apps/mobile/package.json` | `{ "sqlcipher": true }` |
| Android | `android/build.gradle` | `apps/mobile/package.json` | `{ "sqlcipher": true }` |

Notes:

- Monorepo root `package.json` also declares `"op-sqlite": { "sqlcipher": true }` for documentation and CI identity (`yarn op-sqlite-config`).
- Unpatched OP-SQLite 18.2.5 Android Gradle starts discovery at the package root and reads its own `package.json` (no `op-sqlite` key). A **Yarn patch** adjusts discovery to start at the package parent (mirrors the podspec) so Android reads `apps/mobile/package.json`.
- No Yarn hoisting changes were required.

## SQLite conflict scanner semantics

**Invariant:** one active native SQLite implementation at **link time**.

- **Allowed:** OP-SQLite ships both `cpp/sqlite3.c` and `cpp/sqlcipher/sqlite3.c`; with `sqlcipher: true` the native build selects SQLCipher and excludes plain SQLite. The scanner must **not** fail on those dual sources inside `@op-engineering/op-sqlite`.
- **Must fail:** independent second implementations (`expo-sqlite`, other packages compiling their own `sqlite3.c`, conflicting CocoaPods, etc.).

Run: `yarn sqlite-conflicts` (also in CI).

## Wrong-key verification (authenticated read)

SQLCipher key assignment and authenticated read are **separate**:

1. Open encrypted DB with **correct** key → migrate → insert test row → close
2. Open same file with **wrong** key (`open` may return a handle — record behavior)
3. Run `SELECT name FROM sqlite_master` → **must fail** (`SQLITE_NOTADB` / “file is encrypted or is not a database”)
4. Close handle if present
5. Reopen with **correct** key → schema + test row still present (persistence)

The authenticated-read failure is the encryption correctness gate. File-exists checks are insufficient.

## Status buckets (do not collapse)

| Status | Meaning | How to verify |
|---|---|---|
| **BUILD COMPATIBILITY** | Native compile with SQLCipher linked | Android: `yarn workspace @emi-coach/mobile android:assemble` / CI `assembleDebug`. iOS: macOS `pod install` + simulator build (see `.github/workflows/ios.yml`). |
| **RUNTIME ENCRYPTION** | Correct key reads; wrong key cannot authenticate/read | `__DEV__` spike UI — **native device/emulator only** |
| **MIGRATION** | Migration 001 + `schema_migrations` persists | Same spike UI |
| **PERSISTENCE** | Close/reopen with correct key returns test row | Same spike UI |
| **SQLITE CONFLICT CHECK** | No independent second SQLite at link time | `yarn sqlite-conflicts` |

**Phase 1B PASS** only when **all five** are **PASS**. Anything else is **incomplete**.

### Current results

Last updated: 2026-09-21 (Android CI BUILD COMPATIBILITY recorded).

| Gate | Status | Evidence source | Notes |
|---|---|---|---|
| BUILD COMPATIBILITY (Android) | **PASS** | GitHub Actions `ci / Android debug assemble (push)` | Completed successfully (~6m). Proves native compile with SQLCipher linked via `assembleDebug` only. Does **not** prove RUNTIME ENCRYPTION, MIGRATION, or PERSISTENCE. |
| BUILD COMPATIBILITY (iOS) | **FAIL** locally / **NOT RUN** in CI | Local `pod install` + `xcodebuild`; gated `ios.yml` | Local: `pod install` OK with `[OP-SQLITE] using SQLCipher`; `xcodebuild` exit 70 (`IDESimulatorFoundation` plug-in). CI: workflow requires `ENABLE_IOS_CI=true` (not enabled). Fixed command: `yarn react-native build-ios --mode Debug --extra-params "-sdk iphonesimulator"`. |
| RUNTIME ENCRYPTION | **NOT RUN** | Local `__DEV__` spike only | Requires emulator/device; see runbook below |
| MIGRATION | **NOT RUN** | Local `__DEV__` spike only | Same spike run |
| PERSISTENCE | **NOT RUN** | Local `__DEV__` spike only | Same spike run |
| SQLITE CONFLICT CHECK | **PASS** | `yarn sqlite-conflicts` | 2026-09-21 |

**Overall Phase 1B: NOT YET PASS** — RUNTIME ENCRYPTION, MIGRATION, and PERSISTENCE remain NOT RUN; iOS BUILD failed locally and CI iOS is gated. Android `assembleDebug` success does not satisfy runtime gates.

Automated JS/Python gates (lint, typecheck, tests, boundaries, privacy, `op-sqlite-config`, `sqlcipher-spike-security`, backend): **PASS** (2026-09-21; same CI check page as Android assemble). These do **not** prove SQLCipher runtime encryption.

## CI vs local evidence matrix

| What | CI can prove | Local spike required |
|---|---|---|
| Native compile (SQLCipher linked) | Android `assembleDebug`; iOS `build-ios` when `ENABLE_IOS_CI=true` | Optional local `assembleDebug` / `build-ios` |
| Wrong-key authenticated read | No | Yes — `DevSqlCipherSpikeEntry` |
| Migration 001 + `schema_migrations` | No | Yes |
| Close/reopen persistence | No | Yes |

CI must **never** claim RUNTIME ENCRYPTION PASS from `assembleDebug` or `build-ios` alone.

## Local spike runbook (RUNTIME / MIGRATION / PERSISTENCE)

### Entry points

- **Debug:** [`apps/mobile/App.tsx`](../../apps/mobile/App.tsx) renders [`DevSqlCipherSpikeEntry`](../../apps/mobile/src/dev/sqlcipher-spike/DevSqlCipherSpikeEntry.tsx) when `__DEV__ === true`.
- **Production/release:** `BootstrapScreen` only — spike UI is not bundled for production entry.
- **No** permanent test button on `BootstrapScreen`.

### Steps

1. `yarn install` (applies OP-SQLite patch)
2. Build and install on emulator/device (Android: SDK + `./gradlew assembleDebug` or `yarn workspace @emi-coach/mobile android`; iOS: repair Xcode if needed, then `cd apps/mobile && bundle install && bundle exec pod install --project-directory=ios`)
3. Start Metro: `yarn workspace @emi-coach/mobile start`
4. Launch Debug app on emulator/device
5. Tap **Run compatibility spike** on the Phase 1B SQLCipher Spike screen

### Evidence to record (copy into this table after each platform run)

| Field | Expected |
|---|---|
| `isSQLCipher()` | `true` |
| Wrong-key **open** | May return handle or throw — record exact message |
| Wrong-key **authenticated read** (`SELECT sqlite_master`) | **Must fail** — `SQLITE_NOTADB` / “file is encrypted or is not a database” |
| RUNTIME ENCRYPTION gate | PASS only if authenticated-read fails as above |
| MIGRATION gate | PASS if migration 001 recorded in `schema_migrations` |
| PERSISTENCE gate | PASS if reopen with correct key returns marker `phase1b-spike-v1` |

Update the **Current results** table above after recording. Do not mark Phase 1B PASS until all five gates are PASS on both platforms as required by ADR-004.

## CI gates (Phase 1 preserved)

- `yarn lint` / `yarn typecheck` / `yarn test:packages` / mobile Jest
- `yarn boundaries` / `yarn privacy-scan`
- `yarn sqlite-conflicts` / `yarn op-sqlite-config` / `yarn sqlcipher-spike-security`
- Backend ruff/mypy/pytest
- Android `assembleDebug` (`.github/workflows/ci.yml`) — **BUILD COMPATIBILITY only**
- iOS `build-ios` (`.github/workflows/ios.yml`, `ENABLE_IOS_CI=true` only) — **BUILD COMPATIBILITY only**; uses `yarn react-native build-ios --mode Debug --extra-params "-sdk iphonesimulator"` (RN 0.87 CLI; no `--simulator` flag)

## Security

- Spike key lives only in `testOnlyKey.fixture.ts` (TEST ONLY)
- `yarn sqlcipher-spike-security` fails on PIN-derived keys, logging, AsyncStorage/Zustand/Redux persistence, backend transmission, or hard-coded keys outside the fixture
- Production invariant unchanged: random 256-bit DEK, OS wrap, PIN is verifier only — **not implemented in Phase 1B**

## Fail path

If native compile or encryption fails: **STOP**. Do not disable SQLCipher or change RN/Gradle/Kotlin/NDK pins. Choose another New Architecture SQLCipher binding and update ADR-004. Never encrypt the SQLite file in JavaScript.
