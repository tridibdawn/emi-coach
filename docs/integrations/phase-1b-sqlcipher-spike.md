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

| Gate | Status | Notes |
|---|---|---|
| BUILD COMPATIBILITY (Android) | **NOT RUN** locally (no JDK/Android SDK in agent env) | CI `assembleDebug` is the build gate; success proves compile only |
| BUILD COMPATIBILITY (iOS) | **NOT RUN** | macOS workflow (`ENABLE_IOS_CI=true`) or local `pod install` + simulator build |
| RUNTIME ENCRYPTION | **NOT RUN** | Requires emulator/device |
| MIGRATION | **NOT RUN** | Requires emulator/device |
| PERSISTENCE | **NOT RUN** | Requires emulator/device |
| SQLITE CONFLICT CHECK | **PASS** | `yarn sqlite-conflicts` |

## Native runtime how-to

1. `yarn install` (applies OP-SQLite patch)
2. Start Metro: `yarn workspace @emi-coach/mobile start`
3. Run on device/emulator: `yarn workspace @emi-coach/mobile android` or `ios`
4. In **Debug**, the app opens the **Phase 1B SQLCipher Spike** screen (`apps/mobile/src/dev/sqlcipher-spike/`)
5. Tap **Run compatibility spike** and record RUNTIME / MIGRATION / PERSISTENCE + wrong-key open vs read messages

Production/release builds do not expose the spike UI (`__DEV__` gate). No button was added to `BootstrapScreen`.

## CI gates (Phase 1 preserved)

- `yarn lint` / `yarn typecheck` / `yarn test:packages` / mobile Jest
- `yarn boundaries` / `yarn privacy-scan`
- `yarn sqlite-conflicts` / `yarn op-sqlite-config` / `yarn sqlcipher-spike-security`
- Backend ruff/mypy/pytest
- Android `assembleDebug` — **BUILD COMPATIBILITY only** (CI must not claim runtime SQLCipher PASS from assemble)

## Security

- Spike key lives only in `testOnlyKey.fixture.ts` (TEST ONLY)
- `yarn sqlcipher-spike-security` fails on PIN-derived keys, logging, AsyncStorage/Zustand/Redux persistence, backend transmission, or hard-coded keys outside the fixture
- Production invariant unchanged: random 256-bit DEK, OS wrap, PIN is verifier only — **not implemented in Phase 1B**

## Fail path

If native compile or encryption fails: **STOP**. Do not disable SQLCipher or change RN/Gradle/Kotlin/NDK pins. Choose another New Architecture SQLCipher binding and update ADR-004. Never encrypt the SQLite file in JavaScript.
