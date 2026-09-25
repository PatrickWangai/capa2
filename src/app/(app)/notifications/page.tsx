import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";
import { auth } from "@/auth";
import { listNotifications } from "@/services/notifications";
import { MarkAllReadButton } from "@/components/mark-all-read-button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  const notifications = await listNotifications(session!.user.id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Notifications</h1>
        {notifications.some((n) => !n.read) && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-10 text-center text-[13.5px] text-muted">You&apos;re all caught up.</p>
      ) : (
        <div className="mt-6 rounded-md border-2 border-line-strong">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? "#"}
              className={cn("flex items-start gap-3 border-b border-line p-4 last:border-none hover:bg-surface-raised", !n.read && "bg-signal-tint/40")}
            >
              <Bell className="mt-0.5 size-4 shrink-0 text-faint" />
              <div>
                <p className="text-[14px] font-medium text-ink">{n.title}</p>
                <p className="mt-0.5 text-[13px] text-muted">{n.body}</p>
                <p className="mt-1 text-[11.5px] text-faint">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
