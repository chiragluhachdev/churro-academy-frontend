import { CircleCheck } from "lucide-react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

export function WhatYouWillLearn({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      <Reveal>
        <div className="border-line/70 bg-cream-warm rounded-2xl border p-7 sm:p-9">
          <Eyebrow>What You&rsquo;ll Learn</Eyebrow>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CircleCheck
                  className="text-forest mt-0.5 size-[1.15rem] shrink-0"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span className="text-ink text-[0.9rem] leading-[1.6]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
