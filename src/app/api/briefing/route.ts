import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateMarketBrief, getLatestBrief } from "@/services/market-brief";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const brief = await getLatestBrief(session.user.id);
  return NextResponse.json(brief);
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const brief = await generateMarketBrief(session.user.id);
  return NextResponse.json(brief);
}
