"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Loader2, Mail } from "lucide-react";

import { requestOtpAction, verifyOtpAction } from "@/app/actions/churroai";

const inputClass =
  "w-full rounded-xl border border-line/60 bg-white px-4 py-3 text-[1rem] text-ink transition-colors placeholder:text-muted/50 focus:border-forest/50 focus:outline-none";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  function sendCode() {
    setError(null);
    startTransition(async () => {
      const res = await requestOtpAction(email);
      if (!res.ok) return setError(res.error);
      setSentTo(res.data.email);
      setCode("");
      setStep("code");
      setResendIn(30);
    });
  }

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await verifyOtpAction(sentTo, code);
      if (!res.ok) return setError(res.error);
      router.replace(next);
      router.refresh();
    });
  }

  if (step === "email") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendCode();
        }}
        noValidate
        className="space-y-5"
      >
        <label className="block space-y-2">
          <span className="text-ink block text-[0.85rem] font-medium">Email address</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>
        {error && <p className="text-[0.85rem] text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="bg-forest text-cream hover:bg-forest-deep flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-medium transition-colors disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          Email me a code
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} noValidate className="space-y-5">
      <p className="text-muted text-[0.9rem] leading-relaxed">
        We emailed a 6-digit code to <span className="text-ink font-medium break-all">{sentTo}</span>. It can take a
        minute, so check your spam folder too.{" "}
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setError(null);
          }}
          className="text-forest font-medium hover:underline"
        >
          Change email
        </button>
      </p>

      <label className="block space-y-2">
        <span className="text-ink block text-[0.85rem] font-medium">Code</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className={`${inputClass} text-center font-mono text-[1.25rem] tracking-[0.4em]`}
        />
      </label>
      {error && <p className="text-[0.85rem] text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending || code.length < 6}
        className="bg-forest text-cream hover:bg-forest-deep flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-medium transition-colors disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Verify &amp; continue
        {!pending && <ArrowRight className="size-4" />}
      </button>
      <p className="text-muted text-center text-[0.82rem]">
        {resendIn > 0 ? (
          `Resend code in ${resendIn}s`
        ) : (
          <button type="button" onClick={sendCode} disabled={pending} className="text-forest font-medium hover:underline">
            Resend code
          </button>
        )}
      </p>
    </form>
  );
}
