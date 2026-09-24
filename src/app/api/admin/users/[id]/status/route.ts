import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { setUserStatus } from "@/services/admin";
import { UserStatus } from "@/generated/prisma/client";

const schema = z.object({ status: z.enum(UserStatus) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const { id } = await params;
  await setUserStatus(session.user.id, id, parsed.data.status);
  return NextResponse.json({ ok: true });
}
