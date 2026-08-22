import { ChefHat, Heart, Star, Tablet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";

const benefits: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ChefHat,
    title: "Practical, Not Boring",
    body: "Real techniques you can use right away.",
  },
  {
    icon: Star,
    title: "High-Quality Content",
    body: "Crisp videos, downloadable notes & recipes.",
  },
  {
    icon: Tablet,
    title: "Accessible Anywhere",
    body: "Learn on any device, anytime you want.",
  },
  {
    icon: Heart,
    title: "Results You'll Love",
    body: "Bake better, gain confidence & impress everyone.",
  },
];

/** Faint botanical watermark, mirrored into both top corners. */
function LeafWatermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 200"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <path d="M18 190C60 150 96 104 118 46" />
      {Array.from({ length: 7 }, (_, i) => {
        const t = i / 6;
        const x = 18 + t * 100;
        const y = 190 - t * 144;
        return (
          <g key={i}>
            <path
              d={`M${x} ${y}c-22-6-38 4-44 22 20 6 38-4 44-22Z`}
              opacity={0.9 - t * 0.25}
            />
            <path
              d={`M${x} ${y}c14-18 34-22 52-12-12 18-34 24-52 12Z`}
              opacity={0.9 - t * 0.25}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function WhyLearn() {
  return (
    <section className="bg-forest-deep text-cream relative overflow-hidden">
      <LeafWatermark className="text-cream/[0.07] pointer-events-none absolute -top-6 -left-10 h-72 w-auto" />
      <LeafWatermark className="text-cream/[0.07] pointer-events-none absolute -right-10 -bottom-6 h-72 w-auto -scale-x-100 -scale-y-100" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-20 lg:py-24">
        <Reveal className="text-center">
          <p className="text-cream/60 text-[0.7rem] font-medium tracking-[0.22em] uppercase">
            Why Learn With Us?
          </p>
          <h2 className="font-display mt-4 text-[2.1rem] leading-[1.15] font-medium tracking-[-0.01em] sm:text-[2.6rem]">
            Learning That Feels Different
          </h2>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-0">
          {benefits.map(({ icon: Icon, title, body }, index) => (
            <Reveal
              as="li"
              key={title}
              delay={index * 0.08}
              className={
                index > 0
                  ? "border-cream/15 flex flex-col items-center px-1 text-center sm:px-4 lg:border-l lg:px-6"
                  : "flex flex-col items-center px-1 text-center sm:px-4 lg:px-6"
              }
            >
              <span className="border-cream/20 bg-cream/[0.06] flex size-14 items-center justify-center rounded-full border">
                <Icon className="size-6" strokeWidth={1.4} aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-[0.98rem] font-semibold">{title}</h3>
              <p className="text-cream/70 mt-3 max-w-[15rem] text-[0.87rem] leading-[1.65]">
                {body}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
