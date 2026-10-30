"use client";

import { Timer } from "lucide-react";

import { approxPrice, passLength, type AiConfig } from "@/lib/churroaiShared";
import { cn, formatPrice } from "@/lib/format";

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** The free try's countdown strip. `left` is null until mounted, so server and browser render the same thing. */
export function TrialBanner({ left, config, onUpgrade }: { left: number | null; config: AiConfig; onUpgrade: () => void }) {
  const ending = left !== null && left <= 5 * 60_000;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 transition-colors print:hidden",
        ending ? "border-red-200 bg-red-50" : "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/12",
      )}
    >
      <p className="text-ink flex items-center gap-2.5 text-[0.9rem]">
        <Timer className={cn("size-4 shrink-0", ending ? "text-red-600" : "text-[var(--color-gold)]")} strokeWidth={1.8} />
        <span>
          Free try ·{" "}
          <span className={cn("font-mono font-semibold tabular-nums", ending && "text-red-600")}>
            {left === null ? "--:--" : formatCountdown(left)}
          </span>{" "}
          left
        </span>
      </p>
      <button
        type="button"
        onClick={onUpgrade}
        className="bg-forest text-cream hover:bg-forest-deep rounded-full px-4 py-2 text-[0.82rem] font-medium transition-colors"
      >
        Get it now · {formatPrice(config.passPrice)} / {passLength(config.passDays)}
        {approxPrice(config.passPrice, config.estimate) && ` (${approxPrice(config.passPrice, config.estimate)})`}
      </button>
    </div>
  );
}
