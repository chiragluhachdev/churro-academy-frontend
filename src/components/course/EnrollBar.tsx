"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/format";
import type { Course } from "@/types/course";

/**
 * Mobile-only sticky bottom bar with price + "Enroll Now" button.
 * Hidden on desktop where the sidebar EnrollCard is visible.
 */
export function EnrollBar({ course }: { course: Course }) {
  const [visible, setVisible] = useState(false);
  const price = course.discountPrice ?? course.price;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "bg-cream/90 border-line/60 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md transition-transform duration-500 ease-[var(--ease-editorial)] lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <div>
          <p className="font-display text-ink text-[1.35rem] font-semibold leading-none">
            {formatPrice(price)}
          </p>
          {course.discountPrice && (
            <p className="text-muted mt-0.5 text-[0.75rem] line-through">
              {formatPrice(course.price)}
            </p>
          )}
        </div>
        <a
          href="#enroll"
          className="bg-forest text-cream hover:bg-forest-deep active:translate-y-px inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.9rem] font-medium transition-all duration-300"
        >
          Enroll Now
          <ArrowRight className="size-4" />
        </a>
      </div>
    </div>
  );
}
