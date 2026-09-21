/**
 * Phase 1B: SQLCipher is spike-only. Production wiring is Phase 2.
 * See docs/integrations/phase-1b-sqlcipher-spike.md.
 */
export const SQLCIPHER_INTEGRATION = {
  status: "spike_only" as const,
  nextPhase: "2" as const,
};

export function getSqlCipherPlaceholder(): typeof SQLCIPHER_INTEGRATION {
  return SQLCIPHER_INTEGRATION;
}
