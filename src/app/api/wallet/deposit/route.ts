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
  if (!parsed.success) return NextResponse.json({ error: "Invalid deposit." }, { status: 400 });

  const provider = getPaymentProvider();
  const result = await provider.createDeposit(session.user.id, parsed.data.amount, parsed.data.method);
  return NextResponse.json({ ...result, amount: result.amount.toString() });
}
