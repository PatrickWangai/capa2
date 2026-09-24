import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <header className="flex h-16 items-center px-6">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-16">{children}</main>
    </div>
  );
}
