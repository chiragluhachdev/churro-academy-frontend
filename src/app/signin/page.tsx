import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";

import { Brand } from "@/components/churroai/Brand";
import { LoginForm } from "@/components/churroai/LoginForm";
import { fetchAiConfigForVisitor, fetchAiMember } from "@/lib/churroai";
import { formatTrialLength, getPassDisplayPrice, passLength } from "@/lib/churroaiShared";

export const metadata: Metadata = {
  title: { absolute: "Sign in · Churro AI" },
  robots: { index: false, follow: false },
};

/** Only ever send people back inside Churro AI — never to an arbitrary URL from the query string. */
function safeNext(raw: string | undefined): string {
  return raw && raw.startsWith("/calculator") ? raw : "/calculator";
}

export default async function ChurroAiLoginPage({ searchParams }: { searchParams?: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams)?.next);
  const [config, member] = await Promise.all([fetchAiConfigForVisitor(), fetchAiMember()]);
  if (member) redirect(next);

  return (
    <div className="bg-cream grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Link href="/" aria-label="Churro AI home" className="w-fit">
          <Brand />
        </Link>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-ink text-[2rem] leading-tight font-medium tracking-[-0.015em]">
              Sign in to Churro AI
            </h1>
            <p className="text-muted mt-2 text-[0.95rem]">Use your email address. No password needed.</p>
            <div className="mt-8">
              <LoginForm next={next} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-forest-deep relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="bg-forest-soft/40 absolute -top-24 -left-24 size-96 rounded-full blur-3xl" />
          <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-[var(--color-gold)]/20 blur-3xl" />
        </div>
        <div className="relative max-w-sm px-10">
          <p className="text-cream/60 text-[0.72rem] font-medium tracking-[0.2em] uppercase">How it works</p>
          <ul className="mt-6 space-y-5">
            {[
              `Your first try is free: ${formatTrialLength(config.trialMinutes)} with the Recipe Calculator.`,
              `Then ${getPassDisplayPrice(config.passPrice, config.estimate)} a ${passLength(config.passDays)} for unlimited use.`,
              "Pay securely with Razorpay. Your GST invoice comes by email.",
            ].map((line) => (
              <li key={line} className="text-cream flex items-start gap-3 text-[1rem] leading-relaxed">
                <span className="bg-cream/10 text-cream mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-3.5" strokeWidth={2.4} />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
