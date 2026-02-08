import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { getDb } from '../database';

export interface AuthRequest extends Request {
  userId?: string;
  userPlan?: string;
}

interface JwtPayload {
  userId: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  // Check for Bearer token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Check for API key
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (apiKey) {
    const db = getDb();
    const user = db.prepare('SELECT id, plan FROM users WHERE api_key = ?').get(apiKey) as
      | { id: string; plan: string }
      | undefined;
    if (user) {
      req.userId = user.id;
      req.userPlan = user.plan;
      next();
      return;
    }
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const db = getDb();
    const user = db.prepare('SELECT id, plan FROM users WHERE id = ?').get(decoded.userId) as
      | { id: string; plan: string }
      | undefined;
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    req.userId = user.id;
    req.userPlan = user.plan;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
