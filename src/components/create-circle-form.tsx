"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function CreateCircleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Create a circle
      </Button>
    );
  }

  const submit = async () => {
    setSubmitting(true);
    const res = await fetch("/api/circles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, visibility: "PUBLIC" }),
    });
    const circle = await res.json();
    setSubmitting(false);
    router.push(`/circles/${circle.id}`);
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-line p-5">
      <Label htmlFor="circle-name">Name</Label>
      <Input id="circle-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="e.g. Dividend Investors" />
      <Label htmlFor="circle-desc" className="mt-3 block">
        Description
      </Label>
      <textarea
        id="circle-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="mt-1.5 w-full resize-none rounded-md border border-line-strong bg-surface p-3 text-[14px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button size="sm" onClick={submit} disabled={submitting || !name || !description}>
          {submitting ? "Creating…" : "Create"}
        </Button>
      </div>
    </div>
  );
}
