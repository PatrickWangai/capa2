import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createThesis, listTheses } from "@/services/theses";
import { ThesisDirection, TradeReason } from "@/generated/prisma/client";

const schema = z.object({
  assetId: z.string().min(1),
  direction: z.enum(ThesisDirection),
  title: z.string().min(3).max(140),
  entryPrice: z.coerce.number().positive(),
  targetPrice: z.coerce.number().positive().optional(),
  timeHorizon: z.string().min(1),
  reason: z.enum(TradeReason),
  body: z.string().min(10).max(4000),
  riskFactors: z.string().max(2000).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const assetId = url.searchParams.get("assetId") ?? undefined;
  const userId = url.searchParams.get("userId") ?? undefined;
  const theses = await listTheses({ assetId, userId });
  return NextResponse.json(theses);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid thesis." }, { status: 400 });

  const thesis = await createThesis({ userId: session.user.id, ...parsed.data });
  return NextResponse.json(thesis);
}
