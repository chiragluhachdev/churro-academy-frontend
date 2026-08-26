import { redirect } from "next/navigation";

import { auth } from "@/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "student" | "admin";
  image?: string | null;
};

export type Session = { user: SessionUser; accessToken: string };

export async function getSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    user: session.user as SessionUser,
    accessToken: (session as { accessToken?: string }).accessToken ?? "",
  };
}

/** Session, or bounce to login remembering where they were headed. */
export async function requireSession(returnTo?: string): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(`/login${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ""}`);
  }
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession("/admin");
  if (session.user.role !== "admin") redirect(dashboardPath(session.user.username));
  return session;
}

export function dashboardPath(username: string): string {
  return `/${username}/dashboard`;
}
