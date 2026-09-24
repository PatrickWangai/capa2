"use client";

import { useState } from "react";
import { CreatePostForm } from "@/components/create-post-form";
import { Feed } from "@/components/feed";

export function SocialFeedSection() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <CreatePostForm onPosted={() => setRefreshKey((k) => k + 1)} />
      <Feed isAuthed refreshKey={refreshKey} />
    </div>
  );
}
