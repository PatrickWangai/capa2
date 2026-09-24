import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">About Capa</p>
      <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
        A trading platform built around the reasoning, not just the trade.
      </h1>
      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink-soft">
        <p>
          Capa was built for investors who want more than a ticker and a buy button. Every position on Capa can
          carry an investment thesis — why it was opened, what would change the author&apos;s mind, and what
          actually happened next.
        </p>
        <p>
          The platform combines a real trading experience across Kenyan, US, and global markets with a social layer
          built around investment reasoning: verified trades, public theses, investor profiles, and investment
          circles.
        </p>
        <p>
          Capa is currently a sandbox. Every order executes against a simulated broker with real market-shaped
          pricing. No real funds move until a licensed broker and payment provider are connected.
        </p>
      </div>
    </section>
  );
}
