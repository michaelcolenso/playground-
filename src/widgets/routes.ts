import { Router, Request, Response } from 'express';
import { getDb } from '../database';
import { config } from '../config';

const router = Router();

interface TestimonialRow {
  id: string;
  author_name: string;
  author_title: string;
  author_company: string;
  author_avatar_url: string;
  content: string;
  rating: number;
  is_featured: number;
  approved_at: string;
}

// Get approved testimonials as JSON (for custom integrations)
router.get('/api/:slug', (req: Request, res: Response): void => {
  const db = getDb();
  const space = db.prepare('SELECT * FROM spaces WHERE slug = ?').get(req.params.slug) as any;

  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const testimonials = db
    .prepare(
      `SELECT id, author_name, author_title, author_company, author_avatar_url,
              content, rating, is_featured, approved_at
       FROM testimonials
       WHERE space_id = ? AND status = 'approved'
       ORDER BY is_featured DESC, approved_at DESC`
    )
    .all(space.id) as TestimonialRow[];

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ space: { name: space.name, slug: space.slug }, testimonials });
});

// Embeddable JavaScript widget
router.get('/embed/:slug.js', (req: Request, res: Response): void => {
  const db = getDb();
  const space = db.prepare('SELECT * FROM spaces WHERE slug = ?').get(req.params.slug) as any;

  if (!space) {
    res.status(404).setHeader('Content-Type', 'application/javascript').send('// Space not found');
    return;
  }

  const testimonials = db
    .prepare(
      `SELECT id, author_name, author_title, author_company, author_avatar_url,
              content, rating, is_featured, approved_at
       FROM testimonials
       WHERE space_id = ? AND status = 'approved'
       ORDER BY is_featured DESC, approved_at DESC
       LIMIT 50`
    )
    .all(space.id) as TestimonialRow[];

  const color = space.brand_color || '#6366f1';

  const js = generateWidgetJS(testimonials, space, color);

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.send(js);
});

// Render a full HTML widget page (for iframe embed)
router.get('/wall/:slug', (req: Request, res: Response): void => {
  const db = getDb();
  const space = db.prepare('SELECT * FROM spaces WHERE slug = ?').get(req.params.slug) as any;

  if (!space) {
    res.status(404).send('Not found');
    return;
  }

  const testimonials = db
    .prepare(
      `SELECT id, author_name, author_title, author_company, author_avatar_url,
              content, rating, is_featured, approved_at
       FROM testimonials
       WHERE space_id = ? AND status = 'approved'
       ORDER BY is_featured DESC, approved_at DESC
       LIMIT 50`
    )
    .all(space.id) as TestimonialRow[];

  const color = space.brand_color || '#6366f1';
  const html = renderWallPage(testimonials, space, color);

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

function escapeJs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"')
    .replace(/\n/g, '\\n').replace(/\r/g, '').replace(/</g, '\\u003c');
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function starHtml(rating: number, color: string): string {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < rating ? '#f59e0b' : '#e2e8f0'};font-size:14px;">&#9733;</span>`
  ).join('');
}

function avatarHtml(t: TestimonialRow, color: string): string {
  if (t.author_avatar_url) {
    return `<img src="${escapeHtml(t.author_avatar_url)}" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">`;
  }
  const initial = escapeHtml(t.author_name.charAt(0).toUpperCase());
  return `<div style="width:40px;height:40px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:16px;">${initial}</div>`;
}

function testimonialCardHtml(t: TestimonialRow, color: string): string {
  const subtitle = [t.author_title, t.author_company].filter(Boolean).join(' at ');
  return `
    <div style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:22px;break-inside:avoid;margin-bottom:14px;">
      <div style="margin-bottom:10px;">${starHtml(t.rating, color)}</div>
      <p style="color:#334155;font-size:15px;line-height:1.6;margin-bottom:14px;">${escapeHtml(t.content)}</p>
      <div style="display:flex;align-items:center;gap:10px;">
        ${avatarHtml(t, color)}
        <div>
          <div style="font-weight:600;font-size:14px;color:#0f172a;">${escapeHtml(t.author_name)}</div>
          ${subtitle ? `<div style="font-size:12px;color:#64748b;">${escapeHtml(subtitle)}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function generateWidgetJS(testimonials: TestimonialRow[], space: any, color: string): string {
  const cards = testimonials.map(t => testimonialCardHtml(t, color)).join('');

  return `(function() {
  var container = document.getElementById('praised-${escapeJs(space.slug)}');
  if (!container) {
    var scripts = document.getElementsByTagName('script');
    var current = scripts[scripts.length - 1];
    container = document.createElement('div');
    container.id = 'praised-${escapeJs(space.slug)}';
    current.parentNode.insertBefore(container, current);
  }

  container.innerHTML = \`
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="columns:1;column-gap:14px;">
        ${escapeJs(cards)}
      </div>
      <div style="text-align:center;margin-top:12px;">
        <a href="${escapeJs(config.baseUrl)}" target="_blank" rel="noopener"
           style="font-size:11px;color:#94a3b8;text-decoration:none;">
          Powered by <strong>Praised</strong>
        </a>
      </div>
    </div>
  \`;

  // Responsive columns
  function adjustColumns() {
    var w = container.offsetWidth;
    var cols = container.querySelector('div > div');
    if (cols) cols.style.columns = w > 700 ? '3' : w > 450 ? '2' : '1';
  }
  adjustColumns();
  window.addEventListener('resize', adjustColumns);
})();`;
}

function renderWallPage(testimonials: TestimonialRow[], space: any, color: string): string {
  const cards = testimonials.map(t => testimonialCardHtml(t, color)).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(space.name)} — Wall of Love</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc; padding: 24px; min-height: 100vh;
    }
    .header { text-align: center; margin-bottom: 32px; }
    .header h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .header p { color: #64748b; font-size: 15px; }
    .masonry { columns: 3; column-gap: 14px; max-width: 900px; margin: 0 auto; }
    @media (max-width: 700px) { .masonry { columns: 2; } }
    @media (max-width: 450px) { .masonry { columns: 1; } }
    .footer { text-align: center; margin-top: 24px; }
    .footer a { font-size: 12px; color: #94a3b8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(space.name)}</h1>
    <p>What people are saying</p>
  </div>
  <div class="masonry">
    ${cards || '<p style="text-align:center;color:#94a3b8;grid-column:1/-1;">No testimonials yet.</p>'}
  </div>
  <div class="footer">
    <a href="${config.baseUrl}" target="_blank">Powered by <strong>Praised</strong></a>
  </div>
</body>
</html>`;
}

export default router;
