"use client";

import { ChevronDown, Clock, PlayCircle } from "lucide-react";
import { useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/format";
import type { CurriculumModule } from "@/types/course";

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function Curriculum({ modules }: { modules: CurriculumModule[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalMinutes = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.duration, 0),
    0,
  );

  return (
    <section>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Course Curriculum</Eyebrow>
            <h2 className="font-display text-ink mt-3 text-[1.65rem] leading-[1.15] font-medium tracking-[-0.01em] sm:text-[1.9rem]">
              What&rsquo;s Inside
            </h2>
          </div>
          <p className="text-muted text-[0.82rem]">
            {modules.length} modules · {totalLessons} lessons ·{" "}
            {formatMinutes(totalMinutes)} total
          </p>
        </div>

        <div className="border-line/70 mt-7 divide-y divide-[var(--color-line)]/70 overflow-hidden rounded-2xl border">
          {modules.map((module, moduleIndex) => {
            const isOpen = openIndex === moduleIndex;
            const moduleDuration = module.lessons.reduce((s, l) => s + l.duration, 0);

            return (
              <div key={module.id}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : moduleIndex)}
                  aria-expanded={isOpen}
                  className="hover:bg-cream-warm flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
                >
                  <span>
                    <span className="text-ink block text-[0.95rem] font-semibold">
                      {module.title}
                    </span>
                    <span className="text-muted mt-1 block text-[0.78rem]">
                      {module.lessons.length} lessons · {formatMinutes(moduleDuration)}
                    </span>
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
                    <ul className="border-line/50 border-t">
                      {module.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="border-line/40 hover:bg-cream-warm/60 flex items-center gap-4 border-b px-6 py-3.5 last:border-b-0 transition-colors"
                        >
                          <PlayCircle
                            className="text-forest/50 size-5 shrink-0"
                            strokeWidth={1.4}
                            aria-hidden="true"
                          />
                          <span className="text-ink min-w-0 flex-1 text-[0.88rem]">
                            {lesson.title}
                          </span>
                          <span className="flex shrink-0 items-center gap-3">
                            <span className="text-muted inline-flex items-center gap-1 text-[0.78rem]">
                              <Clock className="size-3" aria-hidden="true" />
                              {lesson.duration}m
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
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
