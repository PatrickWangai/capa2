import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { InvestorCard } from "@/components/investor-card";

export const metadata: Metadata = { title: "Investors" };

export default async function InvestorsPage() {
  const session = await auth();
  const users = await db.user.findMany({
    where: { id: { not: session?.user?.id }, status: "ACTIVE" },
    include: { profile: true },
    orderBy: { profile: { followerCount: "desc" } },
    take: 30,
  });

  const following = session?.user
    ? await db.follow.findMany({ where: { followerId: session.user.id }, select: { followingId: true } })
    : [];
  const followingSet = new Set(following.map((f) => f.followingId));

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-bold text-ink">Investors</h1>
      <p className="mt-1 text-[13.5px] text-muted">Follow investors whose thinking you trust.</p>
      <div className="mt-6 space-y-3">
        {users.map((u) => (
          <InvestorCard
            key={u.id}
            id={u.id}
            username={u.username}
            name={u.name}
            avatarUrl={u.avatarUrl}
            bio={u.bio}
            followerCount={u.profile?.followerCount ?? 0}
            isFollowing={followingSet.has(u.id)}
            isSelf={false}
          />
        ))}
      </div>
    </div>
  );
}
