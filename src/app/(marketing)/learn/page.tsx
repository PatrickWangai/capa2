import type { Metadata } from "next";

export const metadata: Metadata = { title: "Learn" };

const CATEGORIES = [
  {
    name: "Investing basics",
    articles: ["What is a P/E ratio?", "How dividends work", "Market vs. limit orders"],
  },
  {
    name: "Portfolio construction",
    articles: ["How diversification works", "Understanding risk and time horizon", "Rebalancing a portfolio"],
  },
  {
    name: "Kenyan & global markets",
    articles: ["How the NSE works", "Investing in US stocks from Kenya", "What ETFs actually hold"],
  },
];

export default function LearnPage() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">Learn</p>
      <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Investing, explained plainly.</h1>

      <div className="mt-12 space-y-12">
        {CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <h2 className="text-[15px] font-semibold text-ink">{cat.name}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {cat.articles.map((title) => (
                <div key={title} className="rounded-xl border border-line p-5 transition-colors hover:border-ink">
                  <p className="text-[14px] font-medium leading-snug text-ink">{title}</p>
                  <p className="mt-2 text-[12.5px] text-faint">4 min read</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
