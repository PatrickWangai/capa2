import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { AssetClass, AssetRegion } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const region = (url.searchParams.get("region") as AssetRegion | null) ?? undefined;
  const assetClass = (url.searchParams.get("assetClass") as AssetClass | null) ?? undefined;

  const assets = await db.asset.findMany({
    where: {
      region,
      assetClass,
      ...(search
        ? { OR: [{ symbol: { contains: search, mode: "insensitive" } }, { name: { contains: search, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { symbol: "asc" },
    take: 50,
    select: { id: true, symbol: true, name: true, exchange: true, currency: true },
  });

  return NextResponse.json(assets);
}
