import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your Churro Academy account to continue learning.",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.user.role === "admin" ? "/admin" : `/${session.user.username}/dashboard`);
  }

  return (
    <AuthShell
      title="Welcome back."
      lede="Sign in to pick up where you left off."
      footer={
        <p className="text-muted text-[0.9rem]">
          New here?{" "}
          <Link href="/signup" className="text-forest font-medium hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
