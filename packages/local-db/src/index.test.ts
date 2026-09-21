import { describe, expect, it } from "vitest";
import { getSqlCipherPlaceholder } from "./index";

describe("local-db", () => {
  it("does not wire SQLCipher in Phase 1", () => {
    expect(getSqlCipherPlaceholder().status).toBe("not_wired");
    expect(getSqlCipherPlaceholder().nextPhase).toBe("1b");
  });
});
