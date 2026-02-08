import request from 'supertest';
import { createApp } from '../src/index';
import { initializeDatabase, closeDatabase } from '../src/database';
import { config } from '../src/config';

config.dbPath = ':memory:';

let app: ReturnType<typeof createApp>;
let token: string;
let spaceId: string;

beforeAll(async () => {
  initializeDatabase();
  app = createApp();
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User', email: 'testimonials@test.com', password: 'securepass123',
  });
  token = res.body.token;

  const space = await request(app)
    .post('/api/spaces')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'TestProduct', slug: 'testproduct' });
  spaceId = space.body.space.id;
});
afterAll(() => closeDatabase());

describe('Testimonials API', () => {
  let testimonialId: string;

  it('creates a testimonial via API', async () => {
    const res = await request(app)
      .post('/api/testimonials')
      .set('Authorization', `Bearer ${token}`)
      .send({
        spaceId,
        authorName: 'Sarah Chen',
        authorTitle: 'CEO',
        authorCompany: 'Acme',
        content: 'Absolutely amazing product!',
        rating: 5,
      });
    expect(res.status).toBe(201);
    expect(res.body.testimonial.author_name).toBe('Sarah Chen');
    expect(res.body.testimonial.status).toBe('approved'); // API-created = auto-approved
    expect(res.body.testimonial.source).toBe('api');
    testimonialId = res.body.testimonial.id;
  });

  it('lists testimonials for a space', async () => {
    const res = await request(app)
      .get(`/api/testimonials/space/${spaceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.testimonials).toHaveLength(1);
  });

  it('filters testimonials by status', async () => {
    const res = await request(app)
      .get(`/api/testimonials/space/${spaceId}?status=pending`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.testimonials).toHaveLength(0);
  });

  it('features a testimonial', async () => {
    const res = await request(app)
      .patch(`/api/testimonials/${testimonialId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isFeatured: true });
    expect(res.status).toBe(200);
    expect(res.body.testimonial.is_featured).toBe(1);
  });

  it('rejects a testimonial', async () => {
    const res = await request(app)
      .patch(`/api/testimonials/${testimonialId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'rejected' });
    expect(res.status).toBe(200);
    expect(res.body.testimonial.status).toBe('rejected');
  });

  it('deletes a testimonial', async () => {
    const res = await request(app)
      .delete(`/api/testimonials/${testimonialId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('Public Collection Form', () => {
  it('renders the collection form', async () => {
    const res = await request(app).get('/api/testimonials/collect/testproduct');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('TestProduct');
    expect(res.text).toContain('Praised');
  });

  it('accepts form submissions via JSON', async () => {
    const res = await request(app)
      .post('/api/testimonials/collect/testproduct')
      .send({ authorName: 'Public User', content: 'Great stuff!', rating: 4 });
    expect(res.status).toBe(201);
    expect(res.body.message).toContain('submitted');
  });

  it('rejects submission without required fields', async () => {
    const res = await request(app)
      .post('/api/testimonials/collect/testproduct')
      .send({ authorName: 'Test' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent slug', async () => {
    const res = await request(app).get('/api/testimonials/collect/nonexistent');
    expect(res.status).toBe(404);
  });

  it('submitted testimonials are pending by default', async () => {
    const res = await request(app)
      .get(`/api/testimonials/space/${spaceId}?status=pending`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.testimonials.length).toBeGreaterThanOrEqual(1);
    expect(res.body.testimonials[0].source).toBe('form');
  });
});
