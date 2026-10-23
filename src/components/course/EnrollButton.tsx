"use client";

import { ArrowRight, MessageCircle, Pencil } from "lucide-react";

import { useCheckout } from "@/components/checkout/CheckoutProvider";
import { whatsappNumber } from "@/data/site";
import { cn } from "@/lib/format";

/**
 * The single call to action on a course page. What it does depends on who is
 * looking — see CheckoutProvider.enroll. While the admin has paused sales,
 * visitors get the pause message and a way to reach us instead of checkout.
 */
export function EnrollButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { viewer, pausedMessage, enroll } = useCheckout();

  const base = cn(
    "group inline-flex w-full items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.95rem] font-medium whitespace-nowrap transition-colors duration-300",
    className,
  );

  if (viewer === "admin") {
    return (
      <button type="button" onClick={enroll} className={cn(base, "border-forest/30 text-forest hover:bg-forest/5 border")}>
        <Pencil className="size-4" />
        Edit course
      </button>
    );
  }

  if (pausedMessage) {
    const contact = (
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi! I'd like to know when I can enrol in a course.")}`}
        target="_blank"
        rel="noreferrer"
        className={cn(base, "border-forest/30 text-forest hover:bg-forest/5 border")}
      >
        <MessageCircle className="size-4" />
        {compact ? "Unavailable · Contact us" : "Contact us"}
      </a>
    );
    if (compact) return contact;
    return (
      <div className="space-y-3">
        <div className="bg-[var(--color-gold)]/12 border-[var(--color-gold)]/40 rounded-xl border px-4 py-3 text-center">
          <p className="text-ink text-[0.88rem] font-semibold">Currently unavailable</p>
          <p className="text-muted mt-1 text-[0.8rem] leading-snug">{pausedMessage}</p>
        </div>
        {contact}
      </div>
    );
  }

  return (
    <button type="button" onClick={enroll} className={cn(base, "bg-forest text-cream hover:bg-forest-deep")}>
      Enroll Now
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}
