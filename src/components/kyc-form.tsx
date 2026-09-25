"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface KYCStatusView {
  status: string;
  fullName: string | null;
  rejectionReason: string | null;
}

const STATUS_COPY: Record<string, string> = {
  NOT_STARTED: "You haven't started identity verification yet.",
  PENDING: "Your application is under review.",
  VERIFIED: "Your identity is verified.",
  REJECTED: "Your application was rejected — you can resubmit below.",
  NEEDS_INFO: "We need more information to complete your verification.",
};

export function KYCForm({ initialStatus }: { initialStatus: KYCStatusView }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [fullName, setFullName] = useState(initialStatus.fullName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const res = await fetch("/api/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, dateOfBirth, idNumber }),
    });
    const data = await res.json();
    setSubmitting(false);
    setStatus(data);
    router.refresh();
  };

  return (
    <div className="rounded-md border-2 border-line-strong shadow-hard-sm p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-ink">Identity verification (KYC)</h3>
        <Badge variant={status.status === "VERIFIED" ? "gain" : status.status === "REJECTED" ? "loss" : "signal"}>
          {status.status.replace("_", " ")}
        </Badge>
      </div>
      <p className="mt-1.5 text-[13px] text-muted">{STATUS_COPY[status.status]}</p>

      {(status.status === "NOT_STARTED" || status.status === "REJECTED" || status.status === "NEEDS_INFO") && (
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="kyc-name">Full legal name</Label>
            <Input id="kyc-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="kyc-dob">Date of birth</Label>
            <Input id="kyc-dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="kyc-id">National ID / Passport number</Label>
            <Input id="kyc-id" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="mt-1.5" />
          </div>
          <p className="text-[11.5px] text-faint">Sandbox environment — no documents are actually stored or verified.</p>
          <Button size="sm" onClick={submit} disabled={submitting || !fullName || !dateOfBirth || !idNumber}>
            {submitting ? "Submitting…" : "Submit for review"}
          </Button>
        </div>
      )}
    </div>
  );
}
