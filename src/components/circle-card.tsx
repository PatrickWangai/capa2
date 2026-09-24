import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CircleCard({
  id,
  name,
  description,
  visibility,
  memberCount,
  isMember,
}: {
  id: string;
  name: string;
  description: string;
  visibility: string;
  memberCount: number;
  isMember: boolean;
}) {
  return (
    <Link href={`/circles/${id}`} className="block rounded-xl border border-line p-5 hover:border-ink">
      <div className="flex items-start justify-between">
        <h3 className="text-[15px] font-semibold text-ink">{name}</h3>
        {isMember && <Badge variant="signal">Member</Badge>}
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] text-muted">{description}</p>
      <div className="mt-3 flex items-center gap-3 text-[12px] text-faint">
        <span className="flex items-center gap-1">
          <Users className="size-3.5" /> {memberCount.toLocaleString()} members
        </span>
        <span>{visibility === "PUBLIC" ? "Public" : "Private"}</span>
      </div>
    </Link>
  );
}
