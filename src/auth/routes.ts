import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { getDb } from '../database';
import { authenticateToken, AuthRequest } from './middleware';

const router = Router();

router.post('/register', (req: Request, res: Response): void => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Email, password, and name are required' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);
  const apiKey = `pr_${uuidv4().replace(/-/g, '')}`;

  db.prepare(
    'INSERT INTO users (id, email, password_hash, name, api_key) VALUES (?, ?, ?, ?, ?)'
  ).run(id, email, passwordHash, name, apiKey);

  const token = jwt.sign({ userId: id }, config.jwtSecret, { expiresIn: '7d' } as any);

  res.status(201).json({
    user: { id, email, name, plan: 'free', apiKey },
    token,
  });
});

router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const db = getDb();
  const user = db
    .prepare('SELECT id, email, name, password_hash, plan, api_key FROM users WHERE email = ?')
    .get(email) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' } as any);

  res.json({
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan, apiKey: user.api_key },
    token,
  });
});

router.get('/me', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const user = db
    .prepare('SELECT id, email, name, plan, api_key, created_at FROM users WHERE id = ?')
    .get(req.userId!) as any;

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    apiKey: user.api_key,
    createdAt: user.created_at,
  });
});

router.post('/api-key/regenerate', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const newApiKey = `pr_${uuidv4().replace(/-/g, '')}`;
  db.prepare("UPDATE users SET api_key = ?, updated_at = datetime('now') WHERE id = ?").run(
    newApiKey,
    req.userId!
  );
  res.json({ apiKey: newApiKey });
});

export default router;
