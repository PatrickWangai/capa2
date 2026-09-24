import { NextResponse } from "next/server";
import { z } from "zod";
import { runTimeMachine } from "@/services/simulator";

const schema = z.object({
  symbol: z.string().min(1),
  startingAmount: z.coerce.number().nonnegative(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  monthlyContribution: z.coerce.number().nonnegative().default(0),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const result = await runTimeMachine(parsed.data);
  return NextResponse.json(result);
}
