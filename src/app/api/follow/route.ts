import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { followUser, unfollowUser, isFollowing } from "@/services/follow";

const schema = z.object({ userId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const alreadyFollowing = await isFollowing(session.user.id, parsed.data.userId);
  if (alreadyFollowing) {
    await unfollowUser(session.user.id, parsed.data.userId);
    return NextResponse.json({ following: false });
  }
  await followUser(session.user.id, parsed.data.userId);
  return NextResponse.json({ following: true });
}
