import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database';
import { authenticateToken, AuthRequest } from '../auth/middleware';

const router = Router();

// List alert channels
router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const channels = db
    .prepare('SELECT * FROM alert_channels WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId!);
  res.json({ channels });
});

// Create an alert channel
router.post('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const { type, config: channelConfig } = req.body;

  if (!type || !channelConfig) {
    res.status(400).json({ error: 'Type and config are required' });
    return;
  }

  const validTypes = ['email', 'webhook', 'slack'];
  if (!validTypes.includes(type)) {
    res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    return;
  }

  // Validate config based on type
  if (type === 'email' && !channelConfig.email) {
    res.status(400).json({ error: 'Email address is required for email channels' });
    return;
  }
  if (type === 'webhook' && !channelConfig.url) {
    res.status(400).json({ error: 'URL is required for webhook channels' });
    return;
  }
  if (type === 'slack' && !channelConfig.webhookUrl) {
    res.status(400).json({ error: 'Webhook URL is required for Slack channels' });
    return;
  }

  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO alert_channels (id, user_id, type, config) VALUES (?, ?, ?, ?)'
  ).run(id, req.userId!, type, JSON.stringify(channelConfig));

  const channel = db.prepare('SELECT * FROM alert_channels WHERE id = ?').get(id);
  res.status(201).json({ channel });
});

// Delete an alert channel
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const result = db
    .prepare('DELETE FROM alert_channels WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId!);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Alert channel not found' });
    return;
  }

  res.json({ message: 'Alert channel deleted' });
});

export default router;
