import { BookOpenCheck, ChefHat, Infinity as InfinityIcon, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

const pillars: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ChefHat,
    title: "Expert Guidance",
    body: "Learn from professional chefs with real-world experience.",
  },
  {
    icon: BookOpenCheck,
    title: "Step-by-Step Learning",
    body: "Detailed lessons designed for all skill levels.",
  },
  {
    icon: InfinityIcon,
    title: "Lifetime Access",
    body: "Learn at your own pace with lifetime course access.",
  },
  {
    icon: Users,
    title: "Baker Community",
    body: "Connect, share and grow with fellow baking enthusiasts.",
  },
];

export function WhatIs() {
  return (
    <section id="intro" className="bg-cream-warm scroll-mt-24">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-12 sm:gap-14 sm:py-20 sm:px-8 lg:grid-cols-[34fr_66fr] lg:gap-16 lg:pt-32 lg:pb-24">
        <Reveal>
          <Eyebrow>What is Churro Academy?</Eyebrow>
          <h2 className="font-display text-ink mt-3 text-[1.7rem] leading-[1.15] font-medium tracking-[-0.01em] text-balance sm:mt-5 sm:text-[2.6rem]">
            More Than Just Baking Classes.
          </h2>
          <p className="text-muted mt-3 max-w-md text-[0.85rem] leading-[1.7] sm:mt-6 sm:text-base sm:leading-[1.8]">
            We&rsquo;re a community of passionate bakers, lifelong learners and dessert
            lovers. Whether you&rsquo;re a beginner or a pro, we&rsquo;re here to help you
            bake with confidence and creativity.
          </p>
        </Reveal>

        <ul className="grid grid-cols-2 gap-x-5 gap-y-7 sm:gap-y-10 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, body }, index) => (
            <Reveal
              as="li"
              key={title}
              delay={index * 0.08}
              className="border-line/70 px-0 sm:px-7 lg:[&:not(:first-child)]:border-l"
            >
              <span className="text-forest flex size-9 items-center justify-center sm:size-12">
                <Icon className="size-[1.35rem] sm:size-7" strokeWidth={1.25} aria-hidden="true" />
              </span>
              <h3 className="text-ink mt-3 text-[0.85rem] font-semibold sm:mt-5 sm:text-[0.95rem]">{title}</h3>
              <p className="text-muted mt-1.5 text-[0.76rem] leading-[1.6] sm:mt-2.5 sm:text-[0.87rem] sm:leading-[1.65]">{body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
