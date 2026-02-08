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

  const reg = await request(app).post('/api/auth/register').send({
    name: 'Widget Tester', email: 'widgets@test.com', password: 'securepass123',
  });
  token = reg.body.token;

  // Create space + approved testimonial
  await request(app)
    .post('/api/spaces')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'WidgetApp', slug: 'widgetapp' });

  const space = await request(app)
    .get('/api/spaces')
    .set('Authorization', `Bearer ${token}`);
  const spaceId = space.body.spaces[0].id;

  await request(app)
    .post('/api/testimonials')
    .set('Authorization', `Bearer ${token}`)
    .send({
      spaceId,
      authorName: 'Test Author',
      content: 'Widget testimonial content here',
      rating: 5,
    });
});
afterAll(() => closeDatabase());

describe('Widget Endpoints', () => {
  it('serves embeddable JS widget', async () => {
    const res = await request(app).get('/widgets/embed/widgetapp.js');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/javascript/);
    expect(res.text).toContain('praised-widgetapp');
    expect(res.text).toContain('Test Author');
    expect(res.text).toContain('Widget testimonial content here');
    expect(res.text).toContain('Praised');
  });

  it('serves the wall of love page', async () => {
    const res = await request(app).get('/widgets/wall/widgetapp');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('Wall of Love');
    expect(res.text).toContain('Test Author');
  });

  it('serves JSON API for custom integrations', async () => {
    const res = await request(app).get('/widgets/api/widgetapp');
    expect(res.status).toBe(200);
    expect(res.body.testimonials).toHaveLength(1);
    expect(res.body.testimonials[0].author_name).toBe('Test Author');
    expect(res.body.space.slug).toBe('widgetapp');
  });

  it('returns CORS header on widget API', async () => {
    const res = await request(app).get('/widgets/api/widgetapp');
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('returns 404 for non-existent widget slug', async () => {
    const res = await request(app).get('/widgets/embed/nonexistent.js');
    expect(res.status).toBe(404);
  });
});
