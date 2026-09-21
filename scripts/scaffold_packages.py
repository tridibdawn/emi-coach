#!/usr/bin/env python3
"""Phase 1 package scaffold. No financial calculations."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGES = ROOT / "packages"

STUBS = {
    "types": {
        "deps": {},
        "index": '''/** Phase 1 placeholder. No domain money types yet. */
export const PACKAGE_NAME = "@emi-coach/types" as const;
''',
    },
    "finance-core": {
        "deps": {"@emi-coach/types": "workspace:*"},
        "index": '''import { PACKAGE_NAME as TYPES } from "@emi-coach/types";

/** Phase 1 placeholder. No financial entities yet. */
export const PACKAGE_NAME = "@emi-coach/finance-core" as const;
export const dependsOnTypes = TYPES;
''',
    },
    "amortization-engine": {
        "deps": {
            "@emi-coach/types": "workspace:*",
            "@emi-coach/finance-core": "workspace:*",
        },
        "index": '''/** Phase 1 placeholder. Amortization is not implemented. */
export const PACKAGE_NAME = "@emi-coach/amortization-engine" as const;
''',
    },
    "transaction-engine": {
        "deps": {
            "@emi-coach/types": "workspace:*",
            "@emi-coach/finance-core": "workspace:*",
        },
        "index": '''/** Phase 1 placeholder. Transaction classification is not implemented. */
export const PACKAGE_NAME = "@emi-coach/transaction-engine" as const;
''',
    },
    "cashflow-engine": {
        "deps": {
            "@emi-coach/types": "workspace:*",
            "@emi-coach/finance-core": "workspace:*",
        },
        "index": '''/** Phase 1 placeholder. Cash-flow forecasting is not implemented. */
export const PACKAGE_NAME = "@emi-coach/cashflow-engine" as const;
''',
    },
    "debt-coach-engine": {
        "deps": {
            "@emi-coach/types": "workspace:*",
            "@emi-coach/finance-core": "workspace:*",
            "@emi-coach/amortization-engine": "workspace:*",
        },
        "index": '''/** Phase 1 placeholder. Debt Escape is not implemented. */
export const PACKAGE_NAME = "@emi-coach/debt-coach-engine" as const;
''',
    },
    "credit-engine": {
        "deps": {
            "@emi-coach/types": "workspace:*",
            "@emi-coach/finance-core": "workspace:*",
        },
        "index": '''/** Phase 1 placeholder. Credit-card EMI math is not implemented. */
export const PACKAGE_NAME = "@emi-coach/credit-engine" as const;
''',
    },
    "financial-state": {
        "deps": {
            "@emi-coach/types": "workspace:*",
            "@emi-coach/finance-core": "workspace:*",
            "@emi-coach/amortization-engine": "workspace:*",
            "@emi-coach/transaction-engine": "workspace:*",
            "@emi-coach/cashflow-engine": "workspace:*",
            "@emi-coach/debt-coach-engine": "workspace:*",
            "@emi-coach/credit-engine": "workspace:*",
        },
        "index": '''import { PACKAGE_NAME as AMORT } from "@emi-coach/amortization-engine";
import { PACKAGE_NAME as CASH } from "@emi-coach/cashflow-engine";
import { PACKAGE_NAME as CREDIT } from "@emi-coach/credit-engine";
import { PACKAGE_NAME as DEBT } from "@emi-coach/debt-coach-engine";
import { PACKAGE_NAME as TXN } from "@emi-coach/transaction-engine";

/**
 * Sole dashboard/planning read model. Phase 1 returns an empty placeholder.
 * No money math is performed here yet.
 */
export type FinancialState = {
  ready: false;
  reason: "phase-1-placeholder";
  engines: readonly string[];
};

export function buildFinancialState(): FinancialState {
  return {
    ready: false,
    reason: "phase-1-placeholder",
    engines: [AMORT, TXN, CASH, DEBT, CREDIT],
  };
}
''',
    },
    "provider-contracts": {
        "deps": {"@emi-coach/types": "workspace:*"},
        "index": '''/** Null adapters so the app runs without AA, CIBIL, billing, or backend. */
export type AdapterStatus = "not_configured";

export const NullAccountAggregatorAdapter = {
  status: "not_configured" as const,
} as const;

export const NullCreditBureauAdapter = {
  status: "not_configured" as const,
} as const;

export const NullProductCatalogAdapter = {
  status: "not_configured" as const,
} as const;

export const NullSubscriptionAdapter = {
  status: "not_configured" as const,
  plan: "free" as const,
} as const;

export const NullBackendClient = {
  status: "not_configured" as const,
} as const;

export const NullNotificationIngestionAdapter = {
  status: "not_configured" as const,
  platformRequired: false,
} as const;
''',
    },
    "local-db": {
        "deps": {"@emi-coach/types": "workspace:*"},
        "index": '''/**
 * Phase 1: SQLCipher is NOT wired. See docs/integrations/phase-1b-sqlcipher-spike.md.
 */
export const SQLCIPHER_INTEGRATION = {
  status: "not_wired" as const,
  nextPhase: "1b" as const,
};

export function getSqlCipherPlaceholder(): typeof SQLCIPHER_INTEGRATION {
  return SQLCIPHER_INTEGRATION;
}
''',
    },
    "secure-storage": {
        "deps": {"@emi-coach/types": "workspace:*"},
        "index": '''/** Phase 1 placeholder. Key wrapping is implemented in a later phase. */
export const PACKAGE_NAME = "@emi-coach/secure-storage" as const;
''',
    },
    "notifications": {
        "deps": {"@emi-coach/types": "workspace:*"},
        "index": '''/** Phase 1 placeholder. Local reminders are not implemented. */
export const PACKAGE_NAME = "@emi-coach/notifications" as const;
''',
    },
    "analytics": {
        "deps": {"@emi-coach/types": "workspace:*"},
        "index": '''export const ALLOWED_EVENTS = [
  "app_opened",
  "loan_created",
  "loan_calculation_completed",
  "scenario_created",
  "statement_import_started",
  "statement_import_completed",
  "reminder_created",
  "premium_viewed",
  "subscription_started",
] as const;

export type AllowedEventName = (typeof ALLOWED_EVENTS)[number];
''',
    },
    "contracts": {
        "deps": {},
        "index": '''/** OpenAPI/JSON Schema for backend metadata. No ledger contracts. */
export const API_PREFIX = "/v1" as const;
''',
    },
    "ui": {
        "deps": {"@emi-coach/types": "workspace:*"},
        "index": '''/** Phase 1 placeholder. No design-system components yet. */
export const PACKAGE_NAME = "@emi-coach/ui" as const;
''',
    },
}


def pkg_json(name: str, deps: dict) -> str:
    dep_block = ""
    if deps:
        inner = ",\n".join(f'    "{k}": "{v}"' for k, v in deps.items())
        dep_block = f',\n  "dependencies": {{\n{inner}\n  }}'
    return f'''{{
  "name": "@emi-coach/{name}",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {{
    ".": "./src/index.ts"
  }},
  "scripts": {{
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --config ../../vitest.config.ts"
  }}{dep_block}
}}
'''


TSCONFIG = '''{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "rootDir": "src",
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
'''


def test_src(name: str, extra: str) -> str:
    return f'''import {{ describe, expect, it }} from "vitest";
{extra}

describe("{name}", () => {{
  it("loads the Phase 1 placeholder without financial calculations", () => {{
    expect(true).toBe(true);
  }});
}});
'''


def main() -> None:
    PACKAGES.mkdir(exist_ok=True)
    for name, spec in STUBS.items():
        src = PACKAGES / name / "src"
        src.mkdir(parents=True, exist_ok=True)
        (PACKAGES / name / "package.json").write_text(pkg_json(name, spec["deps"]))
        (PACKAGES / name / "tsconfig.json").write_text(TSCONFIG)
        (src / "index.ts").write_text(spec["index"])
        if name == "financial-state":
            extra = 'import { buildFinancialState } from "./index";\n'
            body = '''
describe("financial-state", () => {
  it("returns a non-ready placeholder", () => {
    const state = buildFinancialState();
    expect(state.ready).toBe(false);
    expect(state.reason).toBe("phase-1-placeholder");
  });
});
'''
            (src / "index.test.ts").write_text(
                'import { describe, expect, it } from "vitest";\n' + extra + body
            )
        elif name == "local-db":
            (src / "index.test.ts").write_text(
                '''import { describe, expect, it } from "vitest";
import { getSqlCipherPlaceholder } from "./index";

describe("local-db", () => {
  it("does not wire SQLCipher in Phase 1", () => {
    expect(getSqlCipherPlaceholder().status).toBe("not_wired");
    expect(getSqlCipherPlaceholder().nextPhase).toBe("1b");
  });
});
'''
            )
        elif name == "provider-contracts":
            (src / "index.test.ts").write_text(
                '''import { describe, expect, it } from "vitest";
import {
  NullAccountAggregatorAdapter,
  NullBackendClient,
  NullCreditBureauAdapter,
  NullNotificationIngestionAdapter,
  NullSubscriptionAdapter,
} from "./index";

describe("null adapters", () => {
  it("lets the app run without AA, CIBIL, billing, backend, or Android ingestion", () => {
    expect(NullAccountAggregatorAdapter.status).toBe("not_configured");
    expect(NullCreditBureauAdapter.status).toBe("not_configured");
    expect(NullSubscriptionAdapter.plan).toBe("free");
    expect(NullBackendClient.status).toBe("not_configured");
    expect(NullNotificationIngestionAdapter.status).toBe("not_configured");
  });
});
'''
            )
        elif name == "analytics":
            (src / "index.test.ts").write_text(
                '''import { describe, expect, it } from "vitest";
import { ALLOWED_EVENTS } from "./index";

describe("analytics allowlist", () => {
  it("contains only non-financial event names", () => {
    expect(ALLOWED_EVENTS).toContain("app_opened");
    expect(ALLOWED_EVENTS.join(" ")).not.toMatch(/salary|cvv|upi_pin/i);
  });
});
'''
            )
        else:
            extra = f'import {{ PACKAGE_NAME }} from "./index";\n' if "PACKAGE_NAME" in spec["index"] else ""
            assertion = (
                f'    expect(PACKAGE_NAME).toBe("@emi-coach/{name}");\n'
                if extra
                else "    expect(true).toBe(true);\n"
            )
            (src / "index.test.ts").write_text(
                f'''import {{ describe, expect, it }} from "vitest";
{extra}
describe("{name}", () => {{
  it("loads the Phase 1 placeholder without financial calculations", () => {{
{assertion}  }});
}});
'''
            )
    print(f"Wrote {len(STUBS)} packages")


if __name__ == "__main__":
    main()
