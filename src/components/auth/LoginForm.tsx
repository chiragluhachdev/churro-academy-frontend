"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Field } from "@/components/auth/Field";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { safeNextPath } from "@/lib/safe-redirect";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const result = await signIn("credentials", { email, password, redirect: false });

    if (!result || result.error) {
      setFormError("Email or password is incorrect.");
      setSubmitting(false);
      return;
    }

    // The session cookie now exists; ask the server where this user belongs.
    // Only same-site paths — an unchecked ?next= is an open redirect.
    const target = safeNextPath(params.get("next"));
    const destination = await fetch("/api/me/home").then((r) => r.text());
    router.push(target || destination || "/");
    router.refresh();
  }

  return (
    <div>
      <SocialButtons />

      <div className="my-7 flex items-center gap-4">
        <span className="bg-line h-px flex-1" />
        <span className="text-muted text-[0.75rem] tracking-wide uppercase">or with email</span>
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
        />

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[0.82rem] text-red-700">
            {formError}
          </p>
        )}

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
        Try the seeded admin: <span className="text-ink">admin@churroacademy.com</span> /{" "}
        <span className="text-ink">churro-admin</span>
      </p>

      <p className="sr-only">
        <Link href="/signup">Create an account</Link>
      </p>
    </div>
  );
}
