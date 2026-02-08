import { Router, Response } from 'express';
import { getDb } from '../database';
import { authenticateToken, AuthRequest } from '../auth/middleware';

const router = Router();

// List incidents for the authenticated user's monitors
router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const status = req.query.status as string | undefined;

  let query = `
    SELECT i.*, m.name as monitor_name, m.url as monitor_url
    FROM incidents i
    JOIN monitors m ON i.monitor_id = m.id
    WHERE m.user_id = ?
  `;
  const params: unknown[] = [req.userId!];

  if (status === 'ongoing' || status === 'resolved') {
    query += ' AND i.status = ?';
    params.push(status);
  }

  query += ' ORDER BY i.started_at DESC LIMIT 100';

  const incidents = db.prepare(query).all(...params);
  res.json({ incidents });
});

// Get a single incident
router.get('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const incident = db
    .prepare(
      `SELECT i.*, m.name as monitor_name, m.url as monitor_url
       FROM incidents i
       JOIN monitors m ON i.monitor_id = m.id
       WHERE i.id = ? AND m.user_id = ?`
    )
    .get(req.params.id, req.userId!);

  if (!incident) {
    res.status(404).json({ error: 'Incident not found' });
    return;
  }

  res.json({ incident });
});

export default router;
