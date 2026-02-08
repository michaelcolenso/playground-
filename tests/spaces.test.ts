import request from 'supertest';
import { createApp } from '../src/index';
import { initializeDatabase, closeDatabase } from '../src/database';
import { config } from '../src/config';

config.dbPath = ':memory:';

let app: ReturnType<typeof createApp>;
let token: string;

beforeAll(async () => {
  initializeDatabase();
  app = createApp();
  const res = await request(app).post('/api/auth/register').send({
    name: 'Space Tester', email: 'spaces@test.com', password: 'securepass123',
  });
  token = res.body.token;
});
afterAll(() => closeDatabase());

describe('Spaces API', () => {
  let spaceId: string;

  it('creates a space', async () => {
    const res = await request(app)
      .post('/api/spaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My SaaS', slug: 'my-saas', brandColor: '#ec4899' });
    expect(res.status).toBe(201);
    expect(res.body.space.name).toBe('My SaaS');
    expect(res.body.space.slug).toBe('my-saas');
    expect(res.body.space.brand_color).toBe('#ec4899');
    spaceId = res.body.space.id;
  });

  it('rejects duplicate slug', async () => {
    const res = await request(app)
      .post('/api/spaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Another', slug: 'my-saas' });
    expect(res.status).toBe(409);
  });

  it('rejects invalid slug', async () => {
    const res = await request(app)
      .post('/api/spaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', slug: 'Bad Slug!' });
    expect(res.status).toBe(400);
  });

  it('enforces free tier space limit', async () => {
    // Already created 1 space, free limit is 1
    const res = await request(app)
      .post('/api/spaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Second', slug: 'second' });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/limit/i);
  });

  it('lists spaces with counts', async () => {
    const res = await request(app)
      .get('/api/spaces')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.spaces).toHaveLength(1);
    expect(res.body.spaces[0].testimonialCount).toBeDefined();
  });

  it('gets a single space', async () => {
    const res = await request(app)
      .get(`/api/spaces/${spaceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.space.id).toBe(spaceId);
  });

  it('updates a space', async () => {
    const res = await request(app)
      .put(`/api/spaces/${spaceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated SaaS', brandColor: '#10b981' });
    expect(res.status).toBe(200);
    expect(res.body.space.name).toBe('Updated SaaS');
    expect(res.body.space.brand_color).toBe('#10b981');
  });

  it('returns 404 for non-existent space', async () => {
    const res = await request(app)
      .get('/api/spaces/fake-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('deletes a space', async () => {
    const res = await request(app)
      .delete(`/api/spaces/${spaceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const check = await request(app)
      .get(`/api/spaces/${spaceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(check.status).toBe(404);
  });
});
