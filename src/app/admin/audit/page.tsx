import type { Metadata } from "next";
import { listAuditLog } from "@/services/admin";

export const metadata: Metadata = { title: "Admin — Audit Log" };

export default async function AdminAuditPage() {
  const logs = await listAuditLog();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Audit log</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[640px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11.5px] uppercase tracking-wide text-faint">
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-line last:border-none">
                <td className="px-4 py-3 text-ink-soft">{log.actor ? `@${log.actor.username}` : "System"}</td>
                <td className="px-4 py-3 font-medium text-ink">{log.action}</td>
                <td className="px-4 py-3 text-ink-soft">{log.targetType ? `${log.targetType} · ${log.targetId}` : "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{log.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
