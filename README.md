# EMI Coach

Privacy-first Indian personal-finance mobile app. Track loans, EMIs, cards, accounts, and cash flow **on the device**. The backend is metadata-only.

This repository is at **Phase 1: infrastructure bootstrap**. Financial engines, SQLCipher, AA, CIBIL, billing, and Android notification ingestion are **not** implemented.

## Architecture principles

- Local-first encrypted ledger (SQLCipher is gated to Phase 1b)
- Deterministic TypeScript money math — never Python, never an LLM
- `FinancialState` is the only dashboard/planning read model
- Screens must not import engine packages
- Provider integrations are null adapters until contracts are verified
- No bank passwords, UPI PINs, ATM PINs, CVVs, or full PAN

See `docs/architecture/system-architecture.md` and `docs/architecture/adr/`.

## Repository structure

```
apps/mobile      React Native 0.87.1 CLI app (New Architecture)
packages/*       TypeScript domain, persistence, adapters, UI stubs
native/          Future Kotlin/Swift TurboModules
backend/         FastAPI health/ready + PostgreSQL config
docs/            Architecture, privacy, integrations
```

## Pinned toolchain

- Node >= 22.13
- Yarn 4.10.3 (`nodeLinker: node-modules`, no PnP)
- React Native **0.87.1** (not `latest`)
- Kotlin 2.2.0 / compileSdk 37 / buildTools 37.0.0 (from the RN 0.87 template)
- JDK 17 for Android Gradle
- Python >= 3.12 for the backend

Do not bump these just because newer versions exist.

## Development commands

```bash
corepack enable
yarn install
yarn lint
yarn typecheck
yarn test:packages
yarn workspace @emi-coach/mobile test --watchAll=false
yarn boundaries
yarn privacy-scan
```

## CI gate (GitHub Actions)

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

| Job | Checks |
|-----|--------|
| TypeScript | lint, typecheck, package tests (Vitest), mobile Jest, dependency boundaries |
| Privacy | forbidden-field scan (TS + Python) |
| Backend | ruff, mypy, pytest |
| Android | `assembleDebug` with pinned SDK components |

Pinned in CI: Node **22.13**, Yarn **4.10.3**, React Native **0.87.1**, JDK **17**.

### Android

Requires JDK 17 and a local Android SDK (`ANDROID_HOME` or `apps/mobile/android/local.properties`).

CI preinstalls and verifies the SDK components pinned in `apps/mobile/android/build.gradle`:

- `platforms/android-37` (installs `platforms;android-37.0` and symlinks `android-37` when Google publishes only the minor package)
- `build-tools/37.0.0`
- `ndk/27.1.12297006`
- `platform-tools`

AGP may auto-download missing SDK packages when licenses are accepted; CI still preinstalls and asserts these paths so runner-image drift cannot pass unnoticed. CI scripts: `scripts/ci-install-android-sdk.sh`, `scripts/ci-verify-android-sdk.sh`.

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
yarn android:assemble
# or: yarn workspace @emi-coach/mobile android
```

### iOS (macOS required)

```bash
cd apps/mobile/ios
bundle install
bundle exec pod install
cd ..
yarn ios
```

Xcodebuild:

```bash
cd apps/mobile
xcodebuild -workspace ios/EmiCoach.xcworkspace -scheme EmiCoach \
  -configuration Debug -sdk iphonesimulator
```

`EmiCoach.xcworkspace` exists only after `pod install`. GitHub iOS CI is disabled until `ENABLE_IOS_CI=true` because it needs macOS runners.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --app-dir .
# GET http://127.0.0.1:8000/health
```

Optional Postgres: `docker compose up -d postgres` then set `SKIP_DB_CHECK=false`.

## Architecture gate

Do not implement loan/EMI features until:

1. Phase 1 checks in this README are green
2. Phase 1b SQLCipher compatibility spike passes (`docs/integrations/phase-1b-sqlcipher-spike.md`)

## Next allowed phase

**Phase 1b — op-sqlite + SQLCipher compatibility gate**

Not automatic. Do not implement amortization, ledgers, AA, or CIBIL next.
