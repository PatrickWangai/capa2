import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ReportTargetType } from "@/generated/prisma/client";

const schema = z.object({
  targetType: z.enum(ReportTargetType),
  postId: z.string().optional(),
  commentId: z.string().optional(),
  reason: z.string().min(1).max(300),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid report." }, { status: 400 });

  const report = await db.report.create({
    data: { reporterId: session.user.id, ...parsed.data },
  });
  return NextResponse.json(report);
}
