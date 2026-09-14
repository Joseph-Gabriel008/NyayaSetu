import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("In-Memory Sliding Window Rate Limiter", () => {
  it("permits requests within configured threshold", () => {
    const testIp = `test-ip-${Date.now()}`;
    const result1 = checkRateLimit(testIp, 5, 60);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(4);

    const result2 = checkRateLimit(testIp, 5, 60);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(3);
  });

  it("blocks requests once rate limit threshold is reached", () => {
    const testIp = `test-block-ip-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(testIp, 3, 60);
    }
    const blocked = checkRateLimit(testIp, 3, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetSeconds).toBeGreaterThan(0);
  });
});
