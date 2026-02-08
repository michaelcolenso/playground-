import request from 'supertest';
import { createApp } from '../src/index';
import { initializeDatabase, closeDatabase } from '../src/database';
import { config } from '../src/config';

config.dbPath = ':memory:';

let app: ReturnType<typeof createApp>;
let authToken: string;
let monitorId: string;

beforeAll(async () => {
  initializeDatabase();
  app = createApp();

  const res = await request(app).post('/api/auth/register').send({
    name: 'Status Page Tester',
    email: 'status@example.com',
    password: 'securepassword123',
  });
  authToken = res.body.token;

  // Create a monitor to include on status page
  const monRes = await request(app)
    .post('/api/monitors')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ name: 'Test Monitor', url: 'https://example.com' });
  monitorId = monRes.body.monitor.id;
});

afterAll(() => {
  closeDatabase();
});

describe('Status Pages API', () => {
  let statusPageId: string;

  describe('POST /api/status-pages', () => {
    it('should create a status page', async () => {
      const res = await request(app)
        .post('/api/status-pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Service Status',
          slug: 'my-service',
          description: 'Current system status',
          monitorIds: [monitorId],
        });
      expect(res.status).toBe(201);
      expect(res.body.statusPage).toBeDefined();
      expect(res.body.statusPage.slug).toBe('my-service');
      statusPageId = res.body.statusPage.id;
    });

    it('should reject duplicate slug', async () => {
      const res = await request(app)
        .post('/api/status-pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Another', slug: 'my-service' });
      expect(res.status).toBe(409);
    });

    it('should reject invalid slug', async () => {
      const res = await request(app)
        .post('/api/status-pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test', slug: 'Invalid Slug!' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/status-pages/public/:slug', () => {
    it('should return HTML for public status page', async () => {
      const res = await request(app).get('/api/status-pages/public/my-service');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
      expect(res.text).toContain('My Service Status');
      expect(res.text).toContain('PingBase');
    });

    it('should return JSON when requested', async () => {
      const res = await request(app)
        .get('/api/status-pages/public/my-service')
        .set('Accept', 'application/json');
      expect(res.status).toBe(200);
      expect(res.body.statusPage).toBeDefined();
      expect(res.body.monitors).toBeDefined();
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/status-pages/public/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/status-pages/:id', () => {
    it('should update a status page', async () => {
      const res = await request(app)
        .put(`/api/status-pages/${statusPageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Status', theme: 'dark' });
      expect(res.status).toBe(200);
      expect(res.body.statusPage.name).toBe('Updated Status');
    });
  });

  describe('DELETE /api/status-pages/:id', () => {
    it('should delete a status page', async () => {
      const res = await request(app)
        .delete(`/api/status-pages/${statusPageId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });
});
