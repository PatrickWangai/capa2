import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { runWhatIf } from "@/services/simulator";

const schema = z.object({
  priceShockPercent: z.coerce.number(),
  assetId: z.string().optional(),
  extraMonthlyContribution: z.coerce.number().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid scenario." }, { status: 400 });

  const result = await runWhatIf({ userId: session.user.id, ...parsed.data });
  return NextResponse.json(result);
}
