import type { Metadata } from "next";
import { listPendingKyc } from "@/services/admin";
import { KycReviewButtons } from "@/components/admin/kyc-review-buttons";

export const metadata: Metadata = { title: "Admin — KYC" };

export default async function AdminKycPage() {
  const applications = await listPendingKyc();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Pending KYC review</h1>
      {applications.length === 0 ? (
        <p className="mt-6 text-[13.5px] text-muted">No pending applications.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center justify-between gap-4 rounded-md border-2 border-line-strong shadow-hard-sm p-4">
              <div>
                <p className="text-[14px] font-medium text-ink">{app.fullName}</p>
                <p className="text-[12.5px] text-muted">
                  @{app.user.username} · {app.user.email} · ID {app.idNumber}
                </p>
                <p className="text-[11.5px] text-faint">Submitted {app.createdAt.toLocaleString()}</p>
              </div>
              <KycReviewButtons applicationId={app.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
