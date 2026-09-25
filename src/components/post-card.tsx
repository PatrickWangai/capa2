"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, BadgeCheck, Flag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMoney, formatQuantity } from "@/lib/money";

export interface PostCardData {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  viewerHasLiked: boolean;
  viewerHasSaved: boolean;
  user: { username: string; name: string; avatarUrl: string | null };
  thesis: { id: string; title: string; direction: string; asset: { symbol: string } } | null;
  trade: { side: string; quantity: string; price: string; asset: { symbol: string; currency: string } } | null;
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function PostCard({ post }: { post: PostCardData }) {
  const [liked, setLiked] = useState(post.viewerHasLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saved, setSaved] = useState(post.viewerHasSaved);
  const [saveCount, setSaveCount] = useState(post.saveCount);
  const [reported, setReported] = useState(false);

  const report = async () => {
    setReported(true);
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "POST", postId: post.id, reason: "Reported by a user from the feed" }),
    });
  };

  const toggleLike = async () => {
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
  };

  const toggleSave = async () => {
    setSaved((v) => !v);
    setSaveCount((c) => c + (saved ? -1 : 1));
    await fetch(`/api/posts/${post.id}/save`, { method: "POST" });
  };

  return (
    <article className="border-b border-line py-5">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${post.user.username}`}>
          <Avatar>
            <AvatarImage src={post.user.avatarUrl ?? undefined} alt={post.user.name} />
            <AvatarFallback>{initials(post.user.name)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link href={`/profile/${post.user.username}`} className="text-[13.5px] font-semibold text-ink hover:underline">
              {post.user.name}
            </Link>
            <span className="text-[12.5px] text-faint">@{post.user.username}</span>
            <span className="text-[12.5px] text-faint">· {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {post.trade && (
            <Badge variant="gain" className="mt-2">
              <BadgeCheck className="size-3.5" /> Verified trade
            </Badge>
          )}

          {post.trade && (
            <p className="mt-2 text-[14px] text-ink">
              {post.trade.side === "BUY" ? "Bought" : "Sold"}{" "}
              <span className="font-tabular font-semibold">{formatQuantity(post.trade.quantity)} {post.trade.asset.symbol}</span>{" "}
              @ {formatMoney(post.trade.price, post.trade.asset.currency)}
            </p>
          )}

          {post.thesis && (
            <Link
              href={`/social/theses/${post.thesis.id}`}
              className="mt-2 block rounded-md border-2 border-line-strong p-3 text-[13.5px] hover:border-primary"
            >
              <span className={cn("font-semibold", post.thesis.direction === "BULL" ? "text-gain" : "text-loss")}>
                {post.thesis.direction === "BULL" ? "Bull case" : "Bear case"} · {post.thesis.asset.symbol}
              </span>
              <p className="mt-0.5 text-ink">{post.thesis.title}</p>
            </Link>
          )}

          {post.content && <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-soft">{post.content}</p>}

          <div className="mt-3 flex items-center gap-5 text-faint">
            <button onClick={toggleLike} className={cn("flex items-center gap-1.5 text-[12.5px]", liked && "text-loss")}>
              <Heart className="size-4" fill={liked ? "currentColor" : "none"} /> {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-[12.5px]">
              <MessageCircle className="size-4" /> {post.commentCount}
            </span>
            <button onClick={toggleSave} className={cn("flex items-center gap-1.5 text-[12.5px]", saved && "text-signal")}>
              <Bookmark className="size-4" fill={saved ? "currentColor" : "none"} /> {saveCount}
            </button>
            <button
              onClick={report}
              disabled={reported}
              className={cn("ml-auto flex items-center gap-1.5 text-[12.5px]", reported && "text-loss")}
            >
              <Flag className="size-3.5" /> {reported ? "Reported" : "Report"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
