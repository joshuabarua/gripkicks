import { Context, Next } from "hono";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
};

type Counter = {
  count: number;
  resetAt: number;
};

const counters = new Map<string, Counter>();

const getClientIp = (c: Context) => {
  const cfIp = c.req.header("cf-connecting-ip");
  if (cfIp) return cfIp;

  const forwardedFor = c.req.header("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  const realIp = c.req.header("x-real-ip");
  return realIp || "unknown";
};

const cleanupExpiredCounters = (now: number) => {
  for (const [key, entry] of counters.entries()) {
    if (entry.resetAt <= now) counters.delete(key);
  }
};

export const createRateLimit = (options: RateLimitOptions) => {
  return async (c: Context, next: Next) => {
    if (c.req.method === "OPTIONS") {
      await next();
      return;
    }

    const now = Date.now();
    const ip = getClientIp(c);
    const key = `${options.keyPrefix}:${ip}`;

    if (Math.random() < 0.01) cleanupExpiredCounters(now);

    const existing = counters.get(key);
    const current =
      existing && existing.resetAt > now
        ? existing
        : { count: 0, resetAt: now + options.windowMs };

    current.count += 1;
    counters.set(key, current);

    const remaining = Math.max(0, options.max - current.count);
    const resetSeconds = Math.ceil((current.resetAt - now) / 1000);

    c.header("X-RateLimit-Limit", String(options.max));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(resetSeconds));

    if (current.count > options.max) {
      c.header("Retry-After", String(resetSeconds));
      return c.json(
        {
          error: "Too many requests",
          retryAfterSeconds: resetSeconds,
        },
        429,
      );
    }

    await next();
  };
};
