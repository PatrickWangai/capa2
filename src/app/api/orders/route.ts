import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getBrokerService, InsufficientBuyingPowerError, InsufficientSharesError } from "@/services/providers/broker";
import { OrderSide, OrderType, TradeReason } from "@/generated/prisma/client";

const schema = z.object({
  assetId: z.string().min(1),
  side: z.enum(OrderSide),
  type: z.enum(OrderType),
  quantity: z.coerce.number().positive(),
  limitPrice: z.coerce.number().positive().optional(),
  reason: z.enum(TradeReason).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const broker = getBrokerService();
  const orders = await broker.getOrders(session.user.id);
  return NextResponse.json(
    orders.map((o) => ({
      ...o,
      quantity: o.quantity.toString(),
      limitPrice: o.limitPrice?.toString() ?? null,
      estimatedTotal: o.estimatedTotal.toString(),
      fee: o.fee.toString(),
      filledPrice: o.filledPrice?.toString() ?? null,
    })),
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid order." }, { status: 400 });
  }

  try {
    const broker = getBrokerService();
    const order = await broker.createOrder({ userId: session.user.id, ...parsed.data });
    return NextResponse.json({
      ...order,
      quantity: order.quantity.toString(),
      limitPrice: order.limitPrice?.toString() ?? null,
      estimatedTotal: order.estimatedTotal.toString(),
      fee: order.fee.toString(),
      filledPrice: order.filledPrice?.toString() ?? null,
    });
  } catch (err) {
    if (err instanceof InsufficientBuyingPowerError || err instanceof InsufficientSharesError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not place order." }, { status: 500 });
  }
}
