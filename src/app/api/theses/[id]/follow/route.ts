import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { toggleThesisFollow } from "@/services/theses";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const following = await toggleThesisFollow(session.user.id, id);
  return NextResponse.json({ following });
}
