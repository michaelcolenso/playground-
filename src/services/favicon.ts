import * as cheerio from 'cheerio';
import { fetchUrl, fetchBuffer, resolveUrl } from '../utils/fetch';
import sharp from 'sharp';

export interface FaviconResult {
  url: string;
  source: string;
  contentType: string;
  buffer: Buffer;
  size?: { width: number; height: number };
}

/**
 * Multi-strategy favicon fetcher.
 * Tries in order:
 * 1. HTML <link rel="icon"> tags (picks largest)
 * 2. Web app manifest icons
 * 3. /favicon.ico fallback
 * 4. Google S2 fallback
 */
export async function fetchFavicon(
  targetUrl: string,
  preferredSize?: number
): Promise<FaviconResult> {
  const errors: string[] = [];

  // Strategy 1: Parse HTML for icon links
  try {
    const result = await tryHtmlIcons(targetUrl, preferredSize);
    if (result) return result;
  } catch (e: any) {
    errors.push(`html: ${e.message}`);
  }

  // Strategy 2: Check web manifest
  try {
    const result = await tryManifestIcons(targetUrl, preferredSize);
    if (result) return result;
  } catch (e: any) {
    errors.push(`manifest: ${e.message}`);
  }

  // Strategy 3: /favicon.ico fallback
  try {
    const result = await tryFaviconIco(targetUrl);
    if (result) return result;
  } catch (e: any) {
    errors.push(`ico: ${e.message}`);
  }

  throw new Error(`No favicon found. Tried: ${errors.join('; ')}`);
}

async function tryHtmlIcons(
  targetUrl: string,
  preferredSize?: number
): Promise<FaviconResult | null> {
  const { body, finalUrl } = await fetchUrl(targetUrl);
  const $ = cheerio.load(body);

  const iconLinks: { href: string; size: number }[] = [];

  $('link[rel*="icon"]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const sizes = $(el).attr('sizes') ?? '';
    const sizeMatch = sizes.match(/(\d+)x(\d+)/);
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 0;
    iconLinks.push({ href: resolveUrl(finalUrl, href), size });
  });

  // Also check apple-touch-icon
  $('link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const sizes = $(el).attr('sizes') ?? '';
    const sizeMatch = sizes.match(/(\d+)x(\d+)/);
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 0;
    iconLinks.push({ href: resolveUrl(finalUrl, href), size });
  });

  if (iconLinks.length === 0) return null;

  // Sort: prefer closest to preferredSize, or largest
  const target = preferredSize ?? 64;
  iconLinks.sort((a, b) => {
    const diffA = Math.abs(a.size - target);
    const diffB = Math.abs(b.size - target);
    if (a.size === 0 && b.size === 0) return 0;
    if (a.size === 0) return 1;
    if (b.size === 0) return -1;
    return diffA - diffB;
  });

  // Try downloading the best candidates
  for (const icon of iconLinks.slice(0, 3)) {
    try {
      const { buffer, contentType } = await fetchBuffer(icon.href);
      const metadata = await getImageSize(buffer);
      return {
        url: icon.href,
        source: 'html-link',
        contentType,
        buffer,
        size: metadata,
      };
    } catch {
      continue;
    }
  }

  return null;
}

async function tryManifestIcons(
  targetUrl: string,
  preferredSize?: number
): Promise<FaviconResult | null> {
  const { body, finalUrl } = await fetchUrl(targetUrl);
  const $ = cheerio.load(body);

  const manifestHref = $('link[rel="manifest"]').attr('href');
  if (!manifestHref) return null;

  const manifestUrl = resolveUrl(finalUrl, manifestHref);
  const { body: manifestBody } = await fetchUrl(manifestUrl);
  const manifest = JSON.parse(manifestBody);

  if (!manifest.icons || !Array.isArray(manifest.icons)) return null;

  const target = preferredSize ?? 64;
  const icons = manifest.icons
    .map((icon: any) => {
      const sizeMatch = (icon.sizes ?? '').match(/(\d+)x(\d+)/);
      return {
        src: resolveUrl(manifestUrl, icon.src),
        size: sizeMatch ? parseInt(sizeMatch[1], 10) : 0,
      };
    })
    .sort((a: any, b: any) => {
      if (a.size === 0) return 1;
      if (b.size === 0) return -1;
      return Math.abs(a.size - target) - Math.abs(b.size - target);
    });

  for (const icon of icons.slice(0, 3)) {
    try {
      const { buffer, contentType } = await fetchBuffer(icon.src);
      const metadata = await getImageSize(buffer);
      return {
        url: icon.src,
        source: 'manifest',
        contentType,
        buffer,
        size: metadata,
      };
    } catch {
      continue;
    }
  }

  return null;
}

async function tryFaviconIco(targetUrl: string): Promise<FaviconResult | null> {
  const origin = new URL(targetUrl).origin;
  const icoUrl = `${origin}/favicon.ico`;

  const { buffer, contentType } = await fetchBuffer(icoUrl);
  if (buffer.length < 10) return null;

  return {
    url: icoUrl,
    source: 'favicon-ico',
    contentType: contentType || 'image/x-icon',
    buffer,
  };
}

async function getImageSize(
  buffer: Buffer
): Promise<{ width: number; height: number } | undefined> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (metadata.width && metadata.height) {
      return { width: metadata.width, height: metadata.height };
    }
  } catch {
    // Not a valid image for sharp (e.g., .ico)
  }
  return undefined;
}

export async function convertFavicon(
  buffer: Buffer,
  format: 'png' | 'webp' | 'jpeg' = 'png',
  size?: number
): Promise<Buffer> {
  let pipeline = sharp(buffer);
  if (size) {
    pipeline = pipeline.resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  }
  return pipeline.toFormat(format).toBuffer();
}
