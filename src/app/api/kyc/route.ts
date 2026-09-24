import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getKYCProvider } from "@/services/providers/kyc";

const schema = z.object({
  fullName: z.string().min(3),
  dateOfBirth: z.string().min(1),
  idNumber: z.string().min(3),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const provider = getKYCProvider();
  const status = await provider.getStatus(session.user.id);
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });

  const provider = getKYCProvider();
  const status = await provider.submitApplication(session.user.id, parsed.data);
  return NextResponse.json(status);
}
