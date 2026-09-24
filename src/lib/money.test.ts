import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import {
  orderFee,
  estimatedTotal,
  marketValue,
  costBasis,
  unrealizedPnl,
  unrealizedPnlPercent,
  weightedAvgPrice,
  convertToBase,
  formatMoney,
  formatPercent,
  formatQuantity,
} from "./money";

describe("orderFee", () => {
  it("charges 0.5% of the order total when that exceeds the floor", () => {
    expect(orderFee(10000).toString()).toBe("50");
  });

  it("floors at KES 10 for small orders", () => {
    expect(orderFee(100).toString()).toBe("10");
    expect(orderFee(0).toString()).toBe("10");
  });

  it("is exactly at the floor boundary at 2000 (0.5% of 2000 = 10)", () => {
    expect(orderFee(2000).toString()).toBe("10");
  });
});

describe("estimatedTotal / marketValue / costBasis", () => {
  it("multiplies quantity by price", () => {
    expect(estimatedTotal(10, 28.5).toString()).toBe("285");
    expect(marketValue(10, 28.5).toString()).toBe("285");
    expect(costBasis(10, 25).toString()).toBe("250");
  });

  it("handles fractional shares", () => {
    expect(estimatedTotal("2.5", "100").toString()).toBe("250");
  });
});

describe("unrealizedPnl", () => {
  it("is positive when current price exceeds average price", () => {
    const pnl = unrealizedPnl(10, 20, 25);
    expect(pnl.toString()).toBe("50");
  });

  it("is negative when current price is below average price", () => {
    const pnl = unrealizedPnl(10, 25, 20);
    expect(pnl.toString()).toBe("-50");
  });

  it("computes percent relative to average price", () => {
    expect(unrealizedPnlPercent(20, 25).toString()).toBe("25");
  });

  it("returns zero percent instead of dividing by zero when average price is zero", () => {
    expect(unrealizedPnlPercent(0, 25).toNumber()).toBe(0);
  });
});

describe("weightedAvgPrice", () => {
  it("computes the new cost basis after adding to a position", () => {
    // 10 shares @ 20 + 10 shares @ 30 => 20 shares @ 25
    const avg = weightedAvgPrice(10, 20, 10, 30);
    expect(avg.toString()).toBe("25");
  });

  it("weights larger additions more heavily", () => {
    // 10 @ 10 + 30 @ 20 = 100 + 600 = 700 / 40 = 17.5
    const avg = weightedAvgPrice(10, 10, 30, 20);
    expect(avg.toString()).toBe("17.5");
  });

  it("returns zero when the resulting position size is zero", () => {
    const avg = weightedAvgPrice(0, 0, 0, 100);
    expect(avg.toNumber()).toBe(0);
  });
});

describe("convertToBase", () => {
  it("passes KES through unchanged", () => {
    expect(convertToBase(1000, "KES").toString()).toBe("1000");
  });

  it("converts USD to KES using the fixed illustrative rate", () => {
    expect(convertToBase(100, "USD").toString()).toBe("12900");
  });

  it("makes cross-currency sums additive instead of nonsensical", () => {
    // The bug this guards against: summing a $100 position directly with a
    // KES 1000 position must not equal 1100 — they need a common base first.
    const usdPosition = convertToBase(100, "USD");
    const kesPosition = convertToBase(1000, "KES");
    const total = usdPosition.plus(kesPosition);
    expect(total.toString()).toBe("13900");
    expect(total.toNumber()).not.toBe(1100);
  });

  it("falls back to a 1:1 rate for an unknown currency rather than throwing", () => {
    expect(convertToBase(500, "ZAR" as never).toString()).toBe("500");
  });
});

describe("formatMoney", () => {
  it("formats KES with two decimal places", () => {
    expect(formatMoney(1234.5)).toContain("1,234.50");
  });

  it("formats a Decimal instance the same as a number", () => {
    expect(formatMoney(new Decimal("1234.5"))).toBe(formatMoney(1234.5));
  });
});

describe("formatPercent", () => {
  it("adds a plus sign for positive values when signed is requested", () => {
    expect(formatPercent(5.2, { signed: true })).toBe("+5.20%");
  });

  it("does not add a plus sign for negative values", () => {
    expect(formatPercent(-5.2, { signed: true })).toBe("-5.20%");
  });

  it("omits the sign entirely by default", () => {
    expect(formatPercent(5.2)).toBe("5.20%");
  });
});

describe("formatQuantity", () => {
  it("renders whole numbers without unnecessary decimals", () => {
    expect(formatQuantity(500)).toBe("500");
  });

  it("keeps up to four fractional decimal places", () => {
    expect(formatQuantity("2.5")).toBe("2.5");
  });
});
