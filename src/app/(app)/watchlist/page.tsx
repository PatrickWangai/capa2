import type { Metadata } from "next";
import { auth } from "@/auth";
import { listWatchlist } from "@/services/watchlist";
import { WatchlistManager } from "@/components/watchlist-manager";

export const metadata: Metadata = { title: "Watchlist" };

export default async function WatchlistPage() {
  const session = await auth();
  const items = await listWatchlist(session!.user.id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-bold text-ink">Watchlist</h1>
      <div className="mt-6">
        <WatchlistManager initialItems={items} />
      </div>
    </div>
  );
}
