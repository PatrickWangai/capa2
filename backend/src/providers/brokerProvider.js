/**
 * BrokerProvider Interface
 *
 * Swap MockBrokerProvider for a real integration (Alpaca, DriveWealth, Saxo, etc.)
 * by implementing this interface. The service layer never touches provider internals.
 */

/**
 * @typedef {Object} BrokerOrder
 * @property {string} symbol
 * @property {'buy'|'sell'} side
 * @property {'market'|'limit'|'stop'|'stop_limit'} type
 * @property {number} quantity
 * @property {number} [limitPrice]
 * @property {string} [clientOrderId]
 */

/**
 * @typedef {Object} BrokerOrderResult
 * @property {string} brokerOrderId
 * @property {'pending'|'open'|'filled'|'cancelled'|'rejected'} status
 * @property {number} [filledQty]
 * @property {number} [avgFillPrice]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} BrokerPosition
 * @property {string} symbol
 * @property {number} quantity
 * @property {number} avgCostPrice
 * @property {number} currentPrice
 * @property {number} marketValue
 * @property {number} unrealizedPnl
 */

export class BrokerProvider {
  /** @param {BrokerOrder} order @returns {Promise<BrokerOrderResult>} */
  async buy(order) { throw new Error('Not implemented'); }

  /** @param {BrokerOrder} order @returns {Promise<BrokerOrderResult>} */
  async sell(order) { throw new Error('Not implemented'); }

  /** @param {string} brokerOrderId @returns {Promise<BrokerOrderResult>} */
  async cancelOrder(brokerOrderId) { throw new Error('Not implemented'); }

  /** @param {string} brokerOrderId @returns {Promise<BrokerOrderResult>} */
  async getOrder(brokerOrderId) { throw new Error('Not implemented'); }

  /** @returns {Promise<BrokerPosition[]>} */
  async getPositions() { throw new Error('Not implemented'); }

  /** @param {string} symbol @returns {Promise<number>} */
  async marketPrice(symbol) { throw new Error('Not implemented'); }

  /** @returns {Promise<{isOpen: boolean, nextOpenAt: string}>} */
  async marketStatus() { throw new Error('Not implemented'); }
}

// ── Mock Implementation ───────────────────────────────────────────────────────
// Replace this with a real provider (Alpaca, DriveWealth, Saxo, etc.).
// TODO: Wire to real broker when regulated brokerage account is established.

export class MockBrokerProvider extends BrokerProvider {
  constructor() {
    super();
    this._orders  = new Map();
    this._counter = 1000;
  }

  async buy(order) {
    return this._createOrder({ ...order, side: 'buy' });
  }

  async sell(order) {
    return this._createOrder({ ...order, side: 'sell' });
  }

  _createOrder(order) {
    const id     = `MOCK-${++this._counter}`;
    const result = {
      brokerOrderId: id,
      status:        'filled',
      filledQty:     order.quantity,
      avgFillPrice:  order.limitPrice ?? this._mockPrice(order.symbol),
      createdAt:     new Date().toISOString(),
    };
    this._orders.set(id, result);
    return Promise.resolve(result);
  }

  async cancelOrder(brokerOrderId) {
    const order = this._orders.get(brokerOrderId);
    if (!order) return { brokerOrderId, status: 'cancelled' };
    order.status = 'cancelled';
    return order;
  }

  async getOrder(brokerOrderId) {
    return this._orders.get(brokerOrderId) ?? { brokerOrderId, status: 'pending' };
  }

  async getPositions() {
    return [];
  }

  async marketPrice(symbol) {
    return this._mockPrice(symbol);
  }

  async marketStatus() {
    const now = new Date();
    const h   = now.getUTCHours();
    const isOpen = h >= 14 && h < 21; // ~NYSE hours UTC
    return { isOpen, nextOpenAt: isOpen ? null : '09:30 ET' };
  }

  _mockPrice(symbol) {
    // Deterministic seed based on symbol so price is stable
    const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return parseFloat((50 + (seed % 500)).toFixed(2));
  }
}

export default new MockBrokerProvider();
