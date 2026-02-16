import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { getDb } from '../database';
import { authenticateToken, AuthRequest } from '../auth/middleware';
import { renderCollectionForm, renderThankYou } from './collection-form';

const router = Router();

function getTestimonialLimit(plan: string): number {
  switch (plan) {
    case 'business': return config.businessTestimonials;
    case 'pro': return config.proTestimonials;
    default: return config.freeTestimonials;
  }
}

// List testimonials for a space (authenticated)
router.get('/space/:spaceId', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const space = db
    .prepare('SELECT id FROM spaces WHERE id = ? AND user_id = ?')
    .get(req.params.spaceId, req.userId!);

  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const status = req.query.status as string | undefined;
  let query = 'SELECT * FROM testimonials WHERE space_id = ?';
  const params: any[] = [req.params.spaceId];

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY submitted_at DESC';

  const testimonials = db.prepare(query).all(...params);
  res.json({ testimonials });
});

// Approve / reject / feature a testimonial
router.patch('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const testimonial = db
    .prepare(
      `SELECT t.id, t.space_id FROM testimonials t
       JOIN spaces s ON t.space_id = s.id
       WHERE t.id = ? AND s.user_id = ?`
    )
    .get(req.params.id, req.userId!) as any;

  if (!testimonial) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }

  const { status, isFeatured } = req.body;
  const updates: string[] = [];
  const values: any[] = [];

  if (status && ['approved', 'rejected', 'pending'].includes(status)) {
    updates.push('status = ?');
    values.push(status);
    if (status === 'approved') {
      updates.push("approved_at = datetime('now')");
    }
  }

  if (isFeatured !== undefined) {
    updates.push('is_featured = ?');
    values.push(isFeatured ? 1 : 0);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No valid fields to update' });
    return;
  }

  values.push(req.params.id);
  db.prepare(`UPDATE testimonials SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  res.json({ testimonial: updated });
});

// Delete a testimonial
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const testimonial = db
    .prepare(
      `SELECT t.id FROM testimonials t
       JOIN spaces s ON t.space_id = s.id
       WHERE t.id = ? AND s.user_id = ?`
    )
    .get(req.params.id, req.userId!);

  if (!testimonial) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }

  db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
  res.json({ message: 'Testimonial deleted' });
});

// Create testimonial via API (authenticated)
router.post('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const { spaceId, authorName, authorEmail, authorTitle, authorCompany, authorAvatarUrl, content, rating } = req.body;

  if (!spaceId || !authorName || !content) {
    res.status(400).json({ error: 'spaceId, authorName, and content are required' });
    return;
  }

  const space = db
    .prepare('SELECT id FROM spaces WHERE id = ? AND user_id = ?')
    .get(spaceId, req.userId!);

  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO testimonials (id, space_id, author_name, author_email, author_title, author_company, author_avatar_url, content, rating, status, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 'api')`
  ).run(id, spaceId, authorName, authorEmail || '', authorTitle || '', authorCompany || '', authorAvatarUrl || '', content, rating || 5);

  const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
  res.status(201).json({ testimonial });
});

// ============================================
// PUBLIC ROUTES (no auth)
// ============================================

// Public collection form page (GET)
router.get('/collect/:slug', (req: Request, res: Response): void => {
  const db = getDb();
  const space = db
    .prepare('SELECT * FROM spaces WHERE slug = ?')
    .get(req.params.slug) as any;

  if (!space) {
    res.status(404).send('Space not found');
    return;
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(renderCollectionForm(space));
});

// Public collection form submission (POST)
router.post('/collect/:slug', (req: Request, res: Response): void => {
  const db = getDb();
  const space = db.prepare('SELECT * FROM spaces WHERE slug = ?').get(req.params.slug) as any;

  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  // Check testimonial limit for space owner
  const owner = db.prepare('SELECT plan FROM users WHERE id = ?').get(space.user_id) as any;
  const limit = getTestimonialLimit(owner?.plan || 'free');
  if (limit !== -1) {
    const count = db
      .prepare('SELECT COUNT(*) as count FROM testimonials WHERE space_id = ?')
      .get(space.id) as { count: number };
    if (count.count >= limit) {
      res.status(403).json({
        error: `Testimonial limit reached (${limit}). The space owner needs to upgrade their plan.`,
        upgradeUrl: `${config.baseUrl}/dashboard#billing`,
      });
      return;
    }
  }

  const { authorName, authorEmail, authorTitle, authorCompany, content, rating } = req.body;

  if (!authorName || !content) {
    // If it's a form submission (not JSON), redirect back
    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      res.redirect(`/api/testimonials/collect/${req.params.slug}?error=name-and-content-required`);
      return;
    }
    res.status(400).json({ error: 'authorName and content are required' });
    return;
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO testimonials (id, space_id, author_name, author_email, author_title, author_company, content, rating, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'form')`
  ).run(id, space.id, authorName, authorEmail || '', authorTitle || '', authorCompany || '', content, parseInt(rating) || 5);

  // HTML form submission → redirect to thank you
  if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
    res.setHeader('Content-Type', 'text/html');
    res.send(renderThankYou(space));
    return;
  }

  res.status(201).json({ message: 'Thank you! Your testimonial has been submitted for review.' });
});

export default router;
