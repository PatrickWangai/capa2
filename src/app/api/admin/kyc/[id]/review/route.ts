import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { reviewKyc } from "@/services/admin";

const schema = z.object({ decision: z.enum(["VERIFIED", "REJECTED"]), rejectionReason: z.string().optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid review." }, { status: 400 });

  const { id } = await params;
  await reviewKyc(session.user.id, id, parsed.data.decision, parsed.data.rejectionReason);
  return NextResponse.json({ ok: true });
}
