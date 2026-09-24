import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCircle } from "@/services/circles";
import { CircleMembershipButton } from "@/components/circle-membership-button";
import { CirclePostForm } from "@/components/circle-post-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const circle = await getCircle(id, null);
  return { title: circle?.name ?? "Circle" };
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const circle = await getCircle(id, session?.user?.id ?? null);
  if (!circle) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{circle.name}</h1>
          <p className="mt-1 text-[13.5px] text-muted">{circle.description}</p>
          <p className="mt-2 text-[12.5px] text-faint">
            {circle.memberCount} members · run by {circle.owner.name}
          </p>
        </div>
        {session?.user && <CircleMembershipButton circleId={circle.id} isMember={circle.isMember} isOwner={circle.role === "OWNER"} />}
      </div>

      <div className="mt-6 flex -space-x-2">
        {circle.members.slice(0, 10).map((m) => (
          <Avatar key={m.id} className="border-2 border-paper">
            <AvatarImage src={m.user.avatarUrl ?? undefined} alt={m.user.name} />
            <AvatarFallback>{initials(m.user.name)}</AvatarFallback>
          </Avatar>
        ))}
      </div>

      <div className="mt-8">
        {circle.isMember && <CirclePostForm circleId={circle.id} />}
        {circle.posts.length === 0 ? (
          <p className="py-10 text-center text-[13.5px] text-muted">No posts in this circle yet.</p>
        ) : (
          <div className="mt-4 space-y-5">
            {circle.posts.map((p) => (
              <div key={p.id} className="flex items-start gap-3 border-b border-line pb-5">
                <Avatar>
                  <AvatarImage src={p.user.avatarUrl ?? undefined} alt={p.user.name} />
                  <AvatarFallback>{initials(p.user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">
                    {p.user.name} <span className="font-normal text-faint">· {new Date(p.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[14px] text-ink-soft">{p.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
