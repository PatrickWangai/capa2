import Link from "next/link";
import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Markets", href: "/markets" },
      { label: "Pricing", href: "/pricing" },
      { label: "Learn", href: "/learn" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/about" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Start investing", href: "/signup" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-[32ch] text-[13.5px] leading-relaxed text-muted">
              Trade, discover, and connect with investors across Kenyan and global markets.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[12px] font-semibold uppercase tracking-wide text-faint">{col.heading}</h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[13.5px] text-ink-soft hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[12.5px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Capa. All figures shown are illustrative — this is a sandbox environment.</p>
          <p>Not a licensed broker-dealer. No real funds are traded.</p>
        </div>
      </div>
    </footer>
  );
}
