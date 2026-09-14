import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNextPath } from "@/lib/safe-redirect";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin sign in",
  description: "Sign in to manage Churro Academy.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) {
    // Already signed in: carry on to where they were headed, else /admin.
    const next = safeNextPath((await searchParams)?.next);
    redirect(next ?? "/admin");
  }

  return (
    <AuthShell title="Admin sign in." lede="Manage courses, content and orders.">
      <LoginForm />
    </AuthShell>
  );
}
