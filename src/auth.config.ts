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
    // Shared here (not just in auth.ts) because proxy.ts builds its own
    // NextAuth instance from authConfig alone — without these, the JWT never
    // gets `role`/`username` projected onto `session.user`, and the
    // `authorized` check above silently treats every user as role-less.
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.username = (user as { username: string }).username;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
