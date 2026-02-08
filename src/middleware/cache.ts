import { LRUCache } from 'lru-cache';
import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  body: Buffer | string;
  contentType: string;
  statusCode: number;
  headers: Record<string, string>;
}

const cache = new LRUCache<string, CacheEntry>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour default
  maxSize: 500 * 1024 * 1024, // 500MB max
  sizeCalculation: (entry) => {
    const bodySize = Buffer.isBuffer(entry.body)
      ? entry.body.length
      : Buffer.byteLength(entry.body);
    return bodySize + 200; // rough overhead
  },
});

export function cacheMiddleware(ttlSeconds?: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const key = buildCacheKey(req);
    const cached = cache.get(key);

    if (cached) {
      res.set('X-Cache', 'HIT');
      res.set('Content-Type', cached.contentType);
      for (const [k, v] of Object.entries(cached.headers)) {
        res.set(k, v);
      }
      res.status(cached.statusCode).send(cached.body);
      return;
    }

    // Intercept the response to cache it
    const originalSend = res.send.bind(res);
    res.send = function (body: any) {
      const entry: CacheEntry = {
        body,
        contentType: res.get('Content-Type') ?? 'application/octet-stream',
        statusCode: res.statusCode,
        headers: {},
      };

      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (ttlSeconds) {
          cache.set(key, entry, { ttl: ttlSeconds * 1000 });
        } else {
          cache.set(key, entry);
        }
      }

      res.set('X-Cache', 'MISS');
      return originalSend(body);
    } as any;

    next();
  };
}

function buildCacheKey(req: Request): string {
  const params = new URLSearchParams(req.query as Record<string, string>);
  params.sort();
  return `${req.path}?${params.toString()}`;
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheStats() {
  return {
    size: cache.size,
    calculatedSize: cache.calculatedSize,
    maxSize: 500 * 1024 * 1024,
    itemCount: cache.size,
  };
}
