import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getKYCProvider } from "@/services/providers/kyc";
import { PrivacyToggles } from "@/components/privacy-toggles";
import { KYCForm } from "@/components/kyc-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  const [user, kycProvider] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: session!.user.id }, include: { profile: true } }),
    Promise.resolve(getKYCProvider()),
  ]);
  const kycStatus = await kycProvider.getStatus(session!.user.id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-bold text-ink">Settings</h1>

      <section className="mt-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-faint">Account</h2>
        <div className="mt-2 rounded-md border-2 border-line-strong shadow-hard-sm p-4 text-[13.5px]">
          <p className="text-ink-soft">
            <span className="text-faint">Name</span> — {user.name}
          </p>
          <p className="mt-1.5 text-ink-soft">
            <span className="text-faint">Username</span> — @{user.username}
          </p>
          <p className="mt-1.5 text-ink-soft">
            <span className="text-faint">Email</span> — {user.email}
          </p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-faint">Social privacy</h2>
        <div className="mt-2">
          {user.profile && <PrivacyToggles initial={user.profile} />}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-faint">Identity verification</h2>
        <div className="mt-2">
          <KYCForm initialStatus={kycStatus} />
        </div>
      </section>
    </div>
  );
}
