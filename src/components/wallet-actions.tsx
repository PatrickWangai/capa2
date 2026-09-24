"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function WalletActions() {
  const router = useRouter();
  const [mode, setMode] = useState<"deposit" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"MPESA" | "BANK" | "CARD">("MPESA");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/wallet/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), method }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setAmount("");
    setMode(null);
    router.refresh();
  };

  if (!mode) {
    return (
      <div className="flex gap-2.5">
        <Button onClick={() => setMode("deposit")}>Deposit</Button>
        <Button variant="outline" onClick={() => setMode("withdraw")}>
          Withdraw
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line p-5">
      <h3 className="text-[14px] font-semibold text-ink">{mode === "deposit" ? "Deposit" : "Withdraw"}</h3>
      <div className="mt-3">
        <Label htmlFor="wallet-amount">Amount (KES)</Label>
        <Input id="wallet-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
      </div>
      <div className="mt-3">
        <Label htmlFor="wallet-method">Method</Label>
        <select
          id="wallet-method"
          value={method}
          onChange={(e) => setMethod(e.target.value as typeof method)}
          className="mt-1.5 flex h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[14px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="MPESA">M-Pesa</option>
          <option value="BANK">Bank transfer</option>
          <option value="CARD">Card</option>
        </select>
      </div>
      {error && <p className="mt-2 text-[13px] text-loss">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setMode(null)} disabled={submitting}>
          Cancel
        </Button>
        <Button size="sm" onClick={submit} disabled={submitting || !amount}>
          {submitting ? "Processing…" : `Confirm ${mode}`}
        </Button>
      </div>
      <p className="mt-3 text-[12px] text-faint">Sandbox mode — this simulates an instant {method} confirmation.</p>
    </div>
  );
}
