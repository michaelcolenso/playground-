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
afterAll(() => closeDatabase());

describe('Core Endpoints', () => {
  it('returns health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe('1.0.0');
  });

  it('serves landing page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('Praised');
    expect(res.text).toContain('testimonial');
  });

  it('serves docs page', async () => {
    const res = await request(app).get('/docs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('API Documentation');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });

  it('returns billing info', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Billing', email: 'billing@test.com', password: 'securepass123',
    });
    const res = await request(app)
      .get('/api/billing')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.plan).toBe('free');
    expect(res.body.plans).toHaveLength(3);
    expect(res.body.usage).toBeDefined();
  });
});
