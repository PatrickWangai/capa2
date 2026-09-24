import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeFromWatchlist } from "@/services/watchlist";

export async function DELETE(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assetId } = await params;
  await removeFromWatchlist(session.user.id, assetId);
  return NextResponse.json({ ok: true });
}
