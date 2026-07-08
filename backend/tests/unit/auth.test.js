const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-32-chars-minimum-here';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-chars-here';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock prisma
jest.mock('../../src/utils/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    investmentAccount: { create: jest.fn() },
    watchlist: { create: jest.fn() },
    refreshToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    userRole: { findUnique: jest.fn() },
    $transaction: jest.fn(fn => fn({
      user: { create: jest.fn() },
      investmentAccount: { create: jest.fn() },
      watchlist: { create: jest.fn() },
    })),
  },
}));
jest.mock('../../src/utils/redis', () => ({ redis: { get: jest.fn(() => null), setex: jest.fn() } }));
jest.mock('../../src/services/emailService', () => ({ sendEmail: jest.fn(), sendVerifyEmail: jest.fn().mockResolvedValue() }));

const { prisma } = require('../../src/utils/db');

describe('Auth Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('returns 409 if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id', email: 'test@test.com' });
      const req = { body: { email: 'test@test.com', password: 'Pass1234!', firstName: 'A', lastName: 'B' }, ip: '127.0.0.1', get: jest.fn(() => 'test-agent') };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const { register } = require('../../src/controllers/authController');
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });

    it('creates user and returns tokens when email is new', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create = jest.fn().mockResolvedValue({
        id: 'new-user-id', email: 'new@test.com', firstName: 'New', lastName: 'User', kycStatus: 'NOT_STARTED', status: 'PENDING',
        accounts: { create: jest.fn() }, watchlists: { create: jest.fn() },
      });
      prisma.refreshToken.create.mockResolvedValue({});

      const req = { body: { email: 'new@test.com', password: 'Pass1234!', firstName: 'New', lastName: 'User', country: 'KE' }, ip: '127.0.0.1', get: jest.fn(() => 'agent') };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const { register } = require('../../src/controllers/authController');
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      const body = res.json.mock.calls[0][0];
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
    });
  });

  describe('login', () => {
    it('returns 401 for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'uid', email: 'u@t.com', passwordHash: await bcrypt.hash('correct', 10),
        mfaEnabled: false, status: 'ACTIVE',
      });
      const req = { body: { email: 'u@t.com', password: 'wrong' }, ip: '127.0.0.1', get: jest.fn() };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const { login } = require('../../src/controllers/authController');
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns tokens for correct credentials', async () => {
      const hash = await bcrypt.hash('Pass1234!', 10);
      prisma.user.findUnique.mockResolvedValue({ id: 'uid', email: 'u@t.com', passwordHash: hash, mfaEnabled: false, status: 'ACTIVE', firstName: 'U', lastName: 'T', kycStatus: 'APPROVED' });
      prisma.user.update.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});
      const req = { body: { email: 'u@t.com', password: 'Pass1234!' }, ip: '127.0.0.1', get: jest.fn() };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const { login } = require('../../src/controllers/authController');
      await login(req, res);
      const body = res.json.mock.calls[0][0];
      expect(body).toHaveProperty('accessToken');
    });
  });
});
