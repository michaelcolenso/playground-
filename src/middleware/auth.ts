import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface ApiKey {
  key: string;
  name: string;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  createdAt: Date;
  requestCount: number;
}

export interface UsageRecord {
  timestamp: Date;
  endpoint: string;
  apiKey: string;
  responseTime: number;
}

// In-memory store — swap for Redis/Postgres in production
const apiKeys = new Map<string, ApiKey>();
const usageLog: UsageRecord[] = [];

// Tier limits (requests per day)
const TIER_LIMITS: Record<string, number> = {
  free: 100,
  starter: 5000,
  pro: 50000,
  enterprise: 500000,
  anonymous: 20, // No API key
};

// Seed a demo key
const DEMO_KEY = 'og_demo_key_12345';
apiKeys.set(DEMO_KEY, {
  key: DEMO_KEY,
  name: 'Demo Key',
  tier: 'free',
  createdAt: new Date(),
  requestCount: 0,
});

export function createApiKey(name: string, tier: ApiKey['tier'] = 'free'): ApiKey {
  const key = `og_${tier}_${uuidv4().replace(/-/g, '').slice(0, 24)}`;
  const apiKey: ApiKey = {
    key,
    name,
    tier,
    createdAt: new Date(),
    requestCount: 0,
  };
  apiKeys.set(key, apiKey);
  return apiKey;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  const key =
    (req.headers['x-api-key'] as string) ??
    (req.query['api_key'] as string) ??
    null;

  const tier = key ? apiKeys.get(key)?.tier : undefined;

  if (key && !tier) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  const effectiveTier = tier ?? 'anonymous';
  const limit = TIER_LIMITS[effectiveTier];

  // Check rate limit (simplified daily counter)
  if (key) {
    const apiKeyRecord = apiKeys.get(key)!;
    const todayUsage = getDailyUsage(key);
    if (todayUsage >= limit) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        limit,
        tier: effectiveTier,
        resetAt: getNextReset(),
      });
      return;
    }
    apiKeyRecord.requestCount++;
  }

  // Attach info to request
  (req as any).apiKey = key;
  (req as any).tier = effectiveTier;
  (req as any).rateLimit = {
    limit,
    remaining: limit - getDailyUsage(key ?? 'anon') - 1,
    resetAt: getNextReset(),
  };

  // Log usage on response finish
  res.on('finish', () => {
    usageLog.push({
      timestamp: new Date(),
      endpoint: req.path,
      apiKey: key ?? 'anonymous',
      responseTime: Date.now() - startTime,
    });
  });

  // Set rate limit headers
  const rl = (req as any).rateLimit;
  res.set('X-RateLimit-Limit', String(rl.limit));
  res.set('X-RateLimit-Remaining', String(Math.max(0, rl.remaining)));
  res.set('X-RateLimit-Reset', rl.resetAt);

  next();
}

function getDailyUsage(key: string): number {
  const today = new Date().toISOString().split('T')[0];
  return usageLog.filter(
    (r) => r.apiKey === key && r.timestamp.toISOString().startsWith(today)
  ).length;
}

function getNextReset(): string {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

export function getUsageStats(apiKey?: string) {
  const records = apiKey
    ? usageLog.filter((r) => r.apiKey === apiKey)
    : usageLog;

  return {
    total: records.length,
    today: records.filter(
      (r) =>
        r.timestamp.toISOString().split('T')[0] ===
        new Date().toISOString().split('T')[0]
    ).length,
    avgResponseTime:
      records.length > 0
        ? Math.round(
            records.reduce((sum, r) => sum + r.responseTime, 0) / records.length
          )
        : 0,
    byEndpoint: groupBy(records, 'endpoint'),
  };
}

function groupBy(arr: UsageRecord[], key: keyof UsageRecord): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of arr) {
    const k = String(item[key]);
    result[k] = (result[k] ?? 0) + 1;
  }
  return result;
}

export function listApiKeys(): ApiKey[] {
  return Array.from(apiKeys.values());
}
