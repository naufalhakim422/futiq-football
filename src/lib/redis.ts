import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

const getRedisUrl = (): string => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return "redis://localhost:6379";
};

export const redis =
  globalForRedis.redisClient ??
  new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisClient = redis;
}

/**
 * Cache helper functions
 * NOTE: Redis is strictly used for transient caching and rate-limiting.
 * PostgreSQL is the permanent relational source of truth.
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[Redis Cache Miss/Error on key "${key}"]:`, error);
    return null;
  }
}

export async function setCachedData<T>(
  key: string,
  data: T,
  ttlSeconds: number = 300
): Promise<void> {
  try {
    const serialized = JSON.stringify(data);
    await redis.setex(key, ttlSeconds, serialized);
  } catch (error) {
    console.warn(`[Redis Cache Set Error on key "${key}"]:`, error);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`[Redis Cache Invalidate Error on key "${key}"]:`, error);
  }
}

/**
 * Sliding window rate-limiting helper
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  try {
    const key = `rate_limit:${identifier}`;
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    const ttl = await redis.ttl(key);
    const resetAt = Date.now() + ttl * 1000;

    return {
      success: current <= limit,
      remaining: Math.max(0, limit - current),
      resetAt,
    };
  } catch (error) {
    // If Redis is unreachable, fail safe or allow with warning to avoid total outage
    console.error("[Rate Limit Redis Check Failed]:", error);
    return {
      success: true,
      remaining: 1,
      resetAt: Date.now() + windowSeconds * 1000,
    };
  }
}
