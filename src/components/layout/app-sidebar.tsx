"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { APP_SIDEBAR, APP_SIDEBAR_FOOTER } from "@/config/nav";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r-2 border-line-strong bg-paper lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {APP_SIDEBAR.map((section, i) => (
          <div key={i} className={cn("py-3", i > 0 && "border-t border-line")}>
            {section.label && (
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md border-2 px-3 py-2 text-[13.5px] font-bold transition-colors",
                        active
                          ? "border-line-strong bg-primary text-primary-foreground"
                          : "border-transparent text-ink-soft hover:border-line-strong hover:bg-surface-raised hover:text-ink",
                      )}
                    >
                      <Icon className="size-[17px]" strokeWidth={2.5} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-3">
        <ul className="space-y-0.5">
          {APP_SIDEBAR_FOOTER.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors",
                    active ? "bg-surface-raised text-ink" : "text-ink-soft hover:bg-surface-raised hover:text-ink",
                  )}
                >
                  <Icon className="size-[17px]" strokeWidth={2} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
