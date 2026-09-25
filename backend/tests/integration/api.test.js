const request = require('supertest');

// Full integration test (requires real DB - skip in CI without DB)
const SKIP = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('test@localhost');

describe('API Integration', () => {
  let app;

  beforeAll(() => {
    if (SKIP) return;
    process.env.JWT_SECRET = 'integration-test-secret-min-32chars';
    process.env.JWT_REFRESH_SECRET = 'integration-refresh-secret-32chars';
    app = require('../../src/index');
  });

  describe('GET /health', () => {
    it('returns 200 ok', async () => {
      if (SKIP) return;
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/auth/register', () => {
    it('validates required fields', async () => {
      if (SKIP) return;
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
    });

    it('registers a new user', async () => {
      if (SKIP) return;
      const res = await request(app).post('/api/auth/register').send({
        email: `test-${Date.now()}@test.com`,
        password: 'Test1234!',
        firstName: 'Test',
        lastName: 'User',
        country: 'US',
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
    });
  });
});
