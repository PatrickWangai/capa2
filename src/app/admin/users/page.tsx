import type { Metadata } from "next";
import { listUsersForAdmin } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { UserStatusButton } from "@/components/admin/user-status-button";

export const metadata: Metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const users = await listUsersForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Users</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[720px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11.5px] uppercase tracking-wide text-faint">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">KYC</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-none">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{u.name}</p>
                  <p className="text-[12px] text-muted">@{u.username} · {u.email}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{u.role}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.kycApplication?.status === "VERIFIED" ? "gain" : "neutral"}>
                    {u.kycApplication?.status ?? "NOT_STARTED"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.status === "ACTIVE" ? "gain" : "loss"}>{u.status}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-soft">{u.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <UserStatusButton userId={u.id} status={u.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
