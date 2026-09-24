"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const markRead = async () => {
    setLoading(true);
    await fetch("/api/notifications", { method: "PATCH" });
    setLoading(false);
    router.refresh();
  };

  return (
    <Button size="sm" variant="outline" onClick={markRead} disabled={loading}>
      Mark all read
    </Button>
  );
}
