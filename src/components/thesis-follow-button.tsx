"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ThesisFollowButton({ thesisId, initialFollowing }: { thesisId: string; initialFollowing: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/theses/${thesisId}/follow`, { method: "POST" });
    setFollowing((v) => !v);
    setLoading(false);
    router.refresh();
  };

  return (
    <Button size="sm" variant={following ? "outline" : "primary"} onClick={toggle} disabled={loading}>
      {following ? "Following thesis" : "Follow thesis"}
    </Button>
  );
}
