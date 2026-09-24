"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function KycReviewButtons({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const review = async (decision: "VERIFIED" | "REJECTED") => {
    setLoading(true);
    await fetch(`/api/admin/kyc/${applicationId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, rejectionReason: decision === "REJECTED" ? "Documents did not match provided details." : undefined }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="destructive" onClick={() => review("REJECTED")} disabled={loading}>
        Reject
      </Button>
      <Button size="sm" onClick={() => review("VERIFIED")} disabled={loading}>
        Approve
      </Button>
    </div>
  );
}
