process.env.JWT_SECRET = 'test-secret-32-chars-minimum-here';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

jest.mock('../../src/utils/db', () => ({
  prisma: {
    investmentAccount: { findFirst: jest.fn() },
    transaction: { findMany: jest.fn() },
    dividendPayment: { findMany: jest.fn() },
  },
}));

const { prisma } = require('../../src/utils/db');
const { getPortfolio } = require('../../src/controllers/portfolioController');

describe('Portfolio Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 404 when no account found', async () => {
    prisma.investmentAccount.findFirst.mockResolvedValue(null);
    const req = { user: { id: 'user1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await getPortfolio(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns portfolio summary with positions', async () => {
    prisma.investmentAccount.findFirst.mockResolvedValue({
      id: 'acc1',
      accountNumber: 'IG00000001',
      baseCurrency: 'USD',
      balances: [{ currency: 'USD', available: '5000', reserved: '0' }],
      positions: [
        {
          id: 'pos1', assetId: 'asset1', quantity: '10', avgCostPrice: '150.00', totalInvested: '1500.00', realizedPnl: '0',
          asset: {
            symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', logoUrl: null, currency: 'USD',
            price: { price: '165.00', previousClose: '160.00' },
          },
        },
      ],
    });

    const req = { user: { id: 'user1' } };
    const res = { json: jest.fn() };
    await getPortfolio(req, res);
    const body = res.json.mock.calls[0][0];
    expect(body).toHaveProperty('summary');
    expect(body.summary.totalValue).toBe('1650.00');
    expect(body.positions).toHaveLength(1);
    expect(body.positions[0].symbol).toBe('AAPL');
  });
});
