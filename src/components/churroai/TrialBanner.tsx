"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

import { passLength, type AiConfig } from "@/lib/churroaiShared";
import { formatPrice } from "@/lib/format";

function remaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Counts the free try down and, when it hits zero, re-asks the server — which
 * then shows the paywall instead of the calculator. The clock only starts
 * after mount, so the server and browser never render different numbers.
 */
export function TrialBanner({ endsAt, config, onUpgrade }: { endsAt: string; config: AiConfig; onUpgrade: () => void }) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  const end = new Date(endsAt).getTime();

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const every = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, []);

  useEffect(() => {
    if (now !== null && now >= end) router.refresh();
  }, [now, end, router]);

  return (
    <div className="border-[var(--color-gold)]/40 bg-[var(--color-gold)]/12 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 print:hidden">
      <p className="text-ink flex items-center gap-2.5 text-[0.9rem]">
        <Timer className="size-4 shrink-0 text-[var(--color-gold)]" strokeWidth={1.8} />
        <span>
          Free try · <span className="font-mono font-semibold tabular-nums">{now === null ? "--:--" : remaining(end - now)}</span> left
        </span>
      </p>
      <button
        type="button"
        onClick={onUpgrade}
        className="bg-forest text-cream hover:bg-forest-deep rounded-full px-4 py-2 text-[0.82rem] font-medium transition-colors"
      >
        Keep it · {formatPrice(config.passPrice)} / {passLength(config.passDays)}
      </button>
    </div>
  );
}
