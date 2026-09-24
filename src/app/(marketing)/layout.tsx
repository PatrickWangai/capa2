import { auth } from "@/auth";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-col">
      <MarketingHeader isAuthed={!!session?.user} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
