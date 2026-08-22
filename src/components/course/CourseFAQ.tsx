"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/format";
import type { CourseFAQ } from "@/types/course";

export function CourseFAQSection({ faqs }: { faqs: CourseFAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <section>
      <Reveal>
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="font-display text-ink mt-3 text-[1.65rem] leading-[1.15] font-medium tracking-[-0.01em] sm:text-[1.9rem]">
          Common Questions
        </h2>

        <div className="border-line/70 mt-7 divide-y divide-[var(--color-line)]/70 overflow-hidden rounded-2xl border">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="hover:bg-cream-warm flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
                >
                  <span className="text-ink text-[0.92rem] font-semibold leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "text-muted size-5 shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-[var(--ease-editorial)]",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="text-muted px-6 pt-0 pb-5 text-[0.88rem] leading-[1.7]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
