# ADR-003 Random DEK and OS wrapping

Status: Accepted

SQLCipher uses a CSPRNG 256-bit database encryption key. The user PIN is a verifier only. The PIN must never be the SQLCipher key, SHA(PIN), or KDF(PIN). The DEK is wrapped with iOS Keychain (Secure Enclave wrapping key when available) and Android Keystore.

Not wired in Phase 1. See Phase 1b.
