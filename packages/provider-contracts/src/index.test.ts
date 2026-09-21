import { describe, expect, it } from "vitest";
import {
  NullAccountAggregatorAdapter,
  NullBackendClient,
  NullCreditBureauAdapter,
  NullNotificationIngestionAdapter,
  NullSubscriptionAdapter,
} from "./index";

describe("null adapters", () => {
  it("lets the app run without AA, CIBIL, billing, backend, or Android ingestion", () => {
    expect(NullAccountAggregatorAdapter.status).toBe("not_configured");
    expect(NullCreditBureauAdapter.status).toBe("not_configured");
    expect(NullSubscriptionAdapter.plan).toBe("free");
    expect(NullBackendClient.status).toBe("not_configured");
    expect(NullNotificationIngestionAdapter.status).toBe("not_configured");
  });
});
