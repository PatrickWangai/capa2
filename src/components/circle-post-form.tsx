"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CirclePostForm({ circleId }: { circleId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    await fetch(`/api/circles/${circleId}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setContent("");
    setSubmitting(false);
    router.refresh();
  };

  return (
    <div className="border-b border-line pb-5">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share research with this circle…"
        rows={2}
        className="w-full resize-none rounded-md border-2 border-line-strong bg-surface p-3 text-[14px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-2 flex justify-end">
        <Button size="sm" onClick={submit} disabled={submitting || !content.trim()}>
          {submitting ? "Posting…" : "Post"}
        </Button>
      </div>
    </div>
  );
}
