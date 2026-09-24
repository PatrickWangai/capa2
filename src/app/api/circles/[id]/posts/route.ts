import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { postToCircle } from "@/services/circles";

const schema = z.object({ content: z.string().min(1).max(2000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Post can't be empty." }, { status: 400 });

  const { id } = await params;
  try {
    const post = await postToCircle(id, session.user.id, parsed.data.content);
    return NextResponse.json(post);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not post." }, { status: 400 });
  }
}
