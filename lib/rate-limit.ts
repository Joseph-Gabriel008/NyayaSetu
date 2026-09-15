/**
 * In-memory sliding window rate limiter for API routes.
 * Tracks client IP requests in memory without external database overhead.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const ipStore = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  for (const [ip, record] of ipStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      ipStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Prevent cleanup timer from blocking Node process exit in serverless / test runners
if (cleanupTimer && typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Check if the given identifier (IP address) is rate limited.
 * Default: 25 requests per 60 seconds.
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 25,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let record = ipStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    ipStore.set(identifier, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = windowMs - (now - oldestTimestamp);
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds: Math.ceil(Math.max(1, resetMs / 1000)),
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    limit,
    remaining: limit - record.timestamps.length,
    resetSeconds: windowSeconds,
  };
}

/**
 * Extracts a client IP address from standard request headers.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
