import sharp from 'sharp';

export interface OgImageOptions {
  title: string;
  subtitle?: string;
  domain?: string;
  width?: number;
  height?: number;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
}

/**
 * Generates a simple but clean OG image using sharp (no browser needed).
 * Creates an SVG and converts to PNG — lightweight and fast.
 */
export async function generateOgImage(opts: OgImageOptions): Promise<Buffer> {
  const width = opts.width ?? 1200;
  const height = opts.height ?? 630;
  const bgColor = opts.bgColor ?? '#1a1a2e';
  const textColor = opts.textColor ?? '#ffffff';
  const accentColor = opts.accentColor ?? '#e94560';

  const title = escapeXml(truncate(opts.title, 80));
  const subtitle = opts.subtitle ? escapeXml(truncate(opts.subtitle, 120)) : '';
  const domain = opts.domain ? escapeXml(opts.domain) : '';

  // Break title into lines (~30 chars each)
  const titleLines = wrapText(title, 35);
  const titleFontSize = titleLines.length > 2 ? 42 : 52;
  const titleY = 200;
  const lineHeight = titleFontSize * 1.3;

  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="80" y="${titleY + i * lineHeight}" font-family="sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="${textColor}">${escapeXml(line)}</text>`
    )
    .join('\n');

  const subtitleY = titleY + titleLines.length * lineHeight + 30;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>

      <!-- Accent bar -->
      <rect x="0" y="0" width="${width}" height="6" fill="${accentColor}"/>

      <!-- Decorative circle -->
      <circle cx="${width - 120}" cy="120" r="80" fill="${accentColor}" opacity="0.15"/>
      <circle cx="${width - 80}" cy="180" r="40" fill="${accentColor}" opacity="0.1"/>

      <!-- Title -->
      ${titleSvg}

      <!-- Subtitle -->
      ${subtitle ? `<text x="80" y="${subtitleY}" font-family="sans-serif" font-size="24" fill="${textColor}" opacity="0.7">${subtitle}</text>` : ''}

      <!-- Domain -->
      ${domain ? `<text x="80" y="${height - 50}" font-family="monospace" font-size="20" fill="${accentColor}">${domain}</text>` : ''}

      <!-- Bottom accent -->
      <rect x="0" y="${height - 6}" width="${width}" height="6" fill="${accentColor}"/>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (current.length + word.length + 1 > maxChars && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);

  return lines.slice(0, 4); // Max 4 lines
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '\u2026';
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
