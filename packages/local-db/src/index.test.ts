import { describe, expect, it } from "vitest";
import { getSqlCipherPlaceholder } from "./index";

describe("local-db", () => {
  it("keeps SQLCipher spike-only until Phase 2 wiring", () => {
    expect(getSqlCipherPlaceholder().status).toBe("spike_only");
    expect(getSqlCipherPlaceholder().nextPhase).toBe("2");
  });
});
