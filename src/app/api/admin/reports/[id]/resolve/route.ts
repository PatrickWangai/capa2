import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { resolveReport } from "@/services/admin";

const schema = z.object({ action: z.enum(["REMOVE", "DISMISS"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const { id } = await params;
  await resolveReport(session.user.id, id, parsed.data.action);
  return NextResponse.json({ ok: true });
}
