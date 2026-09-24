import type { NextAuthConfig } from "next-auth";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/portfolio",
  "/trade",
  "/orders",
  "/watchlist",
  "/wallet",
  "/social",
  "/discover",
  "/simulate",
  "/briefing",
  "/profile",
  "/settings",
  "/circles",
  "/notifications",
];

/**
 * Edge-safe config shared by middleware and the full server-side auth().
 * Must never import anything that touches Prisma (or any Node-only API) —
 * middleware runs on the Edge runtime and only ever sees this file.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAuthed = !!auth?.user;
      const isAdminPath = pathname.startsWith("/admin");
      const isProtected = isAdminPath || PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

      if (!isProtected) return true;
      if (!isAuthed) return false;
      if (isAdminPath && auth.user.role !== "ADMIN") return Response.redirect(new URL("/forbidden", request.nextUrl.origin));
      return true;
    },
  },
} satisfies NextAuthConfig;
