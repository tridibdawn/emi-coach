#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ADR = ROOT / "docs" / "architecture" / "adr"
ADR.mkdir(parents=True, exist_ok=True)

ADRS = {
    "001-local-first-ledger.md": """# ADR-001 Local-first ledger

Status: Accepted

The detailed financial ledger lives in an on-device encrypted database. The FastAPI backend stores only metadata (config, catalog, entitlements, consent session ids).

No transaction, loan balance, salary, statement, or CIBIL report body tables are allowed on PostgreSQL unless this ADR is superseded.
""",
    "002-integer-paise-money.md": """# ADR-002 Integer paise money model

Status: Accepted

INR amounts are integer paise (`MoneyMinor`). IEEE floating point is forbidden in persisted or calculated money. Formatting happens only at the UI boundary.

Not implemented in Phase 1.
""",
    "003-random-dek-os-wrapping.md": """# ADR-003 Random DEK and OS wrapping

Status: Accepted

SQLCipher uses a CSPRNG 256-bit database encryption key. The user PIN is a verifier only. The PIN must never be the SQLCipher key, SHA(PIN), or KDF(PIN). The DEK is wrapped with iOS Keychain (Secure Enclave wrapping key when available) and Android Keystore.

Not wired in Phase 1. See Phase 1b.
""",
    "004-sqlcipher-compatibility-gate.md": """# ADR-004 SQLCipher compatibility gate

Status: Accepted

`@op-engineering/op-sqlite` + SQLCipher is compatibility-gated. It must be proven on RN 0.87.1, New Architecture, Yarn 4, Android, iOS, migrations, and encrypted open/close before ledger work. Fail path: another New Architecture SQLCipher binding. Never encrypt SQLite in JavaScript.

See `docs/integrations/phase-1b-sqlcipher-spike.md`.
""",
    "005-typescript-only-calculations.md": """# ADR-005 TypeScript-only financial calculations

Status: Accepted

User-facing money math runs only in TypeScript domain packages. Python must not calculate EMI, interest, amortization, debt-free dates, balance-transfer savings, cashflow metrics, or credit-card repayment math. LLMs must not calculate money.
""",
    "006-financial-state-read-model.md": """# ADR-006 FinancialState as sole read model

Status: Accepted

`packages/financial-state` is the only read model for dashboards and planning. Screens must not import engine packages. SQLCipher stores facts; live UI recomputes `buildFinancialState`.
""",
    "007-accounting-semantics.md": """# ADR-007 Accounting semantics

Status: Accepted

Canonical kinds: expense, income, internal_transfer, debt_drawdown, debt_repayment, interest, fee, refund, reversal, cash_withdrawal.

Credit-card purchases are expenses. Credit-card bill payments are debt_repayment and must not count as a second expense.

See `docs/architecture/accounting-policy.md`.
""",
    "008-rounding-policy.md": """# ADR-008 Rounding policy

Status: Accepted

EMI Coach v1 uses monthly reducing-balance, integer paise, half-up interest, EMI rounded to the nearest rupee, final installment clears principal. This is EMI Coach’s disclosed model, not a lender guarantee.

See `docs/architecture/rounding.md`.
""",
    "009-aa-cibil-adapters.md": """# ADR-009 AA/CIBIL adapter boundary

Status: Accepted

Account Aggregator and CIBIL are null/mock adapters until a named vendor contract, official SDK/API docs, and permissions are stored in `docs/integrations/`. Do not invent provider APIs. Do not scrape bank or CIBIL websites.
""",
    "010-android-notification-listener-post-mvp.md": """# ADR-010 Android NotificationListener post-MVP

Status: Accepted

`NotificationListenerService` is not part of MVP. Default adapter is `NullNotificationIngestionAdapter`. iOS has no equivalent and must remain fully useful. No SMS permission.
""",
    "011-yarn4-rn087.md": """# ADR-011 Yarn 4 + React Native 0.87

Status: Accepted

Yarn 4 workspaces with `nodeLinker: node-modules` (no PnP). React Native is pinned to 0.87.1 via the official Community CLI. New Architecture is required. Expo is not used.
""",
    "012-redis-optional.md": """# ADR-012 Redis optional

Status: Accepted

Redis is not required for local/MVP. Production may use Redis for rate-limit, session, and catalog cache only. Redis must never store the financial ledger.
""",
    "013-store-native-billing.md": """# ADR-013 Store-native billing

Status: Accepted

Subscriptions use StoreKit 2 and Play Billing behind `SubscriptionAdapter`. Receipts are store identifiers, not the user’s bank ledger. Default adapter is null (free). Do not add RevenueCat without a privacy review.
""",
    "014-indicative-provider-catalog.md": """# ADR-014 Indicative provider catalog

Status: Accepted

Published catalog rates are `indicative` unless a provider confirms eligibility. UI must show source, effective date, and last verified date. Never claim a guaranteed offer without confirmation.
""",
}

for name, body in ADRS.items():
    (ADR / name).write_text(body)

print(f"Wrote {len(ADRS)} ADRs")
