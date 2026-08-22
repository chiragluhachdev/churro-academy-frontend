import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Churro Academy account and start learning to bake.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Start baking today."
      lede="Create an account to enrol, track progress and earn certificates."
      footer={
        <p className="text-muted text-[0.9rem]">
          Already have an account?{" "}
          <Link href="/login" className="text-forest font-medium hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
