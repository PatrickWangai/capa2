import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const schema = z.object({
  showVerifiedTrades: z.boolean().optional(),
  showHoldings: z.boolean().optional(),
  showPortfolioValue: z.boolean().optional(),
  showTheses: z.boolean().optional(),
  allowFollow: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  showJourney: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings." }, { status: 400 });

  const profile = await db.profile.update({ where: { userId: session.user.id }, data: parsed.data });
  return NextResponse.json(profile);
}
