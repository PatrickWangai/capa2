"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CircleMembershipButton({ circleId, isMember, isOwner }: { circleId: string; isMember: boolean; isOwner: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/circles/${circleId}/${isMember ? "leave" : "join"}`, { method: "POST" });
    setLoading(false);
    router.refresh();
  };

  if (isOwner) return null;

  return (
    <Button size="sm" variant={isMember ? "outline" : "primary"} onClick={toggle} disabled={loading}>
      {isMember ? "Leave circle" : "Join circle"}
    </Button>
  );
}
