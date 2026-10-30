"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Check, Loader2, Lock, RefreshCw, ShieldCheck, Wallet } from "lucide-react";

import {
  confirmPassAction,
  confirmSubscriptionAction,
  startPassOrderAction,
  startSubscriptionAction,
  type RazorpayResult,
} from "@/app/actions/churroai";
import { getPassDisplayPrice, isForeignUser, passLength, type AiConfig, type AiMember } from "@/lib/churroaiShared";
import { cn, formatPrice } from "@/lib/format";
import { openRazorpayCheckout, type RazorpaySubscriptionSuccessResponse } from "@/lib/razorpay";

type Plan = "auto" | "once";

const inputClass =
  "w-full rounded-xl border border-line/60 bg-white px-4 py-3 text-[0.95rem] text-ink transition-colors placeholder:text-muted/50 focus:border-forest/50 focus:outline-none";

export function Paywall({
  config,
  member,
  heading,
  lede,
}: {
  config: AiConfig;
  member: AiMember;
  heading: string;
  lede: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [plan, setPlan] = useState<Plan>(config.autoRenewEnabled ? "auto" : "once");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const period = passLength(config.passDays);

  async function settle(res: { ok: true } | { ok: false; error: string }) {
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    router.refresh();
  }

  const finish = async (orderId: string, razorpay?: RazorpayResult) => settle(await confirmPassAction(orderId, razorpay));
  const finishSubscription = async (razorpay?: RazorpaySubscriptionSuccessResponse) =>
    settle(await confirmSubscriptionAction(razorpay));

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError("Enter your name for the invoice.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email. Your invoice goes there.");

    setBusy(true);
    const isIntl = isForeignUser(config.estimate);
    if (plan === "auto") return subscribe();
    const started = await startPassOrderAction({ name: name.trim(), email: email.trim(), isInternational: isIntl });
    if (!started.ok) {
      setError(started.error);
      setBusy(false);
      return;
    }
    const order = started.data;
    if (order.testMode) return void finish(order.id);

    let paid = false;
    try {
      await openRazorpayCheckout(
        {
          key: order.razorpayKeyId,
          amount: Math.round(order.amount * 100),
          currency: order.currency,
          name: "Churro AI",
          description: order.passName,
          order_id: order.providerOrderId,
          prefill: { name: order.buyer.name, email: order.buyer.email, contact: order.buyer.phone || undefined },
          theme: { color: "#294B32" },
          handler: (response) => {
            paid = true;
            void finish(order.id, response);
          },
          modal: {
            ondismiss: () => {
              if (!paid) setBusy(false);
            },
          },
        },
        (failure) => setError(failure.error.description || "The payment didn't go through. You can try again."),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open the payment window.");
      setBusy(false);
    }
  }

  /** Auto-renewal: the buyer approves a UPI Autopay or card mandate once, and the first charge is taken now. */
  async function subscribe() {
    const isIntl = isForeignUser(config.estimate);
    const started = await startSubscriptionAction({ name: name.trim(), email: email.trim(), isInternational: isIntl });
    if (!started.ok) {
      setError(started.error);
      setBusy(false);
      return;
    }
    const sub = started.data;
    if (sub.testMode) return void finishSubscription();

    let paid = false;
    try {
      await openRazorpayCheckout<RazorpaySubscriptionSuccessResponse>(
        {
          key: sub.razorpayKeyId,
          subscription_id: sub.id,
          name: "Churro AI",
          description: `${sub.passName}, renews every ${passLength(sub.passDays)}`,
          prefill: { name: sub.buyer.name, email: sub.buyer.email },
          theme: { color: "#294B32" },
          handler: (response) => {
            paid = true;
            void finishSubscription(response);
          },
          modal: {
            ondismiss: () => {
              if (!paid) setBusy(false);
            },
          },
        },
        (failure) => setError(failure.error.description || "The payment didn't go through. You can try again."),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open the payment window.");
      setBusy(false);
    }
  }

  return (
    <div className="border-line/70 mx-auto grid max-w-4xl overflow-hidden rounded-3xl border bg-[#fffdf9] shadow-[0_40px_90px_-50px_rgba(22,59,41,0.55)] md:grid-cols-[1fr_1.05fr]">
      <div className="bg-forest-deep text-cream relative overflow-hidden p-8 sm:p-10">
        <div aria-hidden="true" className="bg-forest-soft/40 pointer-events-none absolute -top-20 -right-20 size-72 rounded-full blur-3xl" />
        <div className="relative">
          <span className="bg-cream/10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-semibold tracking-wide uppercase">
            <Lock className="size-3" />
            {config.passName}
          </span>
          <p className="font-display mt-6 text-[3rem] leading-none font-semibold">
            {getPassDisplayPrice(config.passPrice, config.estimate)}
            <span className="text-cream/60 font-sans text-[1rem] font-normal"> / {passLength(config.passDays)}</span>
          </p>
          <p className="text-cream/60 mt-2 text-[0.82rem]">
            {plan === "auto" ? `Renews every ${period}, cancel anytime.` : "One payment, no auto-renewal."}
          </p>
          <ul className="mt-8 space-y-3 text-[0.92rem]">
            {[
              "Unlimited use of the Recipe Cost Calculator",
              "Print, PDF and CSV export",
              "Sign in from any device with your email",
              "GST invoice by email",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-gold)]" strokeWidth={2.4} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <form onSubmit={pay} noValidate className="space-y-5 p-8 sm:p-10">
        <div>
          <h2 className="font-display text-ink text-[1.6rem] leading-tight font-medium">{heading}</h2>
          <p className="text-muted mt-2 text-[0.92rem] leading-relaxed">{lede}</p>
        </div>
        {config.autoRenewEnabled && (
          <fieldset className="grid gap-2.5 sm:grid-cols-2">
            <legend className="text-ink mb-2 text-[0.85rem] font-medium">How would you like to pay?</legend>
            {(
              [
                { value: "auto", icon: RefreshCw, title: "Auto-renew", note: `Charged every ${period}. Cancel anytime.` },
                { value: "once", icon: Wallet, title: "Pay once", note: `Covers ${period === "year" ? "one year" : period}, then it simply ends.` },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                  plan === option.value ? "border-forest bg-forest/5" : "border-line/70 hover:border-forest/40",
                )}
              >
                <input
                  type="radio"
                  name="plan"
                  value={option.value}
                  checked={plan === option.value}
                  onChange={() => setPlan(option.value)}
                  className="accent-forest mt-1"
                />
                <span>
                  <span className="text-ink flex items-center gap-1.5 text-[0.9rem] font-medium">
                    <option.icon className="text-forest size-3.5" strokeWidth={2} />
                    {option.title}
                  </span>
                  <span className="text-muted mt-0.5 block text-[0.78rem] leading-snug">{option.note}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
        <label className="block space-y-2">
          <span className="text-ink block text-[0.85rem] font-medium">Name for the invoice</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-ink block text-[0.85rem] font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="Your invoice is emailed here"
            className={inputClass}
          />
        </label>
        {error && <p className="text-[0.85rem] text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="bg-forest text-cream hover:bg-forest-deep flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-medium transition-colors disabled:opacity-70"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {plan === "auto"
            ? `Start auto-renew · ${getPassDisplayPrice(config.passPrice, config.estimate)} / ${period}`
            : `Pay ${getPassDisplayPrice(config.passPrice, config.estimate)}`}
        </button>
        <p className="text-muted flex items-center justify-center gap-1.5 text-center text-[0.75rem]">
          <ShieldCheck className="size-3.5 shrink-0" />
          {plan === "auto"
            ? "Secure UPI Autopay or card mandate by Razorpay. You're told before each charge."
            : "Secure payment by Razorpay"}
        </p>
      </form>
    </div>
  );
}
