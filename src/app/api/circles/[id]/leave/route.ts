import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { leaveCircle } from "@/services/circles";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await leaveCircle(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not leave circle." }, { status: 400 });
  }
}
