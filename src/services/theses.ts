import { db } from "@/lib/db";
import { ThesisDirection, ThesisStatus, TradeReason } from "@/generated/prisma/client";

const AUTHOR_SELECT = { select: { id: true, username: true, name: true, avatarUrl: true } } as const;
const ASSET_SELECT = { select: { symbol: true, name: true, currency: true, currentPrice: true } } as const;

export interface CreateThesisInput {
  userId: string;
  assetId: string;
  direction: ThesisDirection;
  title: string;
  entryPrice: number;
  targetPrice?: number;
  timeHorizon: string;
  reason: TradeReason;
  body: string;
  riskFactors?: string;
  verifiedTradeId?: string;
}

export async function createThesis(input: CreateThesisInput) {
  return db.thesis.create({
    data: {
      userId: input.userId,
      assetId: input.assetId,
      direction: input.direction,
      title: input.title,
      entryPrice: input.entryPrice,
      targetPrice: input.targetPrice,
      timeHorizon: input.timeHorizon,
      reason: input.reason,
      body: input.body,
      riskFactors: input.riskFactors,
      verifiedTradeId: input.verifiedTradeId,
    },
  });
}

export async function updateThesis(
  thesisId: string,
  userId: string,
  changes: { body?: string; targetPrice?: number; status?: ThesisStatus },
) {
  const thesis = await db.thesis.findFirstOrThrow({ where: { id: thesisId, userId } });

  await db.thesisVersion.create({
    data: {
      thesisId,
      body: thesis.body,
      targetPrice: thesis.targetPrice,
      status: thesis.status,
    },
  });

  return db.thesis.update({
    where: { id: thesisId },
    data: {
      body: changes.body ?? thesis.body,
      targetPrice: changes.targetPrice ?? thesis.targetPrice,
      status: changes.status ?? (thesis.status === "ACTIVE" ? "UPDATED" : thesis.status),
    },
  });
}

export async function listTheses(filter: { assetId?: string; userId?: string } = {}) {
  return db.thesis.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
    include: { user: AUTHOR_SELECT, asset: ASSET_SELECT },
  });
}

export async function getThesis(id: string) {
  return db.thesis.findUnique({
    where: { id },
    include: {
      user: AUTHOR_SELECT,
      asset: ASSET_SELECT,
      versions: { orderBy: { createdAt: "desc" } },
      verifiedTrade: true,
    },
  });
}

export async function toggleThesisFollow(userId: string, thesisId: string): Promise<boolean> {
  const existing = await db.thesisFollow.findUnique({ where: { userId_thesisId: { userId, thesisId } } });
  if (existing) {
    await db.$transaction([
      db.thesisFollow.delete({ where: { userId_thesisId: { userId, thesisId } } }),
      db.thesis.update({ where: { id: thesisId }, data: { followCount: { decrement: 1 } } }),
    ]);
    return false;
  }
  await db.$transaction([
    db.thesisFollow.create({ data: { userId, thesisId } }),
    db.thesis.update({ where: { id: thesisId }, data: { followCount: { increment: 1 } } }),
  ]);
  return true;
}
