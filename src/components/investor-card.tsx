import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow-button";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function InvestorCard({
  id,
  username,
  name,
  avatarUrl,
  bio,
  followerCount,
  isFollowing,
  isSelf,
}: {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  followerCount: number;
  isFollowing: boolean;
  isSelf: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border-2 border-line-strong shadow-hard-sm p-4">
      <Link href={`/profile/${username}`} className="flex min-w-0 items-center gap-3">
        <Avatar>
          <AvatarImage src={avatarUrl ?? undefined} alt={name} />
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-ink">{name}</p>
          <p className="truncate text-[12.5px] text-muted">
            @{username} · {followerCount.toLocaleString()} followers
          </p>
          {bio && <p className="mt-0.5 truncate text-[12.5px] text-faint">{bio}</p>}
        </div>
      </Link>
      {!isSelf && <FollowButton userId={id} initialFollowing={isFollowing} />}
    </div>
  );
}
