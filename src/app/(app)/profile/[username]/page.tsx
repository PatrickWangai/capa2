import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPublicProfile } from "@/services/profiles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow-button";
import { PostCard } from "@/components/post-card";
import { ThesisCard } from "@/components/thesis-card";
import { formatMoney } from "@/lib/money";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  const profile = await getPublicProfile(username, session?.user?.id ?? null);
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
            <AvatarFallback className="text-lg">{initials(profile.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-ink">{profile.name}</h1>
            <p className="text-[13.5px] text-muted">@{profile.username}</p>
          </div>
        </div>
        {!profile.isSelf && profile.allowFollow && (
          <FollowButton userId={profile.id} initialFollowing={profile.isFollowing} />
        )}
        {profile.isSelf && (
          <Link href="/settings" className="text-[13px] font-medium text-signal">
            Edit profile
          </Link>
        )}
      </div>

      {profile.bio && <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{profile.bio}</p>}

      <div className="mt-4 flex flex-wrap gap-5 text-[13.5px] text-ink-soft">
        <span>
          <strong className="text-ink">{profile.followerCount.toLocaleString()}</strong> Followers
        </span>
        <span>
          <strong className="text-ink">{profile.followingCount.toLocaleString()}</strong> Following
        </span>
        {profile.portfolioValue !== null && (
          <span>
            <strong className="text-ink">{formatMoney(profile.portfolioValue)}</strong> Portfolio
          </span>
        )}
      </div>

      {profile.interests.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.interests.map((i) => (
            <span key={i} className="rounded-full border border-line-strong px-2.5 py-1 text-[11.5px] text-ink-soft">
              {i}
            </span>
          ))}
        </div>
      )}

      {profile.milestones.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-ink">Investment journey</h2>
          <ol className="mt-3 space-y-3 border-l border-line pl-4">
            {profile.milestones.map((m) => (
              <li key={m.id}>
                <p className="text-[12px] font-medium uppercase tracking-wide text-faint">
                  {new Date(m.occurredAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </p>
                <p className="text-[14px] font-medium text-ink">{m.title}</p>
                <p className="text-[13px] text-muted">{m.description}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {profile.theses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-ink">Investment theses</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {profile.theses.map((t) => (
              <ThesisCard
                key={t.id}
                id={t.id}
                direction={t.direction}
                status={t.status}
                title={t.title}
                entryPrice={t.entryPrice}
                targetPrice={t.targetPrice}
                timeHorizon={t.timeHorizon}
                currency={t.currency}
                symbol={t.symbol}
                authorName={profile.name}
                authorUsername={profile.username}
                likeCount={t.likeCount}
                followCount={t.followCount}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-[15px] font-semibold text-ink">Activity</h2>
        {profile.posts.length === 0 ? (
          <p className="mt-3 text-[13.5px] text-muted">No public activity yet.</p>
        ) : (
          <div className="mt-2">
            {profile.posts.map((p) => (
              <PostCard
                key={p.id}
                post={{
                  ...p,
                  user: { username: profile.username, name: profile.name, avatarUrl: profile.avatarUrl },
                  viewerHasLiked: false,
                  viewerHasSaved: false,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
