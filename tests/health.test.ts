import request from 'supertest';
import { createApp } from '../src/index';
import { initializeDatabase, closeDatabase } from '../src/database';
import { config } from '../src/config';

config.dbPath = ':memory:';

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  initializeDatabase();
  app = createApp();
});

afterAll(() => {
  closeDatabase();
});

describe('Core Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.version).toBe('1.0.0');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /', () => {
    it('should return the landing page HTML', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
      expect(res.text).toContain('PingBase');
      expect(res.text).toContain('uptime');
    });
  });

  describe('GET /docs', () => {
    it('should return the docs page HTML', async () => {
      const res = await request(app).get('/docs');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
      expect(res.text).toContain('API Documentation');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown API routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });
  });
});
