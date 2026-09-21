export const ALLOWED_EVENTS = [
  "app_opened",
  "loan_created",
  "loan_calculation_completed",
  "scenario_created",
  "statement_import_started",
  "statement_import_completed",
  "reminder_created",
  "premium_viewed",
  "subscription_started",
] as const;

export type AllowedEventName = (typeof ALLOWED_EVENTS)[number];
