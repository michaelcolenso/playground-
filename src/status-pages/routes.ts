import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database';
import { authenticateToken, AuthRequest } from '../auth/middleware';
import { renderStatusPage } from './renderer';

const router = Router();

// List user's status pages
router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const pages = db
    .prepare('SELECT * FROM status_pages WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId!);
  res.json({ statusPages: pages });
});

// Create a status page
router.post('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const { name, slug, description, monitorIds } = req.body;

  if (!name || !slug) {
    res.status(400).json({ error: 'Name and slug are required' });
    return;
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    res.status(400).json({ error: 'Slug must only contain lowercase letters, numbers, and hyphens' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM status_pages WHERE slug = ?').get(slug);
  if (existing) {
    res.status(409).json({ error: 'Slug already taken' });
    return;
  }

  // Validate that monitor IDs belong to user
  if (monitorIds && Array.isArray(monitorIds)) {
    for (const mid of monitorIds) {
      const monitor = db
        .prepare('SELECT id FROM monitors WHERE id = ? AND user_id = ?')
        .get(mid, req.userId!);
      if (!monitor) {
        res.status(400).json({ error: `Monitor ${mid} not found` });
        return;
      }
    }
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO status_pages (id, user_id, slug, name, description, monitor_ids)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, req.userId!, slug, name, description || '', JSON.stringify(monitorIds || []));

  const page = db.prepare('SELECT * FROM status_pages WHERE id = ?').get(id);
  res.status(201).json({ statusPage: page });
});

// Update a status page
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM status_pages WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId!);

  if (!existing) {
    res.status(404).json({ error: 'Status page not found' });
    return;
  }

  const { name, description, monitorIds, isPublic, theme, logoUrl } = req.body;
  const updates: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (monitorIds !== undefined) { updates.push('monitor_ids = ?'); values.push(JSON.stringify(monitorIds)); }
  if (isPublic !== undefined) { updates.push('is_public = ?'); values.push(isPublic ? 1 : 0); }
  if (theme !== undefined) { updates.push('theme = ?'); values.push(theme); }
  if (logoUrl !== undefined) { updates.push('logo_url = ?'); values.push(logoUrl); }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  updates.push("updated_at = datetime('now')");
  values.push(req.params.id, req.userId!);

  db.prepare(
    `UPDATE status_pages SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
  ).run(...values);

  const page = db.prepare('SELECT * FROM status_pages WHERE id = ?').get(req.params.id);
  res.json({ statusPage: page });
});

// Delete a status page
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const result = db
    .prepare('DELETE FROM status_pages WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId!);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Status page not found' });
    return;
  }

  res.json({ message: 'Status page deleted' });
});

// PUBLIC: View a status page by slug (no auth required)
router.get('/public/:slug', (req: Request, res: Response): void => {
  const db = getDb();
  const page = db
    .prepare('SELECT * FROM status_pages WHERE slug = ? AND is_public = 1')
    .get(req.params.slug) as Record<string, unknown> | undefined;

  if (!page) {
    res.status(404).json({ error: 'Status page not found' });
    return;
  }

  // Check if client wants JSON
  if (req.headers.accept?.includes('application/json')) {
    const monitorIds = JSON.parse(page.monitor_ids as string) as string[];
    const monitors = monitorIds.length > 0
      ? db
          .prepare(
            `SELECT id, name, url, status, last_checked_at, last_response_time
             FROM monitors WHERE id IN (${monitorIds.map(() => '?').join(',')})`
          )
          .all(...monitorIds)
      : [];

    const incidents = monitorIds.length > 0
      ? db
          .prepare(
            `SELECT i.*, m.name as monitor_name
             FROM incidents i JOIN monitors m ON i.monitor_id = m.id
             WHERE i.monitor_id IN (${monitorIds.map(() => '?').join(',')})
             ORDER BY i.started_at DESC LIMIT 20`
          )
          .all(...monitorIds)
      : [];

    res.json({ statusPage: page, monitors, incidents });
    return;
  }

  // Return rendered HTML
  const html = renderStatusPage(page);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;
