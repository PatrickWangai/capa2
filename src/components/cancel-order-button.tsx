"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cancel = async () => {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  };

  return (
    <Button size="sm" variant="outline" onClick={cancel} disabled={loading}>
      {loading ? "Cancelling…" : "Cancel"}
    </Button>
  );
}
