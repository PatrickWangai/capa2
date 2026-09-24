import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createPost, getFeed, type FeedScope } from "@/services/social";
import { PostType } from "@/generated/prisma/client";

const createSchema = z.object({
  type: z.enum(PostType).default("COMMENTARY"),
  content: z.string().min(1).max(2000),
});

export async function GET(request: Request) {
  const session = await auth();
  const url = new URL(request.url);
  const scope = (url.searchParams.get("scope") ?? "for-you") as FeedScope;
  const cursor = url.searchParams.get("cursor") ?? undefined;

  const data = await getFeed(scope, session?.user?.id ?? null, cursor);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  const post = await createPost({ userId: session.user.id, ...parsed.data });
  return NextResponse.json(post);
}
