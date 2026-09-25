import type { Metadata } from "next";
import { listTransactionsForAdmin } from "@/services/admin";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Admin — Transactions" };

export default async function AdminTransactionsPage() {
  const transactions = await listTransactionsForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Transactions</h1>
      <div className="mt-6 overflow-x-auto rounded-md border-2 border-line-strong">
        <table className="w-full min-w-[640px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11.5px] uppercase tracking-wide text-faint">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-none">
                <td className="px-4 py-3 text-ink-soft">@{t.wallet.user.username}</td>
                <td className="px-4 py-3 text-ink-soft">{t.type.replaceAll("_", " ")}</td>
                <td className="px-4 py-3 text-ink-soft">{t.description ?? "—"}</td>
                <td className={`px-4 py-3 text-right font-tabular font-medium ${Number(t.amount) >= 0 ? "text-gain" : "text-loss"}`}>
                  {formatMoney(t.amount)}
                </td>
                <td className="px-4 py-3 text-ink-soft">{t.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
