import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { explainPortfolio } from "@/services/portfolio-insights";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const insights = await explainPortfolio(session.user.id);
  return NextResponse.json(insights);
}
