"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Info, Loader2, Smartphone } from "lucide-react";

import { requestOtpAction, verifyOtpAction } from "@/app/churroai/actions";
import { formatPhone } from "@/lib/churroaiShared";

const inputClass =
  "w-full rounded-xl border border-line/60 bg-white px-4 py-3 text-[1rem] text-ink transition-colors placeholder:text-muted/50 focus:border-forest/50 focus:outline-none";

export function LoginForm({ demoOtp, next }: { demoOtp: string; next: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
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
      const res = await requestOtpAction(phone);
      if (!res.ok) return setError(res.error);
      setSentTo(res.data.phone);
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

  if (step === "phone") {
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
          <span className="text-ink block text-[0.85rem] font-medium">Mobile number</span>
          <span className="flex items-stretch gap-2">
            <span className="border-line/60 text-ink/70 flex items-center rounded-xl border bg-white px-3.5 text-[1rem]">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className={inputClass}
            />
          </span>
        </label>
        {error && <p className="text-[0.85rem] text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="bg-forest text-cream hover:bg-forest-deep flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-medium transition-colors disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Smartphone className="size-4" />}
          Send code
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} noValidate className="space-y-5">
      <p className="text-muted text-[0.9rem] leading-relaxed">
        Enter the code sent to <span className="text-ink font-medium">{formatPhone(sentTo)}</span>.{" "}
        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setError(null);
          }}
          className="text-forest font-medium hover:underline"
        >
          Change number
        </button>
      </p>

      <div className="border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 flex items-start gap-2.5 rounded-xl border px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-[var(--color-gold)]" strokeWidth={1.8} />
        <p className="text-ink text-[0.82rem] leading-snug">
          Demo mode: text messages aren&rsquo;t connected yet, so use code{" "}
          <span className="font-mono font-semibold tracking-wider">{demoOtp}</span>.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-ink block text-[0.85rem] font-medium">Code</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={8}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className={`${inputClass} text-center font-mono text-[1.25rem] tracking-[0.4em]`}
        />
      </label>
      {error && <p className="text-[0.85rem] text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending || code.length < 4}
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
