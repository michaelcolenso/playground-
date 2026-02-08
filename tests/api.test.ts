import express from 'express';
import request from 'supertest';
import apiRouter from '../src/routes/api';

// Create a test app
function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
  return app;
}

describe('API Routes', () => {
  const app = createApp();

  describe('GET /api/v1/favicon', () => {
    it('returns 400 when url is missing', async () => {
      const res = await request(app).get('/api/v1/favicon');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing');
    });

    it('returns 400 for invalid URL format', async () => {
      const res = await request(app).get('/api/v1/favicon?url=not-a-url');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid URL');
    });
  });

  describe('GET /api/v1/og', () => {
    it('returns 400 when url is missing', async () => {
      const res = await request(app).get('/api/v1/og');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing');
    });

    it('returns 400 for invalid URL format', async () => {
      const res = await request(app).get('/api/v1/og?url=ftp://invalid');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid URL');
    });
  });

  describe('GET /api/v1/og/image', () => {
    it('returns 400 when url is missing', async () => {
      const res = await request(app).get('/api/v1/og/image');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing');
    });
  });

  describe('GET /api/v1/meta', () => {
    it('returns 400 when url is missing', async () => {
      const res = await request(app).get('/api/v1/meta');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing');
    });
  });

  describe('GET /api/v1/generate', () => {
    it('returns 400 when title is missing', async () => {
      const res = await request(app).get('/api/v1/generate');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing');
    });

    it('generates an image with title parameter', async () => {
      const res = await request(app).get('/api/v1/generate?title=Hello+World');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('image/png');
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('generates an image with all parameters', async () => {
      const res = await request(app).get(
        '/api/v1/generate?title=Test&subtitle=Sub&domain=test.com&bg=%231a1a2e&color=%23ffffff&accent=%23e94560'
      );
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('image/png');
    });
  });

  describe('POST /api/v1/keys', () => {
    it('creates a new API key', async () => {
      const res = await request(app)
        .post('/api/v1/keys')
        .send({ name: 'Test Key' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.key.key).toMatch(/^og_free_/);
      expect(res.body.key.name).toBe('Test Key');
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/v1/keys').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/stats', () => {
    it('returns usage statistics', async () => {
      const res = await request(app).get('/api/v1/stats');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('usage');
      expect(res.body).toHaveProperty('cache');
    });
  });

  describe('Authentication', () => {
    it('rejects invalid API keys', async () => {
      const res = await request(app)
        .get('/api/v1/og?url=https://example.com')
        .set('X-API-Key', 'invalid_key');
      expect(res.status).toBe(401);
    });

    it('includes rate limit headers', async () => {
      const res = await request(app).get('/api/v1/stats');
      expect(res.headers).toHaveProperty('x-ratelimit-limit');
      expect(res.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });
});
