"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Field } from "@/components/auth/Field";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { cn } from "@/lib/format";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function scorePassword(value: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (value.length < 8) return { score: 0, label: "Too short" };
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(value)).length;
  if (classes <= 1) return { score: 1, label: "Weak" };
  if (classes === 2 || value.length < 12) return { score: 2, label: "Good" };
  return { score: 3, label: "Strong" };
}

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = scorePassword(password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Tell us what to call you.";
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (!accepted) next.terms = "Please accept the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setFormError(data.error ?? "Could not create your account.");
      setSubmitting(false);
      return;
    }

    // Account exists — sign straight in so they land on their dashboard.
    const result = await signIn("credentials", { email, password, redirect: false });
    if (!result || result.error) {
      router.push("/login");
      return;
    }
    router.push(`/${data.username}/dashboard`);
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
          label="Full name"
          name="name"
          placeholder="Chirag Luhach"
          autoComplete="name"
          value={name}
          onChange={setName}
          error={errors.name}
        />
        <p className="text-muted -mt-3 text-[0.75rem]">
          Your dashboard will live at{" "}
          <span className="text-ink">
            /{name.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9]/g, "") || "…"}/dashboard
          </span>
        </p>

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

        <div>
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            error={errors.password}
          />
          {password.length > 0 && !errors.password && (
            <div className="mt-2.5 flex items-center gap-3">
              <span className="flex flex-1 gap-1.5" aria-hidden="true">
                {[1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      strength.score >= step ? "bg-forest" : "bg-line",
                    )}
                  />
                ))}
              </span>
              <span className="text-muted w-14 text-right text-[0.75rem]">{strength.label}</span>
            </div>
          )}
        </div>

        <div>
          <label className="text-muted flex cursor-pointer items-start gap-2.5 text-[0.85rem] leading-[1.6] select-none">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="accent-forest mt-0.5 size-4 shrink-0 rounded"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-forest hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-forest hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          {errors.terms && (
            <p role="alert" className="mt-2 text-[0.78rem] text-red-600">{errors.terms}</p>
          )}
        </div>

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
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
