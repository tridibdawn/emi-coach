# ADR-005 TypeScript-only financial calculations

Status: Accepted

User-facing money math runs only in TypeScript domain packages. Python must not calculate EMI, interest, amortization, debt-free dates, balance-transfer savings, cashflow metrics, or credit-card repayment math. LLMs must not calculate money.
