import * as cheerio from 'cheerio';
import { fetchUrl, fetchBuffer, resolveUrl } from '../utils/fetch';

export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  imageBuffer?: Buffer;
  imageContentType?: string;
  siteName?: string;
  type?: string;
  url?: string;
  locale?: string;
  twitterCard?: string;
  twitterImage?: string;
  favicon?: string;
  themeColor?: string;
}

/**
 * Extracts Open Graph (and Twitter Card) metadata from a URL.
 */
export async function extractOpenGraph(targetUrl: string): Promise<OpenGraphData> {
  const { body, finalUrl } = await fetchUrl(targetUrl);
  const $ = cheerio.load(body);

  const data: OpenGraphData = {};

  // OG tags
  data.title = getMeta($, 'og:title') ?? $('title').text().trim() ?? undefined;
  data.description =
    getMeta($, 'og:description') ??
    getMeta($, 'description') ??
    undefined;
  data.image = getMeta($, 'og:image') ?? undefined;
  data.siteName = getMeta($, 'og:site_name') ?? undefined;
  data.type = getMeta($, 'og:type') ?? undefined;
  data.url = getMeta($, 'og:url') ?? finalUrl;
  data.locale = getMeta($, 'og:locale') ?? undefined;

  // Twitter tags
  data.twitterCard = getMeta($, 'twitter:card') ?? undefined;
  data.twitterImage = getMeta($, 'twitter:image') ?? undefined;

  // Theme color
  data.themeColor = $('meta[name="theme-color"]').attr('content') ?? undefined;

  // Resolve relative image URLs
  if (data.image) {
    data.image = resolveUrl(finalUrl, data.image);
  }
  if (data.twitterImage) {
    data.twitterImage = resolveUrl(finalUrl, data.twitterImage);
  }

  // Get favicon hint
  const faviconEl = $('link[rel="icon"], link[rel="shortcut icon"]').first();
  if (faviconEl.length) {
    data.favicon = resolveUrl(finalUrl, faviconEl.attr('href') ?? '');
  }

  return data;
}

/**
 * Extracts OG data and also downloads the OG image.
 */
export async function extractOpenGraphWithImage(
  targetUrl: string
): Promise<OpenGraphData> {
  const data = await extractOpenGraph(targetUrl);

  const imageUrl = data.image ?? data.twitterImage;
  if (imageUrl) {
    try {
      const { buffer, contentType } = await fetchBuffer(imageUrl);
      data.imageBuffer = buffer;
      data.imageContentType = contentType;
    } catch {
      // Image download failed — metadata still useful
    }
  }

  return data;
}

function getMeta($: cheerio.CheerioAPI, name: string): string | null {
  // Try property first (OG style), then name (standard style)
  const content =
    $(`meta[property="${name}"]`).attr('content') ??
    $(`meta[name="${name}"]`).attr('content');
  return content?.trim() || null;
}
