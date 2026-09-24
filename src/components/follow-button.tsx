"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function FollowButton({ userId, initialFollowing }: { userId: string; initialFollowing: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    setFollowing((v) => !v);
    await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <Button size="sm" variant={following ? "outline" : "primary"} onClick={toggle} disabled={loading}>
      {following ? "Following" : "Follow"}
    </Button>
  );
}
