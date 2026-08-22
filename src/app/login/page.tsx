import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your Churro Academy account to continue learning.",
};

export default function LoginPage() {
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
