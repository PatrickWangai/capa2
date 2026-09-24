"use client";

import * as React from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import { signOutAction } from "@/app/(app)/actions";

export function UserMenu({ username, children }: { username: string; children: React.ReactNode }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {children}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-52 rounded-lg border border-line bg-surface p-1.5 shadow-lg"
        >
          <DropdownMenu.Item asChild>
            <Link
              href={`/profile/${username}`}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] text-ink-soft outline-none hover:bg-surface-raised hover:text-ink"
            >
              <User className="size-4" /> View profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] text-ink-soft outline-none hover:bg-surface-raised hover:text-ink"
            >
              <Settings className="size-4" /> Settings
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1.5 h-px bg-line" />
          <DropdownMenu.Item asChild>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] text-loss outline-none hover:bg-loss-tint"
              >
                <LogOut className="size-4" /> Log out
              </button>
            </form>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
