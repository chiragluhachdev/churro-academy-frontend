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
  }
}

/**
 * Credentials are verified by the Express API — this app never sees a password
 * hash. The backend's JWT rides along inside the NextAuth session token so
 * server components can call the API as the signed-in user.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
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
      }
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
      return session;
    },
  },
});
