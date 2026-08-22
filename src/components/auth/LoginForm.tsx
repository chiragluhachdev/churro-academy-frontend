"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Field } from "@/components/auth/Field";
import { SocialButtons } from "@/components/auth/SocialButtons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Passwords are at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // No backend yet: this only simulates the round trip so the dashboard is
    // reachable. Swap for NextAuth's signIn("credentials", …) in Phase 4b.
    setSubmitting(true);
    window.setTimeout(() => router.push("/dashboard"), 600);
  }

  return (
    <div>
      <SocialButtons />

      <div className="my-7 flex items-center gap-4">
        <span className="bg-line h-px flex-1" />
        <span className="text-muted text-[0.75rem] tracking-wide uppercase">
          or with email
        </span>
        <span className="bg-line h-px flex-1" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />

        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          action={
            <Link
              href="/forgot-password"
              className="text-forest text-[0.78rem] font-medium hover:underline"
            >
              Forgot password?
            </Link>
          }
        />

        <label className="text-muted flex cursor-pointer items-center gap-2.5 text-[0.85rem] select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="accent-forest size-4 rounded"
          />
          Keep me signed in
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="bg-forest text-cream hover:bg-forest-deep group inline-flex w-full items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.95rem] font-medium transition-colors duration-300 disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <p className="text-muted mt-5 text-[0.75rem] leading-relaxed">
        Demo build — authentication isn&rsquo;t connected yet, so any valid-looking
        details will open the dashboard.
      </p>
    </div>
  );
}
