/**
 * HTTP fetch utilities with timeout, redirects, and error handling.
 */

export interface FetchOptions {
  timeout?: number;
  maxRedirects?: number;
  headers?: Record<string, string>;
}

const DEFAULT_TIMEOUT = 8000;
const DEFAULT_MAX_REDIRECTS = 5;
const USER_AGENT = 'OpenGrab/1.0 (+https://opengrab.dev)';

export async function fetchUrl(
  url: string,
  opts: FetchOptions = {}
): Promise<{ body: string; contentType: string; finalUrl: string }> {
  const timeout = opts.timeout ?? DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...opts.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const body = await response.text();
    return { body, contentType, finalUrl: response.url };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchBuffer(
  url: string,
  opts: FetchOptions = {}
): Promise<{ buffer: Buffer; contentType: string; finalUrl: string }> {
  const timeout = opts.timeout ?? DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        ...opts.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const arrayBuf = await response.arrayBuffer();
    return { buffer: Buffer.from(arrayBuf), contentType, finalUrl: response.url };
  } finally {
    clearTimeout(timer);
  }
}

export function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
