import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-5 py-24 text-center">
      <ShieldAlert className="size-10 text-faint" strokeWidth={1.5} />
      <h1 className="text-2xl font-bold text-ink">You don&apos;t have access to this page</h1>
      <p className="max-w-[42ch] text-[14px] text-muted">
        Your account doesn&apos;t have the permissions needed to view this section.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
