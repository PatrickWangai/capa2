import { getBrokerService } from "./providers/broker";
import { getMarketDataProvider } from "./providers/market-data";
import { convertToBase } from "@/lib/money";

export interface TimeMachineInput {
  symbol: string;
  startingAmount: number;
  startDate: string;
  endDate: string;
  monthlyContribution: number;
}

export interface TimeMachineResult {
  startingCapital: number;
  totalContributions: number;
  endingValue: number;
  profit: number;
  profitPercent: number;
  chart: { time: number; value: number }[];
  comparison: { symbol: string; endingValue: number }[];
}

async function simulateSchedule(symbol: string, input: TimeMachineInput) {
  const provider = getMarketDataProvider();
  const candles = await provider.getHistoricalPrices(symbol, "MAX");
  const start = new Date(input.startDate).getTime() / 1000;
  const end = new Date(input.endDate).getTime() / 1000;
  const relevant = candles.filter((c) => c.time >= start && c.time <= end);
  if (relevant.length === 0) return { chart: [] as { time: number; value: number }[], endingValue: 0, totalContributions: 0 };

  let shares = input.startingAmount / relevant[0].close;
  let contributions = input.startingAmount;
  const chart = [{ time: relevant[0].time, value: shares * relevant[0].close }];

  for (let i = 1; i < relevant.length; i++) {
    if (input.monthlyContribution > 0) {
      shares += input.monthlyContribution / relevant[i].close;
      contributions += input.monthlyContribution;
    }
    chart.push({ time: relevant[i].time, value: shares * relevant[i].close });
  }

  return { chart, endingValue: shares * relevant[relevant.length - 1].close, totalContributions: contributions };
}

export async function runTimeMachine(input: TimeMachineInput): Promise<TimeMachineResult> {
  const primary = await simulateSchedule(input.symbol, input);
  const benchmarks = ["VOO", "QQQ"].filter((s) => s !== input.symbol);
  const comparison = await Promise.all(
    benchmarks.map(async (symbol) => ({ symbol, endingValue: (await simulateSchedule(symbol, input)).endingValue })),
  );

  const profit = primary.endingValue - primary.totalContributions;
  const profitPercent = primary.totalContributions === 0 ? 0 : (profit / primary.totalContributions) * 100;

  return {
    startingCapital: input.startingAmount,
    totalContributions: primary.totalContributions,
    endingValue: primary.endingValue,
    profit,
    profitPercent,
    chart: primary.chart,
    comparison,
  };
}

export interface WhatIfScenario {
  userId: string;
  priceShockPercent: number; // e.g. -20 for "what if the market falls 20%"
  assetId?: string; // apply to one position only; omit to apply portfolio-wide
  extraMonthlyContribution?: number;
}

export interface WhatIfResult {
  currentValue: number;
  projectedValue: number;
  deltaValue: number;
  deltaPercent: number;
  projectedWithContribution12mo: number;
}

export async function runWhatIf(scenario: WhatIfScenario): Promise<WhatIfResult> {
  const broker = getBrokerService();
  const positions = await broker.getPositions(scenario.userId);

  const currentValue = positions.reduce((sum, p) => sum + p.marketValueBase.toNumber(), 0);
  const projectedValue = positions.reduce((sum, p) => {
    const applies = !scenario.assetId || scenario.assetId === p.assetId;
    const shocked = applies ? p.marketValueBase.toNumber() * (1 + scenario.priceShockPercent / 100) : p.marketValueBase.toNumber();
    return sum + shocked;
  }, 0);

  const extra = scenario.extraMonthlyContribution ? convertToBase(scenario.extraMonthlyContribution, "KES").toNumber() : 0;
  const projectedWithContribution12mo = projectedValue + extra * 12;

  const deltaValue = projectedValue - currentValue;
  const deltaPercent = currentValue === 0 ? 0 : (deltaValue / currentValue) * 100;

  return { currentValue, projectedValue, deltaValue, deltaPercent, projectedWithContribution12mo };
}
