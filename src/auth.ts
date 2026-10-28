import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { ApiError, api } from "@/lib/api";

interface BackendUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "student" | "admin";
  avatar?: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      username: string;
      role: "student" | "admin";
      image?: string | null;
    };
    /** Backend JWT, forwarded on every API call made on this user's behalf. */
    accessToken: string;
    /** Epoch ms when this sign-in stops working, however active the admin is. */
    endsAt: number;
  }
}

/** Admin sign-ins last 10 minutes from the moment of login — activity doesn't extend them. */
export const ADMIN_SESSION_MS = 10 * 60 * 1000;

/**
 * Credentials are verified by the Express API — this app never sees a password
 * hash. The backend's JWT rides along inside the NextAuth session token so
 * server components can call the API as the signed-in user.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: ADMIN_SESSION_MS / 1000 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { user, token } = await api<{ user: BackendUser; token: string }>(
            "/auth/login",
            {
              method: "POST",
              body: {
                email: String(credentials?.email ?? ""),
                password: String(credentials?.password ?? ""),
              },
            },
          );
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            image: user.avatar || null,
            accessToken: token,
          };
        } catch (error) {
          if (error instanceof ApiError) return null;
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as unknown as BackendUser & { accessToken: string };
        token.id = u.id;
        token.username = u.username;
        token.role = u.role;
        token.accessToken = u.accessToken;
        token.loginAt = Date.now();
      }
      // Returning null ends the session. Tokens from before this limit have no
      // loginAt, so they're ended too.
      const loginAt = typeof token.loginAt === "number" ? token.loginAt : 0;
      if (Date.now() - loginAt >= ADMIN_SESSION_MS) return null;
      // The profile page renames the account and hands back a fresh backend
      // token, since the username is baked into it.
      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.username = session.user.username ?? token.username;
        if (session.accessToken) token.accessToken = session.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.role = token.role as "student" | "admin";
      session.accessToken = token.accessToken as string;
      session.endsAt = (token.loginAt as number) + ADMIN_SESSION_MS;
      return session;
    },
  },
});
