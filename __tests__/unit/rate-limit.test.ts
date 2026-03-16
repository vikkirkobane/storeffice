import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";

// Mock rate limiter
class InMemoryStore {
  data: Map<string, { count: number; resetTime: number }> = new Map();

  async check(key: string, config: { max: number; windowMs: number }) {
    const now = Date.now();
    const record = this.data.get(key);

    if (!record || now > record.resetTime) {
      this.data.set(key, { count: 1, resetTime: now + config.windowMs });
      return { allowed: true, remaining: config.max - 1, resetAfter: config.windowMs };
    }

    if (record.count >= config.max) {
      return { allowed: false, remaining: 0, resetAfter: record.resetTime - now };
    }

    record.count += 1;
    return { allowed: true, remaining: config.max - record.count, resetAfter: record.resetTime - now };
  }
}

describe("rate-limit", () => {
  const store = new InMemoryStore();

  it("allows first request", async () => {
    const key = "test:user1";
    const result = await store.check(key, { max: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks after limit exceeded", async () => {
    const key = "test:user2";
    // Fill up limit
    for (let i = 0; i < 5; i++) {
      await store.check(key, { max: 5, windowMs: 60_000 });
    }
    const result = await store.check(key, { max: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("getRateLimitKey formats correctly", () => {
    const key = getRateLimitKey("user123", "create-intent");
    expect(key).toBe("ratelimit:create-intent:user123");
  });
});
