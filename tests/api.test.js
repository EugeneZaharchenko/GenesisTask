process.env.API_KEY = 'test-api-key';
process.env.DB_PATH = './test.db';

const request = require('supertest');
const app = require('../src/app');

const headers = { 'X-API-Key': 'test-api-key' };

describe('GET /health', () => {
  test('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/subscribe', () => {
  test('returns 400 for missing email', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .set(headers)
      .send({ repo: 'expressjs/express' });
    expect(res.status).toBe(400);
  });

  test('returns 400 for invalid repo format', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .set(headers)
      .send({ email: 'user@example.com', repo: 'not-valid' });
    expect(res.status).toBe(400);
  });

  test('returns 401 without API key', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .send({ email: 'user@example.com', repo: 'expressjs/express' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/confirm/:token', () => {
  test('returns 404 for unknown token', async () => {
    const res = await request(app)
      .get('/api/confirm/nonexistent-token')
      .set(headers);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/unsubscribe/:token', () => {
  test('returns 404 for unknown token', async () => {
    const res = await request(app)
      .get('/api/unsubscribe/nonexistent-token')
      .set(headers);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/subscriptions', () => {
  test('returns 400 for missing email', async () => {
    const res = await request(app)
      .get('/api/subscriptions')
      .set(headers);
    expect(res.status).toBe(400);
  });

  test('returns 400 for invalid email', async () => {
    const res = await request(app)
      .get('/api/subscriptions?email=notanemail')
      .set(headers);
    expect(res.status).toBe(400);
  });

  test('returns empty list for unknown email', async () => {
    const res = await request(app)
      .get('/api/subscriptions?email=nobody@example.com')
      .set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });
});
