# Accounting policy

Status: Accepted (ADR-007). **Not implemented in Phase 1.**

Spending totals include only `expense` (and `fee` when it is a cost). Income totals include only `income`.

- **Expense:** outflow that consumes wealth, including credit-card purchases. Counts once.
- **Income:** wealth-increasing inflow. Not a loan disbursement.
- **Internal transfer:** movement between own accounts; `transferGroupId` links legs; neither spend nor income.
- **Credit-card purchase:** `expense` on the card. Does not wait for the bill.
- **Credit-card bill payment:** bank debit `kind = debt_repayment`. Never a second expense. Fixture name: `card_purchase_then_payment_is_not_two_expenses`.
- **Loan disbursement:** `debt_drawdown`. Bank credit is not income.
- **Loan repayment / EMI:** `debt_repayment`. Principal/interest split from the amortization engine at apply-time. Default: split columns on the payment row.
- **Interest:** shown in the payment split and interest-burden reports; not grocery-style spend.
- **Fees:** `fee` (processing, ATM, prepayment). Total cost; not a transfer.
- **Refund:** `refund` linked to original; nets against expense; not income.
- **Reversal:** `reversal` linked to original; nets out; not income.
- **Cash withdrawal:** `cash_withdrawal`. ATM amount is not expense; ATM fee is `fee`.

User override wins. Silent kind changes are forbidden.
