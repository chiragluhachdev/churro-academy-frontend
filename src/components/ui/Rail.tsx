"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/format";

interface RailProps {
  children: ReactNode;
  /** Accessible name for the scrollable region. */
  label: string;
  className?: string;
}

/**
 * Horizontal snap rail with arrow controls. On touch it is a plain swipe
 * scroller; the arrows only appear where there is room for them, and they
 * disable themselves at each end rather than wrapping around.
 */
export function Rail({ children, label, className }: RailProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    // Step by one child, so the rail always lands on a snap point.
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const arrow =
    "border-line bg-cream text-forest absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_6px_20px_-12px_rgba(41,75,50,0.5)] transition-[opacity,background-color,border-color] duration-300 hover:border-forest/40 disabled:pointer-events-none disabled:opacity-0 xl:flex";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByCard(-1)}
        disabled={atStart}
        className={cn(arrow, "-left-5")}
      >
        <ChevronLeft className="size-5" />
      </button>

      <div
        ref={scroller}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByCard(1)}
        disabled={atEnd}
        className={cn(arrow, "-right-5")}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
