/**
 * Phase 1: SQLCipher is NOT wired. See docs/integrations/phase-1b-sqlcipher-spike.md.
 */
export const SQLCIPHER_INTEGRATION = {
  status: "not_wired" as const,
  nextPhase: "1b" as const,
};

export function getSqlCipherPlaceholder(): typeof SQLCIPHER_INTEGRATION {
  return SQLCIPHER_INTEGRATION;
}
