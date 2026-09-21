/** Null adapters so the app runs without AA, CIBIL, billing, or backend. */
export type AdapterStatus = "not_configured";

export const NullAccountAggregatorAdapter = {
  status: "not_configured" as const,
} as const;

export const NullCreditBureauAdapter = {
  status: "not_configured" as const,
} as const;

export const NullProductCatalogAdapter = {
  status: "not_configured" as const,
} as const;

export const NullSubscriptionAdapter = {
  status: "not_configured" as const,
  plan: "free" as const,
} as const;

export const NullBackendClient = {
  status: "not_configured" as const,
} as const;

export const NullNotificationIngestionAdapter = {
  status: "not_configured" as const,
  platformRequired: false,
} as const;
