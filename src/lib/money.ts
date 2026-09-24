import Decimal from "decimal.js";

/**
 * Centralized financial math. Every money/quantity value in the app should
 * pass through here rather than through native JS numbers or operators —
 * floating point cannot be trusted with balances, fees, or share counts.
 */

export type Money = Decimal.Value;

export function toDecimal(value: Money): Decimal {
  return new Decimal(value);
}

/**
 * Fixed illustrative FX rates to KES, the account/wallet base currency.
 * Only used to make cross-currency aggregates (portfolio totals, P/L)
 * additive — never shown to the user as a live exchange rate.
 */
const FX_TO_KES: Record<string, number> = {
  KES: 1,
  USD: 129,
  GBP: 163,
};

export function convertToBase(amount: Money, currency: string): Decimal {
  const rate = FX_TO_KES[currency] ?? 1;
  return toDecimal(amount).mul(rate);
}

export function orderFee(estimatedTotal: Money): Decimal {
  // Flat 0.5% commission, floored at KES 10 — a placeholder fee schedule
  // until a real broker's fee schedule replaces MockBrokerService.
  const total = toDecimal(estimatedTotal);
  const pct = total.mul("0.005");
  return Decimal.max(pct, "10");
}

export function estimatedTotal(quantity: Money, price: Money): Decimal {
  return toDecimal(quantity).mul(price);
}

export function marketValue(quantity: Money, currentPrice: Money): Decimal {
  return toDecimal(quantity).mul(currentPrice);
}

export function costBasis(quantity: Money, avgPrice: Money): Decimal {
  return toDecimal(quantity).mul(avgPrice);
}

export function unrealizedPnl(quantity: Money, avgPrice: Money, currentPrice: Money): Decimal {
  return marketValue(quantity, currentPrice).minus(costBasis(quantity, avgPrice));
}

export function unrealizedPnlPercent(avgPrice: Money, currentPrice: Money): Decimal {
  const avg = toDecimal(avgPrice);
  if (avg.isZero()) return new Decimal(0);
  return toDecimal(currentPrice).minus(avg).div(avg).mul(100);
}

/** New weighted-average cost basis after adding to a position. */
export function weightedAvgPrice(
  existingQty: Money,
  existingAvgPrice: Money,
  addedQty: Money,
  addedPrice: Money,
): Decimal {
  const existingCost = toDecimal(existingQty).mul(existingAvgPrice);
  const addedCost = toDecimal(addedQty).mul(addedPrice);
  const totalQty = toDecimal(existingQty).plus(addedQty);
  if (totalQty.isZero()) return new Decimal(0);
  return existingCost.plus(addedCost).div(totalQty);
}

export function formatMoney(value: Money, currency: string = "KES"): string {
  const n = toDecimal(value).toDecimalPlaces(2).toNumber();
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(n)
    .replace("KES", "KES ");
}

export function formatCompactMoney(value: Money, currency: string = "KES"): string {
  const n = toDecimal(value).toNumber();
  const abs = Math.abs(n);
  const suffix = abs >= 1e9 ? "B" : abs >= 1e6 ? "M" : abs >= 1e3 ? "K" : "";
  const divisor = abs >= 1e9 ? 1e9 : abs >= 1e6 ? 1e6 : abs >= 1e3 ? 1e3 : 1;
  const short = (n / divisor).toFixed(divisor === 1 ? 2 : 1);
  return `${currency} ${short}${suffix}`;
}

export function formatPercent(value: Money, options: { signed?: boolean } = {}): string {
  const n = toDecimal(value).toDecimalPlaces(2).toNumber();
  const sign = options.signed && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function formatQuantity(value: Money): string {
  return toDecimal(value).toDecimalPlaces(4).toNumber().toLocaleString("en-US");
}
