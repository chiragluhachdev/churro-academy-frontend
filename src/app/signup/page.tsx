import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Churro Academy account and start learning to bake.",
};

export default async function SignupPage() {
  // A signed-in user has no business on the signup form.
  const session = await getSession();
  if (session) redirect(session.user.role === "admin" ? "/admin" : `/${session.user.username}/dashboard`);

  return (
    <AuthShell
      title="Start baking today."
      lede="Create an account to enroll, track progress and earn certificates."
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
