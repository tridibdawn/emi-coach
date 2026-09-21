import { describe, expect, it } from "vitest";
import { ALLOWED_EVENTS } from "./index";

describe("analytics allowlist", () => {
  it("contains only non-financial event names", () => {
    expect(ALLOWED_EVENTS).toContain("app_opened");
    expect(ALLOWED_EVENTS.some((name) => name.includes("amount"))).toBe(false);
  });
});
