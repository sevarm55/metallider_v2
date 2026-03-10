import { type NextRequest } from "next/server";
import { getClientIP } from "./get-client-ip";
import { apiError } from "./types/api-response";

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

export const rateLimitConfig = {
  login: { interval: 15 * 60 * 1000, uniqueTokenPerInterval: 5 },
  register: { interval: 15 * 60 * 1000, uniqueTokenPerInterval: 3 },
  "forgot-password": { interval: 15 * 60 * 1000, uniqueTokenPerInterval: 5 },
  api: { interval: 60 * 1000, uniqueTokenPerInterval: 60 },
  admin: { interval: 60 * 1000, uniqueTokenPerInterval: 30 },
} as const;

type RateLimitKey = keyof typeof rateLimitConfig;

const tokenCache = new Map<string, { count: number; expiresAt: number }>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, value] of tokenCache) {
    if (value.expiresAt < now) tokenCache.delete(key);
  }
}

function check(
  ip: string,
  options: RateLimitOptions,
): { remaining: number; reset: number } | null {
  cleanup();
  const now = Date.now();
  const key = `${ip}`;
  const entry = tokenCache.get(key);

  if (!entry || entry.expiresAt < now) {
    tokenCache.set(key, {
      count: 1,
      expiresAt: now + options.interval,
    });
    return { remaining: options.uniqueTokenPerInterval - 1, reset: now + options.interval };
  }

  entry.count++;
  if (entry.count > options.uniqueTokenPerInterval) {
    return null;
  }

  return {
    remaining: options.uniqueTokenPerInterval - entry.count,
    reset: entry.expiresAt,
  };
}

export function checkRateLimit(request: NextRequest, configKey: RateLimitKey) {
  const ip = getClientIP(request);
  const options = rateLimitConfig[configKey];
  const cacheKey = `${configKey}:${ip}`;
  const result = check(cacheKey, options);

  if (result === null) {
    return apiError(
      "Слишком много запросов. Попробуйте позже.",
      429,
      "RATE_LIMIT_EXCEEDED",
    );
  }

  return null;
}
