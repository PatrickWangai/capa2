import type { Metadata } from "next";
import { db } from "@/lib/db";
import { TimeMachine } from "@/components/time-machine";
import { WhatIfSimulator } from "@/components/what-if-simulator";

export const metadata: Metadata = { title: "Simulator" };

export default async function SimulatePage() {
  const assets = await db.asset.findMany({ orderBy: { symbol: "asc" }, select: { id: true, symbol: true, name: true } });

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-ink">Portfolio Simulator</h1>
      <TimeMachine assets={assets} />
      <WhatIfSimulator />
    </div>
  );
}
