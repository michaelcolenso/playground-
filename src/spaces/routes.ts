import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { getDb } from '../database';
import { authenticateToken, AuthRequest } from '../auth/middleware';

const router = Router();

function getSpaceLimit(plan: string): number {
  switch (plan) {
    case 'business': return config.businessSpaces;
    case 'pro': return config.proSpaces;
    default: return config.freeSpaces;
  }
}

// List all spaces
router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const spaces = db
    .prepare('SELECT * FROM spaces WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId!);

  // Attach testimonial counts
  const enriched = spaces.map((space: any) => {
    const counts = db
      .prepare(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
         FROM testimonials WHERE space_id = ?`
      )
      .get(space.id) as any;
    return { ...space, testimonialCount: counts.total, approvedCount: counts.approved, pendingCount: counts.pending };
  });

  res.json({ spaces: enriched });
});

// Get a single space
router.get('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const space = db
    .prepare('SELECT * FROM spaces WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId!);

  if (!space) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  res.json({ space });
});

// Create a space
router.post('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const { name, slug, websiteUrl, customMessage, questionPrompt, brandColor } = req.body;

  if (!name || !slug) {
    res.status(400).json({ error: 'Name and slug are required' });
    return;
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && !/^[a-z0-9]$/.test(slug)) {
    res.status(400).json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' });
    return;
  }

  const existing = db.prepare('SELECT id FROM spaces WHERE slug = ?').get(slug);
  if (existing) {
    res.status(409).json({ error: 'This slug is already taken' });
    return;
  }

  const limit = getSpaceLimit(req.userPlan || 'free');
  if (limit !== -1) {
    const count = db
      .prepare('SELECT COUNT(*) as count FROM spaces WHERE user_id = ?')
      .get(req.userId!) as { count: number };
    if (count.count >= limit) {
      res.status(403).json({
        error: `Space limit reached (${limit}). Upgrade your plan to create more spaces.`,
        upgradeUrl: `${config.baseUrl}/dashboard#billing`,
        currentPlan: req.userPlan || 'free',
      });
      return;
    }
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO spaces (id, user_id, name, slug, website_url, custom_message, question_prompt, brand_color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.userId!,
    name,
    slug,
    websiteUrl || '',
    customMessage || "We'd love to hear what you think! Share your experience below.",
    questionPrompt || 'How has our product helped you?',
    brandColor || '#6366f1'
  );

  const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(id);
  res.status(201).json({ space });
});

// Update a space
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const existing = db
    .prepare('SELECT id FROM spaces WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId!);

  if (!existing) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  const fields = ['name', 'logo_url', 'website_url', 'custom_message', 'question_prompt',
    'collect_rating', 'collect_avatar', 'collect_company', 'brand_color'];
  const bodyMap: Record<string, string> = {
    name: 'name', logoUrl: 'logo_url', websiteUrl: 'website_url',
    customMessage: 'custom_message', questionPrompt: 'question_prompt',
    collectRating: 'collect_rating', collectAvatar: 'collect_avatar',
    collectCompany: 'collect_company', brandColor: 'brand_color',
  };

  const updates: string[] = [];
  const values: any[] = [];

  for (const [bodyKey, dbCol] of Object.entries(bodyMap)) {
    if (req.body[bodyKey] !== undefined) {
      updates.push(`${dbCol} = ?`);
      const val = req.body[bodyKey];
      values.push(typeof val === 'boolean' ? (val ? 1 : 0) : val);
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  updates.push("updated_at = datetime('now')");
  values.push(req.params.id, req.userId!);

  db.prepare(`UPDATE spaces SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

  const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id);
  res.json({ space });
});

// Delete a space
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const result = db
    .prepare('DELETE FROM spaces WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId!);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Space not found' });
    return;
  }

  res.json({ message: 'Space deleted' });
});

export default router;
