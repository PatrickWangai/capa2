import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CreateThesisForm } from "@/components/create-thesis-form";

export const metadata: Metadata = { title: "Publish a thesis" };

export default async function NewThesisPage({ searchParams }: { searchParams: Promise<{ symbol?: string }> }) {
  const params = await searchParams;
  const assets = await db.asset.findMany({ orderBy: { symbol: "asc" }, select: { id: true, symbol: true, name: true } });
  const defaultAsset = assets.find((a) => a.symbol === params.symbol?.toUpperCase());

  return (
    <div className="mx-auto max-w-lg px-5 py-8">
      <h1 className="text-2xl font-bold text-ink">Publish an investment thesis</h1>
      <p className="mt-1 text-[13.5px] text-muted">Share the reasoning behind a position — bull or bear case.</p>
      <div className="mt-6">
        <CreateThesisForm assets={assets} defaultAssetId={defaultAsset?.id} />
      </div>
    </div>
  );
}
