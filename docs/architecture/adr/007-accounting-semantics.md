# ADR-007 Accounting semantics

Status: Accepted

Canonical kinds: expense, income, internal_transfer, debt_drawdown, debt_repayment, interest, fee, refund, reversal, cash_withdrawal.

Credit-card purchases are expenses. Credit-card bill payments are debt_repayment and must not count as a second expense.

See `docs/architecture/accounting-policy.md`.
