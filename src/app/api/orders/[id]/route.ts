import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBrokerService } from "@/services/providers/broker";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const broker = getBrokerService();
    const order = await broker.cancelOrder(session.user.id, id);
    return NextResponse.json({ ...order, quantity: order.quantity.toString() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not cancel order." }, { status: 400 });
  }
}
