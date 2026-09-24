"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV } from "@/config/nav";
import { cn } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-paper/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden">
      {MOBILE_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium",
              active ? "text-ink" : "text-faint",
            )}
          >
            <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
            {item.label}
          </Link>
        );
      })}
      <Link href="/trade" className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium text-faint">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground -mt-1">
          <ArrowLeftRight className="size-4" strokeWidth={2.4} />
        </span>
        Trade
      </Link>
    </nav>
  );
}
