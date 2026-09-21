import { PACKAGE_NAME as AMORT } from "@emi-coach/amortization-engine";
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
