"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

import { cancelAutoRenewAction } from "@/app/actions/churroai";
import type { AiConfig, AiMember } from "@/lib/churroaiShared";
import { formatDate, formatPrice } from "@/lib/format";

/** Where a pass member sees when they're next charged, and turns auto-renewal off. */
export function MembershipBar({ config, member }: { config: AiConfig; member: AiMember }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const until = member.passExpiresAt ? formatDate(member.passExpiresAt) : "";
  const nextCharge = member.nextChargeAt ? formatDate(member.nextChargeAt) : until;

  function cancel() {
    if (!window.confirm(`Turn off auto-renewal? You keep the pass until ${until}, and won't be charged again.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await cancelAutoRenewAction();
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  }

  const failed = member.subscriptionStatus === "pending";

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-6 sm:px-8 print:hidden">
      <div className="border-line/60 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-[#fffdf9] px-5 py-3.5">
        <p className="text-ink flex items-center gap-2 text-[0.88rem]">
          {failed ? (
            <>
              <AlertTriangle className="size-4 shrink-0 text-[var(--color-gold)]" />
              Your last renewal payment didn&rsquo;t go through. Razorpay is retrying it, and you keep access until {until}.
            </>
          ) : member.autoRenew ? (
            <>
              <RefreshCw className="text-forest size-4 shrink-0" />
              Renews automatically on {nextCharge} for {formatPrice(config.passPrice)}.
            </>
          ) : (
            <>Your pass is active until {until}. It won&rsquo;t renew on its own.</>
          )}
        </p>
        {member.autoRenew && (
          <button
            type="button"
            onClick={cancel}
            disabled={pending}
            className="text-muted hover:text-red-600 inline-flex items-center gap-1.5 text-[0.8rem] font-medium transition-colors disabled:opacity-60"
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />}
            Cancel auto-renew
          </button>
        )}
        {error && <p className="w-full text-[0.8rem] text-red-600">{error}</p>}
      </div>
    </div>
  );
}
