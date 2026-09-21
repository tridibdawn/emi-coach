# Package dependency rules

Enforced by `.dependency-cruiser.cjs` in CI.

- `types` → no other workspace packages, no React Native
- `finance-core` → `types` only
- financial engines → `types` + `finance-core` only (debt-coach may also use amortization-engine)
- `financial-state` → engines + `types` / `finance-core` only
- `local-db` → `types` only
- `provider-contracts` → `types` only (Phase 1)
- mobile screens → `financial-state`, `local-db` writes, UI/navigation. **Must not** import engine packages
- backend → must not import TypeScript financial packages or `local-db`

Engines must not depend on React Native, network clients, backend, or LLM SDKs.
