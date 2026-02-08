import request from 'supertest';
import { createApp } from '../src/index';
import { initializeDatabase, closeDatabase } from '../src/database';
import { config } from '../src/config';

config.dbPath = ':memory:';

let app: ReturnType<typeof createApp>;
let authToken: string;
let userId: string;

beforeAll(async () => {
  initializeDatabase();
  app = createApp();

  // Create a test user
  const res = await request(app).post('/api/auth/register').send({
    name: 'Monitor Tester',
    email: 'monitors@example.com',
    password: 'securepassword123',
  });
  authToken = res.body.token;
  userId = res.body.user.id;
});

afterAll(() => {
  closeDatabase();
});

describe('Monitors API', () => {
  let monitorId: string;

  describe('POST /api/monitors', () => {
    it('should create a monitor', async () => {
      const res = await request(app)
        .post('/api/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Website',
          url: 'https://example.com',
          checkInterval: 60,
        });
      expect(res.status).toBe(201);
      expect(res.body.monitor).toBeDefined();
      expect(res.body.monitor.name).toBe('My Website');
      expect(res.body.monitor.url).toBe('https://example.com');
      expect(res.body.monitor.status).toBe('unknown');
      monitorId = res.body.monitor.id;
    });

    it('should reject invalid URL', async () => {
      const res = await request(app)
        .post('/api/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Bad', url: 'not-a-url' });
      expect(res.status).toBe(400);
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' });
      expect(res.status).toBe(400);
    });

    it('should enforce free tier monitor limit', async () => {
      // Already created 1 monitor, create 2 more to hit limit
      await request(app)
        .post('/api/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Monitor 2', url: 'https://example2.com' });

      await request(app)
        .post('/api/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Monitor 3', url: 'https://example3.com' });

      // This 4th should fail
      const res = await request(app)
        .post('/api/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Monitor 4', url: 'https://example4.com' });
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/limit/i);
    });
  });

  describe('GET /api/monitors', () => {
    it('should list all monitors', async () => {
      const res = await request(app)
        .get('/api/monitors')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.monitors).toBeDefined();
      expect(res.body.monitors.length).toBe(3);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/monitors');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/monitors/:id', () => {
    it('should get a monitor with checks and uptime', async () => {
      const res = await request(app)
        .get(`/api/monitors/${monitorId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.monitor).toBeDefined();
      expect(res.body.recentChecks).toBeDefined();
      expect(res.body.uptime).toBeDefined();
      expect(res.body.uptime['24h']).toBeDefined();
    });

    it('should return 404 for non-existent monitor', async () => {
      const res = await request(app)
        .get('/api/monitors/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/monitors/:id', () => {
    it('should update a monitor', async () => {
      const res = await request(app)
        .put(`/api/monitors/${monitorId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Website', checkInterval: 120 });
      expect(res.status).toBe(200);
      expect(res.body.monitor.name).toBe('Updated Website');
    });
  });

  describe('DELETE /api/monitors/:id', () => {
    it('should delete a monitor', async () => {
      const res = await request(app)
        .delete(`/api/monitors/${monitorId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);

      // Verify deletion
      const check = await request(app)
        .get(`/api/monitors/${monitorId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(check.status).toBe(404);
    });
  });
});
