import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-10 lg:flex">
        <Link href="/">
          <span className="inline-flex items-center gap-1.5 text-[19px] font-extrabold uppercase tracking-tight text-primary-foreground" style={{ fontFamily: "var(--font-display)" }}>
            <span className="inline-block size-2.5 rounded-[2px] bg-primary-foreground" />
            capa
          </span>
        </Link>
        <p className="max-w-[16ch] text-5xl leading-tight text-primary-foreground" style={{ fontFamily: "var(--font-script)" }}>
          Own what you build.
        </p>
        <p className="max-w-[40ch] text-[13px] text-primary-foreground/80">
          A sandbox trading and social-investing platform for Kenyan, US, and global markets.
        </p>
      </div>

      <div className="flex flex-col bg-paper">
        <header className="flex h-16 items-center border-b-2 border-line-strong px-6 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center px-5 py-12">{children}</main>
      </div>
    </div>
  );
}
