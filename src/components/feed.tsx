"use client";

import { useEffect, useState } from "react";
import { PostCard, type PostCardData } from "@/components/post-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

type Scope = "for-you" | "following" | "trending" | "latest";

export function Feed({ isAuthed, refreshKey = 0 }: { isAuthed: boolean; refreshKey?: number }) {
  const [scope, setScope] = useState<Scope>("for-you");
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts?scope=${scope}`);
        const data = await res.json();
        if (cancelled) return;
        setPosts(data.posts);
        setCursor(data.nextCursor);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [scope, refreshKey]);

  const loadMore = async () => {
    if (!cursor) return;
    const res = await fetch(`/api/posts?scope=${scope}&cursor=${cursor}`);
    const data = await res.json();
    setPosts((prev) => [...prev, ...data.posts]);
    setCursor(data.nextCursor);
  };

  return (
    <div>
      <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
        <TabsList>
          <TabsTrigger value="for-you">For You</TabsTrigger>
          {isAuthed && <TabsTrigger value="following">Following</TabsTrigger>}
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="latest">Latest</TabsTrigger>
        </TabsList>
        <TabsContent value={scope}>
          {loading ? (
            <p className="py-10 text-center text-[13.5px] text-muted">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="py-10 text-center text-[13.5px] text-muted">Nothing here yet.</p>
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {cursor && (
                <div className="py-5 text-center">
                  <Button variant="outline" size="sm" onClick={loadMore}>
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
