import { describe, expect, it } from "vitest";
import { buildFinancialState } from "./index";

describe("financial-state", () => {
  it("returns a non-ready placeholder", () => {
    const state = buildFinancialState();
    expect(state.ready).toBe(false);
    expect(state.reason).toBe("phase-1-placeholder");
  });
});
