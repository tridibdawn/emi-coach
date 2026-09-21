# Rounding specification (EMI Coach v1)

Status: Accepted (ADR-008). **Not implemented in Phase 1.**

INR, monthly reducing-balance, end-of-period payments. This is EMI Coach’s disclosed model, not a claim about every lender.

- Integer paise only. No IEEE float in calculations.
- `annualRateBps` integer (8.50% = 850).
- Monthly interest, round half-up to paise:

`interestMinor = floor((outstandingMinor * annualRateBps + 60000) / 120000)`

- EMI: BigInt scale 10^12 closed-form `P * r * (1+r)^n / ((1+r)^n - 1)`, then round half-up to the **nearest rupee** (100 paise). Disclose that rounding.
- Normal installment: `principalMinor = emiMinor - interestMinor`.
- Final installment: `paymentMinor = outstandingMinor + interestMinor`; closing balance 0; may differ from EMI.
- If a non-final period has `interestMinor >= emiMinor`, reject terms. No silent negative amortization in v1.
- Zero-interest: EMI = round half-up `P/n` to rupee; last payment absorbs residual.
- Fees: half-up to paise; not capitalized unless flagged.
- Prepayment: reduces outstanding after the current-period interest rule; never increases principal.
- Rate change: rebuild future schedule only; past payments are immutable.
- Display formatting must not re-round engine output.

Golden tests must encode these identities before amortization UI exists.
