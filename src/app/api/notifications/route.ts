import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listNotifications, markAllRead } from "@/services/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notifications = await listNotifications(session.user.id);
  return NextResponse.json(notifications);
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await markAllRead(session.user.id);
  return NextResponse.json({ ok: true });
}
