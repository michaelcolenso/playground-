import { Router, Request, Response } from 'express';
import { fetchFavicon, convertFavicon } from '../services/favicon';
import { extractOpenGraph, extractOpenGraphWithImage } from '../services/opengraph';
import { generateOgImage } from '../services/og-image-generator';
import { cacheMiddleware, getCacheStats, clearCache } from '../middleware/cache';
import { authMiddleware, getUsageStats, createApiKey, listApiKeys } from '../middleware/auth';

const router = Router();

// All API routes require auth check (anonymous gets 20 req/day)
router.use(authMiddleware);

/**
 * GET /api/v1/favicon?url=<url>&size=<size>&format=<png|webp|jpeg>
 * Returns the favicon for a given URL.
 */
router.get('/v1/favicon', cacheMiddleware(3600), async (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: 'Missing required parameter: url' });
    return;
  }

  if (!isValidUrl(url)) {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  const size = parseInt(req.query.size as string) || undefined;
  const format = (req.query.format as 'png' | 'webp' | 'jpeg') || 'png';

  try {
    const result = await fetchFavicon(url, size);
    let output = result.buffer;

    // Convert if format requested or size specified
    if (format !== 'png' || size) {
      try {
        output = await convertFavicon(result.buffer, format, size);
      } catch {
        // If conversion fails, return original
      }
    }

    const contentTypes: Record<string, string> = {
      png: 'image/png',
      webp: 'image/webp',
      jpeg: 'image/jpeg',
    };

    res.set('Content-Type', contentTypes[format] ?? 'image/png');
    res.set('X-Favicon-Source', result.source);
    res.set('X-Original-Url', result.url);
    if (result.size) {
      res.set('X-Original-Size', `${result.size.width}x${result.size.height}`);
    }
    res.send(output);
  } catch (err: any) {
    res.status(404).json({ error: 'Favicon not found', details: err.message });
  }
});

/**
 * GET /api/v1/og?url=<url>
 * Returns Open Graph metadata as JSON.
 */
router.get('/v1/og', cacheMiddleware(3600), async (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: 'Missing required parameter: url' });
    return;
  }

  if (!isValidUrl(url)) {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  try {
    const data = await extractOpenGraph(url);
    res.json({
      success: true,
      data,
      _links: {
        image: data.image
          ? `/api/v1/og/image?url=${encodeURIComponent(url)}`
          : null,
        favicon: `/api/v1/favicon?url=${encodeURIComponent(url)}`,
      },
    });
  } catch (err: any) {
    res.status(502).json({ error: 'Failed to fetch URL', details: err.message });
  }
});

/**
 * GET /api/v1/og/image?url=<url>
 * Returns the OG image for a URL. If none exists, generates one.
 */
router.get('/v1/og/image', cacheMiddleware(3600), async (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: 'Missing required parameter: url' });
    return;
  }

  if (!isValidUrl(url)) {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  try {
    const data = await extractOpenGraphWithImage(url);

    if (data.imageBuffer) {
      res.set('Content-Type', data.imageContentType ?? 'image/png');
      res.set('X-Image-Source', 'original');
      res.send(data.imageBuffer);
      return;
    }

    // No OG image found — generate one
    const generated = await generateOgImage({
      title: data.title ?? new URL(url).hostname,
      subtitle: data.description,
      domain: new URL(url).hostname,
    });

    res.set('Content-Type', 'image/png');
    res.set('X-Image-Source', 'generated');
    res.send(generated);
  } catch (err: any) {
    // Last resort: generate a generic image
    try {
      const generated = await generateOgImage({
        title: new URL(url).hostname,
        domain: new URL(url).hostname,
      });
      res.set('Content-Type', 'image/png');
      res.set('X-Image-Source', 'generated-fallback');
      res.send(generated);
    } catch {
      res.status(502).json({ error: 'Failed to fetch or generate image', details: err.message });
    }
  }
});

/**
 * GET /api/v1/meta?url=<url>
 * Returns combined metadata: OG data + favicon URL + generated links.
 */
router.get('/v1/meta', cacheMiddleware(3600), async (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: 'Missing required parameter: url' });
    return;
  }

  if (!isValidUrl(url)) {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  try {
    const og = await extractOpenGraph(url);
    res.json({
      success: true,
      data: {
        ...og,
        imageBuffer: undefined, // Don't include raw buffer in JSON
      },
      _links: {
        favicon: `/api/v1/favicon?url=${encodeURIComponent(url)}`,
        ogImage: `/api/v1/og/image?url=${encodeURIComponent(url)}`,
        ogData: `/api/v1/og?url=${encodeURIComponent(url)}`,
      },
    });
  } catch (err: any) {
    res.status(502).json({ error: 'Failed to fetch URL', details: err.message });
  }
});

/**
 * GET /api/v1/generate?title=<title>&subtitle=<subtitle>&domain=<domain>
 * Generates a custom OG image on the fly.
 */
router.get('/v1/generate', cacheMiddleware(86400), async (req: Request, res: Response) => {
  const title = req.query.title as string;
  if (!title) {
    res.status(400).json({ error: 'Missing required parameter: title' });
    return;
  }

  try {
    const image = await generateOgImage({
      title,
      subtitle: req.query.subtitle as string,
      domain: req.query.domain as string,
      bgColor: req.query.bg as string,
      textColor: req.query.color as string,
      accentColor: req.query.accent as string,
      width: parseInt(req.query.width as string) || undefined,
      height: parseInt(req.query.height as string) || undefined,
    });

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(image);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate image', details: err.message });
  }
});

// --- Admin / Stats routes ---

/**
 * POST /api/v1/keys - Create a new API key
 */
router.post('/v1/keys', (req: Request, res: Response) => {
  const { name, tier } = req.body ?? {};
  if (!name) {
    res.status(400).json({ error: 'Missing required field: name' });
    return;
  }
  const key = createApiKey(name, tier);
  res.status(201).json({ success: true, key });
});

/**
 * GET /api/v1/stats - Usage statistics
 */
router.get('/v1/stats', (_req: Request, res: Response) => {
  res.json({
    usage: getUsageStats(),
    cache: getCacheStats(),
  });
});

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default router;
