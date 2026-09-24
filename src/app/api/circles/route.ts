import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createCircle, listCircles } from "@/services/circles";
import { CircleVisibility } from "@/generated/prisma/client";

const schema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().min(3).max(500),
  visibility: z.enum(CircleVisibility).default("PUBLIC"),
});

export async function GET() {
  const session = await auth();
  const circles = await listCircles(session?.user?.id ?? null);
  return NextResponse.json(circles);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid circle." }, { status: 400 });

  const circle = await createCircle({ ownerId: session.user.id, ...parsed.data });
  return NextResponse.json(circle);
}
