import Link from "next/link";
import { Bell, Wallet as WalletIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatMoney } from "@/lib/money";

export function AppTopbar({
  name,
  username,
  avatarUrl,
  cashBalance,
  unreadNotifications,
}: {
  name: string;
  username: string;
  avatarUrl: string | null;
  cashBalance: string;
  unreadNotifications: number;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-2 border-b-2 border-line-strong bg-paper px-5 lg:justify-between">
      <div className="hidden lg:block" />
      <div className="flex items-center gap-1.5">
        <Link
          href="/wallet"
          className="mr-1.5 hidden items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-surface-raised sm:flex"
        >
          <WalletIcon className="size-3.5" />
          <span className="font-tabular">{formatMoney(cashBalance)}</span>
        </Link>
        <ThemeToggle />
        <Link
          href="/notifications"
          className="relative flex size-9 items-center justify-center rounded-full text-ink-soft hover:bg-surface-raised"
        >
          <Bell className="size-[18px]" />
          {unreadNotifications > 0 && (
            <span className="absolute right-1.5 top-1.5 size-[7px] rounded-full bg-loss" />
          )}
        </Link>
        <UserMenu username={username}>
          <Avatar>
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </UserMenu>
      </div>
    </header>
  );
}
