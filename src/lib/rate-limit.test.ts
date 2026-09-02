import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { consumeRateLimit } from "./rate-limit";

describe("consumeRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows calls up to the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      expect(consumeRateLimit(key, { windowMs: 1000, max: 3 }).allowed).toBe(true);
    }
  });

  it("blocks calls once the limit is reached within the window", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      consumeRateLimit(key, { windowMs: 60_000, max: 3 });
    }
    const result = consumeRateLimit(key, { windowMs: 60_000, max: 3 });
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("allows calls again once the window expires", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      consumeRateLimit(key, { windowMs: 1000, max: 3 });
    }
    expect(consumeRateLimit(key, { windowMs: 1000, max: 3 }).allowed).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(consumeRateLimit(key, { windowMs: 1000, max: 3 }).allowed).toBe(true);
  });

  it("tracks independent keys separately", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      consumeRateLimit(keyA, { windowMs: 60_000, max: 3 });
    }
    expect(consumeRateLimit(keyA, { windowMs: 60_000, max: 3 }).allowed).toBe(false);
    expect(consumeRateLimit(keyB, { windowMs: 60_000, max: 3 }).allowed).toBe(true);
  });
});
