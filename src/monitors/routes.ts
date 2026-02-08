import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { getDb } from '../database';
import { authenticateToken, AuthRequest } from '../auth/middleware';

const router = Router();

function getMonitorLimit(plan: string): number {
  switch (plan) {
    case 'business':
      return config.businessTierMonitors;
    case 'pro':
      return config.proTierMonitors;
    default:
      return config.freeTierMonitors;
  }
}

// List all monitors for the authenticated user
router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const monitors = db
    .prepare(
      `SELECT id, name, url, method, expected_status, check_interval, timeout,
              is_active, status, last_checked_at, last_response_time, created_at
       FROM monitors WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(req.userId!);

  res.json({ monitors });
});

// Get a single monitor with recent checks
router.get('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const monitor = db
    .prepare('SELECT * FROM monitors WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId!) as Record<string, unknown> | undefined;

  if (!monitor) {
    res.status(404).json({ error: 'Monitor not found' });
    return;
  }

  const recentChecks = db
    .prepare(
      `SELECT status, response_time, status_code, error, checked_at
       FROM checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT 50`
    )
    .all(req.params.id);

  const uptime24h = calculateUptime(req.params.id, 24);
  const uptime7d = calculateUptime(req.params.id, 168);
  const uptime30d = calculateUptime(req.params.id, 720);

  res.json({
    monitor,
    recentChecks,
    uptime: { '24h': uptime24h, '7d': uptime7d, '30d': uptime30d },
  });
});

// Create a new monitor
router.post('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const monitorCount = db
    .prepare('SELECT COUNT(*) as count FROM monitors WHERE user_id = ?')
    .get(req.userId!) as { count: number };

  const limit = getMonitorLimit(req.userPlan || 'free');
  if (monitorCount.count >= limit) {
    res.status(403).json({
      error: `Monitor limit reached (${limit}). Upgrade your plan to add more monitors.`,
    });
    return;
  }

  const { name, url, method, expectedStatus, checkInterval, timeout, headers, body } = req.body;

  if (!name || !url) {
    res.status(400).json({ error: 'Name and URL are required' });
    return;
  }

  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  const interval = Math.max(
    config.minCheckInterval,
    Math.min(config.maxCheckInterval, checkInterval || config.defaultCheckInterval)
  );

  const id = uuidv4();
  db.prepare(
    `INSERT INTO monitors (id, user_id, name, url, method, expected_status, check_interval, timeout, headers, body)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.userId!,
    name,
    url,
    method || 'GET',
    expectedStatus || 200,
    interval,
    timeout || config.requestTimeout,
    JSON.stringify(headers || {}),
    body || null
  );

  const monitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(id);
  res.status(201).json({ monitor });
});

// Update a monitor
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const existing = db
    .prepare('SELECT id FROM monitors WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId!);

  if (!existing) {
    res.status(404).json({ error: 'Monitor not found' });
    return;
  }

  const { name, url, method, expectedStatus, checkInterval, timeout, headers, body, isActive } =
    req.body;

  if (url) {
    try {
      new URL(url);
    } catch {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (url !== undefined) { updates.push('url = ?'); values.push(url); }
  if (method !== undefined) { updates.push('method = ?'); values.push(method); }
  if (expectedStatus !== undefined) { updates.push('expected_status = ?'); values.push(expectedStatus); }
  if (checkInterval !== undefined) {
    const interval = Math.max(config.minCheckInterval, Math.min(config.maxCheckInterval, checkInterval));
    updates.push('check_interval = ?');
    values.push(interval);
  }
  if (timeout !== undefined) { updates.push('timeout = ?'); values.push(timeout); }
  if (headers !== undefined) { updates.push('headers = ?'); values.push(JSON.stringify(headers)); }
  if (body !== undefined) { updates.push('body = ?'); values.push(body); }
  if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive ? 1 : 0); }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  updates.push("updated_at = datetime('now')");
  values.push(req.params.id, req.userId!);

  db.prepare(
    `UPDATE monitors SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
  ).run(...values);

  const monitor = db.prepare('SELECT * FROM monitors WHERE id = ?').get(req.params.id);
  res.json({ monitor });
});

// Delete a monitor
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const result = db
    .prepare('DELETE FROM monitors WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId!);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Monitor not found' });
    return;
  }

  res.json({ message: 'Monitor deleted' });
});

// Get uptime stats for a monitor
router.get('/:id/stats', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const monitor = db
    .prepare('SELECT id FROM monitors WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId!);

  if (!monitor) {
    res.status(404).json({ error: 'Monitor not found' });
    return;
  }

  const hours = parseInt(req.query.hours as string) || 24;
  const responseTimeSeries = db
    .prepare(
      `SELECT response_time, status, checked_at FROM checks
       WHERE monitor_id = ? AND checked_at > datetime('now', ?)
       ORDER BY checked_at ASC`
    )
    .all(req.params.id, `-${hours} hours`);

  const avgResponseTime = db
    .prepare(
      `SELECT AVG(response_time) as avg_time FROM checks
       WHERE monitor_id = ? AND checked_at > datetime('now', ?) AND status = 'up'`
    )
    .get(req.params.id, `-${hours} hours`) as { avg_time: number | null };

  res.json({
    uptime: calculateUptime(req.params.id, hours),
    avgResponseTime: Math.round(avgResponseTime.avg_time || 0),
    totalChecks: responseTimeSeries.length,
    responseTimeSeries,
  });
});

function calculateUptime(monitorId: string, hours: number): number {
  const db = getDb();
  const stats = db
    .prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up_count
       FROM checks
       WHERE monitor_id = ? AND checked_at > datetime('now', ?)`
    )
    .get(monitorId, `-${hours} hours`) as { total: number; up_count: number };

  if (stats.total === 0) return 100;
  return Math.round((stats.up_count / stats.total) * 10000) / 100;
}

export default router;
