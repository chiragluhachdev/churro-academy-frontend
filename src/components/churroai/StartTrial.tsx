"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Sparkles, Timer } from "lucide-react";

import { startTrialAction } from "@/app/actions/churroai";
import { formatTrialLength, passLength, type AiConfig } from "@/lib/churroaiShared";
import { formatPrice } from "@/lib/format";

export function StartTrial({ config, triesLeft }: { config: AiConfig; triesLeft: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="border-line/70 mx-auto max-w-xl rounded-3xl border bg-[#fffdf9] p-8 text-center shadow-[0_40px_90px_-50px_rgba(22,59,41,0.55)] sm:p-10">
      <span className="bg-forest text-cream mx-auto flex size-14 items-center justify-center rounded-2xl">
        <Sparkles className="size-6" strokeWidth={1.6} />
      </span>
      <h1 className="font-display text-ink mt-6 text-[1.9rem] leading-tight font-medium tracking-[-0.015em]">
        Your free try is ready
      </h1>
      <p className="text-muted mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed">
        Cost a real recipe with the full calculator. Your try lasts{" "}
        <strong className="text-ink">{formatTrialLength(config.trialMinutes)}</strong> from the moment you start, so
        start when you have your numbers ready.
      </p>
      <p className="text-muted mt-2 text-[0.82rem]">
        {triesLeft} free {triesLeft === 1 ? "try" : "tries"} left · then {formatPrice(config.passPrice)} a{" "}
        {passLength(config.passDays)}
      </p>
      {error && <p className="mt-4 text-[0.85rem] text-red-600">{error}</p>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await startTrialAction();
            if (!res.ok) return setError(res.error);
            router.refresh();
          })
        }
        className="bg-forest text-cream hover:bg-forest-deep mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[0.95rem] font-medium transition-colors disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Timer className="size-4" />}
        Start my free try
      </button>
    </div>
  );
}
