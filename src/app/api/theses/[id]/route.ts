import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getThesis, updateThesis } from "@/services/theses";
import { ThesisStatus } from "@/generated/prisma/client";

const schema = z.object({
  body: z.string().min(10).max(4000).optional(),
  targetPrice: z.coerce.number().positive().optional(),
  status: z.enum(ThesisStatus).optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thesis = await getThesis(id);
  if (!thesis) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(thesis);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });

  const { id } = await params;
  try {
    const thesis = await updateThesis(id, session.user.id, parsed.data);
    return NextResponse.json(thesis);
  } catch {
    return NextResponse.json({ error: "Thesis not found or not yours." }, { status: 404 });
  }
}
