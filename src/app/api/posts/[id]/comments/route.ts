import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { addComment, listComments } from "@/services/social";

const schema = z.object({ body: z.string().min(1).max(1000) });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await listComments(id);
  return NextResponse.json(comments);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Comment can't be empty." }, { status: 400 });

  const { id } = await params;
  const comment = await addComment(session.user.id, id, parsed.data.body);
  return NextResponse.json(comment);
}
