import type { Metadata } from "next";
import { listReportsForAdmin } from "@/services/admin";
import { ReportResolveButtons } from "@/components/admin/report-resolve-buttons";

export const metadata: Metadata = { title: "Admin — Content" };

export default async function AdminContentPage() {
  const reports = await listReportsForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Reported content</h1>
      {reports.length === 0 ? (
        <p className="mt-6 text-[13.5px] text-muted">No open reports.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-line p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12.5px] text-faint">Reported by @{r.reporter.username} · {r.targetType}</p>
                  <p className="mt-1 text-[13.5px] text-ink-soft">Reason: {r.reason}</p>
                  {r.post && <p className="mt-2 rounded-lg bg-surface-raised p-3 text-[13px] text-ink">{r.post.content}</p>}
                  {r.comment && <p className="mt-2 rounded-lg bg-surface-raised p-3 text-[13px] text-ink">{r.comment.body}</p>}
                </div>
                <ReportResolveButtons reportId={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
