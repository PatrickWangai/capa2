import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Transactions", href: "/admin/transactions" },
  { label: "KYC", href: "/admin/kyc" },
  { label: "Content", href: "/admin/content" },
  { label: "Audit log", href: "/admin/audit" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/forbidden");

  return (
    <div className="min-h-full bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-paper">Admin</span>
          </div>
          <Link href="/dashboard" className="text-[13px] font-medium text-signal">
            Exit admin
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-surface-raised"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
