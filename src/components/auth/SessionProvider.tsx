"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

/**
 * Needed by client components that call useSession()/update(). Seeded with
 * the server-read session so the navbar never flashes "logged out" while
 * next-auth's client fetch is still in flight.
 */
export function SessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}
