import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

interface RateLimitConfig {
  max: number;        // max requests
  windowMs: number;   // time window in ms
}

/**
 * In-memory fallback if Redis not available
 */
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  async check(key: string, config: RateLimitConfig): Promise<{ allowed: boolean; remaining: number; resetAfter: number }> {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + config.windowMs });
      return { allowed: true, remaining: config.max - 1, resetAfter: config.windowMs };
    }

    if (record.count >= config.max) {
      return { allowed: false, remaining: 0, resetAfter: record.resetTime - now };
    }

    record.count += 1;
    return { allowed: true, remaining: config.max - record.count, resetAfter: record.resetTime - now };
  }
}

const limiter = redis ? { check: async (key: string, config: RateLimitConfig) => {
  // Use Redis if available
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.pexpire(key, config.windowMs);
  }
  const remaining = Math.max(0, config.max - current);
  const allowed = current <= config.max;
  const ttl = await redis.pttl(key);
  return { allowed, remaining, resetAfter: ttl > 0 ? ttl : config.windowMs };
} } : new InMemoryRateLimiter();

/**
 * Create a rate limit key
 */
export function getRateLimitKey(identifier: string, purpose: string): string {
  return `ratelimit:${purpose}:${identifier}`;
}

/**
 * Middleware to enforce rate limits
 */
export async function rateLimit(key: string, max: number, windowMs: number) {
  return await limiter.check(key, { max, windowMs });
}

/**
 * Helper to get client IP (with proxy support)
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return request.ip || "unknown";
}
