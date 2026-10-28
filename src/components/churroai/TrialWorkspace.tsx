"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Timer, X } from "lucide-react";

import { claimTrialExportAction } from "@/app/actions/churroai";
import { CostCalculator } from "@/components/calculator/CostCalculator";
import { Paywall } from "@/components/churroai/Paywall";
import { TrialBanner } from "@/components/churroai/TrialBanner";
import { passLength, type AiConfig, type AiMember } from "@/lib/churroaiShared";

/** Heads-up popups while the free try runs, in ms left: the first at 5 minutes, the last at 1. */
const WARNINGS = [5 * 60_000, 60_000];

/**
 * The calculator during a free try. Owns the clock: a countdown strip on top,
 * a heads-up popup near the end, and — the moment time runs out — a screen
 * over the calculator that only paying clears. The server makes the same
 * call on the next page load, so this is the live version of that.
 */
export function TrialWorkspace({ config, member }: { config: AiConfig; member: AiMember }) {
  const end = new Date(member.trialEndsAt!).getTime();
  const [now, setNow] = useState<number | null>(null);
  const [showPass, setShowPass] = useState(false);
  // The most recent warning step shown (index into WARNINGS), so each pops once.
  const [warned, setWarned] = useState(-1);
  const [warningOpen, setWarningOpen] = useState(false);
  const [exportUsed, setExportUsed] = useState(member.trialExportUsed);
  const [exportError, setExportError] = useState<string | null>(null);

  const openPass = () => {
    setShowPass(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function claimExport() {
    setExportError(null);
    const res = await claimTrialExportAction();
    if (!res.ok) {
      setExportError(res.error);
      setExportUsed(true);
      openPass();
      return false;
    }
    setExportUsed(true);
    return true;
  }

  useEffect(() => {
    // Ticks from the real clock, so a laptop waking from sleep catches up at once.
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const every = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, []);

  const left = now === null ? null : Math.max(0, end - now);
  const expired = left !== null && left <= 0;

  // A threshold already passed on arrival (opened with 3 minutes left) counts as warned, without a popup.
  const step = left === null ? -1 : WARNINGS.reduce((acc, t, i) => (left <= t ? i : acc), -1);
  if (step > warned) {
    setWarned(step);
    if (!expired && left !== null && left > WARNINGS[step] - 2000) setWarningOpen(true);
  }

  // Nothing behind the time's-up screen should scroll.
  useEffect(() => {
    if (!expired) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expired]);

  const minutesLeft = left === null ? 0 : Math.max(1, Math.ceil(left / 60_000));

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <TrialBanner left={left} config={config} onUpgrade={() => setShowPass((v) => !v)} />
      </div>
      {showPass && !expired && (
        <div className="px-5 pt-8 sm:px-8 print:hidden">
          <Paywall
            config={config}
            member={member}
            heading="Keep the calculator"
            lede={`Get the pass now and carry on without a break, with unlimited use for a full ${passLength(config.passDays)}.`}
          />
        </div>
      )}

      {exportError && (
        <p className="mx-auto max-w-[1400px] px-5 pt-4 text-[0.85rem] text-red-600 sm:px-8 print:hidden">{exportError}</p>
      )}
      <div inert={expired} aria-hidden={expired} className={expired ? "pointer-events-none blur-[3px] select-none" : undefined}>
        <CostCalculator exportGate={{ used: exportUsed, claim: claimExport, onLocked: openPass }} />
      </div>

      {/* Heads-up near the end. */}
      <AnimatePresence>
        {warningOpen && !expired && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="border-line/70 fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-sm rounded-2xl border bg-[#fffdf9] p-5 shadow-[0_30px_70px_-30px_rgba(22,59,41,0.6)] sm:left-auto print:hidden"
          >
            <button
              type="button"
              onClick={() => setWarningOpen(false)}
              aria-label="Dismiss"
              className="text-muted hover:text-ink absolute top-3 right-3 rounded-full p-1"
            >
              <X className="size-4" />
            </button>
            <p className="text-ink flex items-center gap-2 text-[0.95rem] font-medium">
              <Timer className="size-4 text-red-600" />
              {minutesLeft} {minutesLeft === 1 ? "minute" : "minutes"} left in your free try
            </p>
            <p className="text-muted mt-1.5 text-[0.85rem] leading-relaxed">
              {exportUsed
                ? "Get the pass to keep going without a break."
                : "Use your one export (print, PDF or CSV) now, or get the pass to keep going without a break."}
            </p>
            <button
              type="button"
              onClick={() => {
                setWarningOpen(false);
                openPass();
              }}
              className="bg-forest text-cream hover:bg-forest-deep mt-4 rounded-full px-4 py-2 text-[0.82rem] font-medium transition-colors"
            >
              Get the pass
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time's up: covers the calculator until they pay (or leave). */}
      <AnimatePresence>
        {expired && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trial-over-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-forest-deep/45 fixed inset-0 z-50 overflow-y-auto px-4 py-8 backdrop-blur-sm sm:py-14 print:hidden"
          >
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.05 }}>
              <p
                id="trial-over-title"
                className="text-cream mx-auto mb-5 flex max-w-4xl items-center justify-center gap-2 text-center text-[0.95rem] font-medium"
              >
                <Timer className="size-4" />
                Your free try has ended
              </p>
              <Paywall
                config={config}
                member={member}
                heading="Time's up. Keep going with the pass"
                lede={`Your ${config.trialMinutes}-minute free try is over. Get the pass for unlimited use for a full ${passLength(config.passDays)}, and pick up right where you left off.`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
