import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getBrokerService } from "@/services/providers/broker";
import { TradeTicket } from "@/components/trade-ticket";

export const metadata: Metadata = { title: "Trade" };

export default async function TradePage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; side?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const broker = getBrokerService();

  const [assets, buyingPower] = await Promise.all([
    db.asset.findMany({ orderBy: { symbol: "asc" }, select: { id: true, symbol: true, name: true, currency: true } }),
    broker.getBuyingPower(session!.user.id),
  ]);

  const initialAsset = assets.find((a) => a.symbol === params.symbol?.toUpperCase()) ?? assets[0];
  const initialSide = params.side === "SELL" ? "SELL" : "BUY";

  return (
    <div className="mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-bold text-ink">Trade</h1>
      <p className="mt-1 text-[13.5px] text-muted">Orders execute against Capa&apos;s simulated broker.</p>
      <div className="mt-6">
        {assets.length === 0 ? (
          <p className="text-[13.5px] text-muted">No assets are available to trade yet.</p>
        ) : (
          <TradeTicket
            assets={assets}
            initialAssetId={initialAsset.id}
            initialSide={initialSide}
            buyingPower={buyingPower.toNumber()}
          />
        )}
      </div>
    </div>
  );
}
