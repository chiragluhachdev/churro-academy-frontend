"use client";

import { ArrowRight, Pencil } from "lucide-react";

import { useCheckout } from "@/components/checkout/CheckoutProvider";
import { cn } from "@/lib/format";

/**
 * The single call to action on a course page. What it does depends on who is
 * looking — see CheckoutProvider.enroll.
 */
export function EnrollButton({ className }: { className?: string }) {
  const { viewer, enroll } = useCheckout();

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

  return (
    <button type="button" onClick={enroll} className={cn(base, "bg-forest text-cream hover:bg-forest-deep")}>
      Enroll Now
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}
