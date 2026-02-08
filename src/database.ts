import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './config';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dbDir = path.dirname(config.dbPath);
    if (config.dbPath !== ':memory:' && !fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(config.dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      api_key TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS spaces (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo_url TEXT DEFAULT '',
      website_url TEXT DEFAULT '',
      custom_message TEXT DEFAULT 'We''d love to hear what you think! Share your experience below.',
      question_prompt TEXT DEFAULT 'How has our product helped you?',
      collect_rating INTEGER NOT NULL DEFAULT 1,
      collect_avatar INTEGER NOT NULL DEFAULT 1,
      collect_company INTEGER NOT NULL DEFAULT 1,
      brand_color TEXT NOT NULL DEFAULT '#6366f1',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      space_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT DEFAULT '',
      author_title TEXT DEFAULT '',
      author_company TEXT DEFAULT '',
      author_avatar_url TEXT DEFAULT '',
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'pending',
      source TEXT NOT NULL DEFAULT 'form',
      is_featured INTEGER NOT NULL DEFAULT 0,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      approved_at TEXT,
      FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_spaces_user_id ON spaces(user_id);
    CREATE INDEX IF NOT EXISTS idx_spaces_slug ON spaces(slug);
    CREATE INDEX IF NOT EXISTS idx_testimonials_space_id ON testimonials(space_id);
    CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
  `);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    (db as any) = undefined;
  }
}
