"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReportResolveButtons({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const resolve = async (action: "REMOVE" | "DISMISS") => {
    setLoading(true);
    await fetch(`/api/admin/reports/${reportId}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => resolve("DISMISS")} disabled={loading}>
        Dismiss
      </Button>
      <Button size="sm" variant="destructive" onClick={() => resolve("REMOVE")} disabled={loading}>
        Remove content
      </Button>
    </div>
  );
}
