import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index";

describe("transaction-engine", () => {
  it("loads the Phase 1 placeholder without financial calculations", () => {
    expect(PACKAGE_NAME).toBe("@emi-coach/transaction-engine");
  });
});
