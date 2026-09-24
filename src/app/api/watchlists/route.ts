import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { listWatchlist, addToWatchlist } from "@/services/watchlist";

const addSchema = z.object({ assetId: z.string().min(1) });

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await listWatchlist(session.user.id);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = addSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "assetId is required" }, { status: 400 });

  await addToWatchlist(session.user.id, parsed.data.assetId);
  return NextResponse.json({ ok: true });
}
