import type { Metadata } from "next";
import { SocialFeedSection } from "@/components/social-feed-section";

export const metadata: Metadata = { title: "Social Feed" };

export default function SocialFeedPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-bold text-ink">Capa Feed</h1>
      <div className="mt-6">
        <SocialFeedSection />
      </div>
    </div>
  );
}
