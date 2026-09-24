import Decimal from "decimal.js";
import { db } from "@/lib/db";
import { OrderSide, OrderStatus, OrderType, TradeReason, TransactionType } from "@/generated/prisma/client";
import { convertToBase, estimatedTotal, orderFee, weightedAvgPrice } from "@/lib/money";
import { getMarketDataProvider } from "./market-data";

export interface BrokerAccountView {
  accountNumber: string;
  status: string;
  buyingPower: Decimal;
  cashBalance: Decimal;
  portfolioValue: Decimal;
  totalValue: Decimal;
}

export interface BrokerPosition {
  assetId: string;
  symbol: string;
  name: string;
  currency: string;
  quantity: Decimal;
  avgPrice: Decimal;
  currentPrice: Decimal;
  marketValue: Decimal;
  /** marketValue converted to the account's base currency (KES) — the only figure safe to sum across positions. */
  marketValueBase: Decimal;
  unrealizedPnl: Decimal;
  unrealizedPnlPercent: Decimal;
  allocationPercent: Decimal;
  dayChangeAmount: Decimal;
  /** dayChangeAmount converted to KES — safe to sum across positions of different currencies. */
  dayChangeAmountBase: Decimal;
  dayChangePercent: Decimal;
}

export interface CreateOrderInput {
  userId: string;
  assetId: string;
  side: OrderSide;
  type: OrderType;
  quantity: Decimal.Value;
  limitPrice?: Decimal.Value;
  reason?: TradeReason;
}

export interface BrokerOrderView {
  id: string;
  assetId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: Decimal;
  limitPrice: Decimal | null;
  estimatedTotal: Decimal;
  fee: Decimal;
  status: OrderStatus;
  filledAt: Date | null;
  filledPrice: Decimal | null;
  createdAt: Date;
  tradeId: string | null;
}

export class InsufficientBuyingPowerError extends Error {
  constructor() {
    super("Not enough buying power for this order.");
    this.name = "InsufficientBuyingPowerError";
  }
}

export class InsufficientSharesError extends Error {
  constructor() {
    super("Not enough shares held to sell this quantity.");
    this.name = "InsufficientSharesError";
  }
}

/**
 * Abstraction over order execution and account/position state. The trading
 * UI, portfolio pages, and order book only ever talk to this interface —
 * swapping MockBrokerService for a real licensed broker later requires no
 * changes outside `providers/`.
 */
export interface BrokerService {
  getAccount(userId: string): Promise<BrokerAccountView>;
  getBuyingPower(userId: string): Promise<Decimal>;
  getPositions(userId: string): Promise<BrokerPosition[]>;
  createOrder(input: CreateOrderInput): Promise<BrokerOrderView>;
  cancelOrder(userId: string, orderId: string): Promise<BrokerOrderView>;
  getOrder(userId: string, orderId: string): Promise<BrokerOrderView | null>;
  getOrders(userId: string): Promise<BrokerOrderView[]>;
}

function toOrderView(order: {
  id: string;
  assetId: string;
  asset: { symbol: string };
  side: OrderSide;
  type: OrderType;
  quantity: unknown;
  limitPrice: unknown;
  estimatedTotal: unknown;
  fee: unknown;
  status: OrderStatus;
  filledAt: Date | null;
  filledPrice: unknown;
  createdAt: Date;
  tradeId?: string | null;
}): BrokerOrderView {
  return {
    id: order.id,
    assetId: order.assetId,
    symbol: order.asset.symbol,
    side: order.side,
    type: order.type,
    quantity: new Decimal(String(order.quantity)),
    limitPrice: order.limitPrice ? new Decimal(String(order.limitPrice)) : null,
    estimatedTotal: new Decimal(String(order.estimatedTotal)),
    fee: new Decimal(String(order.fee)),
    status: order.status,
    filledAt: order.filledAt,
    filledPrice: order.filledPrice ? new Decimal(String(order.filledPrice)) : null,
    createdAt: order.createdAt,
    tradeId: order.tradeId ?? null,
  };
}

export class MockBrokerService implements BrokerService {
  async getAccount(userId: string): Promise<BrokerAccountView> {
    const [account, wallet, positions] = await Promise.all([
      db.account.findUniqueOrThrow({ where: { userId } }),
      db.wallet.findUniqueOrThrow({ where: { userId } }),
      this.getPositions(userId),
    ]);
    const portfolioValue = positions.reduce((sum, p) => sum.plus(p.marketValueBase), new Decimal(0));
    const cashBalance = new Decimal(wallet.cashBalance.toString());
    return {
      accountNumber: account.accountNumber,
      status: account.status,
      buyingPower: cashBalance,
      cashBalance,
      portfolioValue,
      totalValue: cashBalance.plus(portfolioValue),
    };
  }

  async getBuyingPower(userId: string): Promise<Decimal> {
    const wallet = await db.wallet.findUniqueOrThrow({ where: { userId } });
    return new Decimal(wallet.cashBalance.toString());
  }

  async getPositions(userId: string): Promise<BrokerPosition[]> {
    const holdings = await db.holding.findMany({ where: { userId }, include: { asset: true } });
    const provider = getMarketDataProvider();
    const withPrices = await Promise.all(
      holdings.map(async (h) => {
        const quote = await provider.getQuote(h.asset.symbol);
        const quantity = new Decimal(h.quantity.toString());
        const avgPrice = new Decimal(h.avgPrice.toString());
        const marketValue = quantity.mul(quote.price);
        const marketValueBase = convertToBase(marketValue, h.asset.currency);
        const costBasis = quantity.mul(avgPrice);
        const unrealizedPnl = marketValue.minus(costBasis);
        const dayChangeAmount = quote.change.mul(quantity);
        return {
          assetId: h.assetId,
          symbol: h.asset.symbol,
          name: h.asset.name,
          currency: h.asset.currency,
          quantity,
          avgPrice,
          currentPrice: quote.price,
          marketValue,
          marketValueBase,
          unrealizedPnl,
          unrealizedPnlPercent: costBasis.isZero() ? new Decimal(0) : unrealizedPnl.div(costBasis).mul(100),
          allocationPercent: new Decimal(0), // filled in below once total is known
          dayChangeAmount,
          dayChangeAmountBase: convertToBase(dayChangeAmount, h.asset.currency),
          dayChangePercent: quote.changePercent,
        };
      }),
    );
    const total = withPrices.reduce((sum, p) => sum.plus(p.marketValueBase), new Decimal(0));
    return withPrices.map((p) => ({
      ...p,
      allocationPercent: total.isZero() ? new Decimal(0) : p.marketValueBase.div(total).mul(100),
    }));
  }

  async createOrder(input: CreateOrderInput): Promise<BrokerOrderView> {
    const quantity = new Decimal(input.quantity);
    if (quantity.lte(0)) throw new Error("Quantity must be greater than zero.");

    const provider = getMarketDataProvider();
    const asset = await db.asset.findUniqueOrThrow({ where: { id: input.assetId } });
    const quote = await provider.getQuote(asset.symbol);

    const limitPrice = input.limitPrice !== undefined ? new Decimal(input.limitPrice) : null;
    const referencePrice = input.type === "LIMIT" && limitPrice ? limitPrice : quote.price;
    const total = estimatedTotal(quantity, referencePrice);
    const fee = orderFee(total);

    const willFillNow =
      input.type === "MARKET" ||
      (input.side === "BUY" && limitPrice !== null && limitPrice.gte(quote.price)) ||
      (input.side === "SELL" && limitPrice !== null && limitPrice.lte(quote.price));
    const fillPrice = input.type === "MARKET" ? quote.price : (limitPrice as Decimal);

    const result = await db.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId: input.userId } });
      const cashBalance = new Decimal(wallet.cashBalance.toString());

      if (input.side === "BUY") {
        const required = total.plus(fee);
        if (cashBalance.lt(required)) throw new InsufficientBuyingPowerError();
      } else {
        const holding = await tx.holding.findUnique({
          where: { userId_assetId: { userId: input.userId, assetId: input.assetId } },
        });
        const held = holding ? new Decimal(holding.quantity.toString()) : new Decimal(0);
        if (held.lt(quantity)) throw new InsufficientSharesError();
      }

      const order = await tx.order.create({
        data: {
          userId: input.userId,
          assetId: input.assetId,
          side: input.side,
          type: input.type,
          quantity: quantity.toString(),
          limitPrice: limitPrice?.toString(),
          estimatedTotal: total.toString(),
          fee: fee.toString(),
          reason: input.reason,
          status: willFillNow ? "FILLED" : "OPEN",
          filledAt: willFillNow ? new Date() : null,
          filledPrice: willFillNow ? fillPrice.toString() : null,
        },
        include: { asset: true },
      });

      let tradeId: string | null = null;
      if (willFillNow) {
        const trade = await tx.trade.create({
          data: {
            orderId: order.id,
            userId: input.userId,
            assetId: input.assetId,
            side: input.side,
            quantity: quantity.toString(),
            price: fillPrice.toString(),
            fee: fee.toString(),
          },
        });
        tradeId = trade.id;

        const filledTotal = quantity.mul(fillPrice);
        const cashDelta =
          input.side === "BUY" ? filledTotal.plus(fee).neg() : filledTotal.minus(fee);
        await tx.wallet.update({
          where: { userId: input.userId },
          data: { cashBalance: cashBalance.plus(cashDelta).toString() },
        });
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: input.side === "BUY" ? TransactionType.TRADE_BUY : TransactionType.TRADE_SELL,
            amount: cashDelta.toString(),
            description: `${input.side} ${quantity.toString()} ${asset.symbol} @ ${fillPrice.toString()}`,
            relatedOrderId: order.id,
          },
        });

        const existingHolding = await tx.holding.findUnique({
          where: { userId_assetId: { userId: input.userId, assetId: input.assetId } },
        });

        if (input.side === "BUY") {
          if (existingHolding) {
            const newAvg = weightedAvgPrice(
              existingHolding.quantity.toString(),
              existingHolding.avgPrice.toString(),
              quantity,
              fillPrice,
            );
            const newQty = new Decimal(existingHolding.quantity.toString()).plus(quantity);
            await tx.holding.update({
              where: { id: existingHolding.id },
              data: { quantity: newQty.toString(), avgPrice: newAvg.toString() },
            });
          } else {
            await tx.holding.create({
              data: {
                userId: input.userId,
                assetId: input.assetId,
                quantity: quantity.toString(),
                avgPrice: fillPrice.toString(),
              },
            });
          }
        } else if (existingHolding) {
          const remaining = new Decimal(existingHolding.quantity.toString()).minus(quantity);
          if (remaining.lte(0)) {
            await tx.holding.delete({ where: { id: existingHolding.id } });
          } else {
            await tx.holding.update({ where: { id: existingHolding.id }, data: { quantity: remaining.toString() } });
          }
        }
      }

      await tx.notification.create({
        data: {
          userId: input.userId,
          type: "ORDER_FILLED",
          title: willFillNow ? "Order filled" : "Order placed",
          body: `${input.side} ${quantity.toString()} ${asset.symbol} ${willFillNow ? "filled" : "is open"} ${willFillNow ? `@ ${fillPrice.toString()}` : `(limit ${limitPrice?.toString()})`}`,
          link: "/orders",
        },
      });

      return { ...order, tradeId };
    });

    return toOrderView(result);
  }

  async cancelOrder(userId: string, orderId: string): Promise<BrokerOrderView> {
    const order = await db.order.findFirstOrThrow({ where: { id: orderId, userId }, include: { asset: true } });
    if (order.status !== "OPEN" && order.status !== "PENDING") {
      throw new Error("Only open orders can be cancelled.");
    }
    const updated = await db.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: { asset: true },
    });
    return toOrderView(updated);
  }

  async getOrder(userId: string, orderId: string): Promise<BrokerOrderView | null> {
    const order = await db.order.findFirst({ where: { id: orderId, userId }, include: { asset: true } });
    return order ? toOrderView(order) : null;
  }

  async getOrders(userId: string): Promise<BrokerOrderView[]> {
    const orders = await db.order.findMany({
      where: { userId },
      include: { asset: true },
      orderBy: { createdAt: "desc" },
    });
    return orders.map(toOrderView);
  }
}

export function getBrokerService(): BrokerService {
  return new MockBrokerService();
}
