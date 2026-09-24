import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPaymentProvider } from "@/services/providers/payment";
import { PaymentMethod } from "@/generated/prisma/client";

const schema = z.object({ amount: z.coerce.number().positive(), method: z.enum(PaymentMethod) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid withdrawal." }, { status: 400 });

  try {
    const provider = getPaymentProvider();
    const result = await provider.createWithdrawal(session.user.id, parsed.data.amount, parsed.data.method);
    return NextResponse.json({ ...result, amount: result.amount.toString() });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not process withdrawal." }, { status: 422 });
  }
}
