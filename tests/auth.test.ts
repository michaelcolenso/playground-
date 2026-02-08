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

describe('Auth API', () => {
  const user = { name: 'Jane', email: 'jane@example.com', password: 'securepass123' };

  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.plan).toBe('free');
    expect(res.body.user.apiKey).toMatch(/^pr_/);
    expect(res.body.token).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...user, email: 'new@x.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('gets profile with Bearer token', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
  });

  it('gets profile with API key', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    const res = await request(app).get('/api/auth/me').set('X-API-Key', login.body.user.apiKey);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('regenerates API key', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    const oldKey = login.body.user.apiKey;
    const res = await request(app).post('/api/auth/api-key/regenerate').set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.apiKey).toMatch(/^pr_/);
    expect(res.body.apiKey).not.toBe(oldKey);
  });
});
