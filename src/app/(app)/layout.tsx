import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [wallet, unreadCount] = await Promise.all([
    db.wallet.findUnique({ where: { userId: session.user.id } }),
    db.notification.count({ where: { userId: session.user.id, read: false } }),
  ]);

  return (
    <div className="min-h-full bg-paper">
      <AppSidebar />
      <div className="lg:pl-60">
        <AppTopbar
          name={session.user.name ?? session.user.username}
          username={session.user.username}
          avatarUrl={session.user.image ?? null}
          cashBalance={wallet?.cashBalance.toString() ?? "0"}
          unreadNotifications={unreadCount}
        />
        <main className="min-h-[calc(100vh-4rem)] pb-20 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
