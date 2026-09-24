"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UserStatusButton({ userId, status }: { userId: string; status: "ACTIVE" | "SUSPENDED" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const nextStatus = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <Button size="sm" variant={status === "ACTIVE" ? "destructive" : "outline"} onClick={toggle} disabled={loading}>
      {status === "ACTIVE" ? "Suspend" : "Reactivate"}
    </Button>
  );
}
