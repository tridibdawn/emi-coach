# Security

- Detailed financial records stay on device by default.
- Never collect bank passwords, UPI PINs, debit/ATM PINs, CVV, or full PAN.
- Never log sensitive financial payloads.
- SQLCipher DEK (Phase 1b+) is random and OS-wrapped; the app PIN is not the database key.
- Report issues privately to the project maintainers. Do not file public issues that include financial data.
