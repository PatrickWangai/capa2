import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { publishVerifiedTradePost } from "@/services/social";

const schema = z.object({ note: z.string().max(500).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trade = await db.trade.findFirst({ where: { id, userId: session.user.id } });
  if (!trade) return NextResponse.json({ error: "Trade not found." }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  const post = await publishVerifiedTradePost(session.user.id, id, parsed.success ? parsed.data.note : undefined);
  return NextResponse.json(post);
}
