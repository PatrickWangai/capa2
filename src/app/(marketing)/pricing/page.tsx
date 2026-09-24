import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Pricing" };

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    copy: "Everything you need to start investing and learning.",
    features: ["Kenyan, US, and global trading", "Market Pulse & social feed", "One investment circle", "Standard order execution"],
  },
  {
    name: "Plus",
    price: "KES 500/mo",
    copy: "For active investors who want deeper tools.",
    features: ["Everything in Starter", "Unlimited watchlists", "Portfolio Time Machine & simulator", "Priority market briefs"],
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-20">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Pricing</p>
      <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Straightforward pricing.</h1>
      <p className="mt-3 max-w-[50ch] text-[14.5px] text-muted">
        Trading commissions are a flat 0.5% per order (minimum KES 10) — no hidden spreads while Capa runs on its
        simulated broker.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-7 ${plan.highlighted ? "border-ink" : "border-line"}`}
          >
            <h2 className="text-[15px] font-semibold text-ink">{plan.name}</h2>
            <p className="mt-2 text-2xl font-bold text-ink">{plan.price}</p>
            <p className="mt-2 text-[13.5px] text-muted">{plan.copy}</p>
            <ul className="mt-5 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13.5px] text-ink-soft">
                  <Check className="mt-0.5 size-4 shrink-0 text-gain" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full" variant={plan.highlighted ? "primary" : "outline"}>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
