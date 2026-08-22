import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, ChefHat, Infinity as InfinityIcon, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { founder } from "@/data/chefs";

export const metadata: Metadata = {
  title: "About",
  description:
    "Churro Academy teaches the technique behind good baking — plainly, step by step, with lifetime access to every course.",
};

const values: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ChefHat,
    title: "Technique over recipes",
    body: "A recipe gets you one bake. Understanding why it works gets you every bake after that.",
  },
  {
    icon: BookOpenCheck,
    title: "Nothing skipped",
    body: "We film the difficult parts at full speed, mistakes included. No jump cuts past the bit you needed.",
  },
  {
    icon: InfinityIcon,
    title: "Yours for life",
    body: "Buy a course once and keep it. No subscription, no expiry, no re-purchasing to rewatch a lesson.",
  },
  {
    icon: Users,
    title: "Answered by a person",
    body: "Questions in the community get answered by the chef who taught the lesson, not a support macro.",
  },
];

const milestones = [
  { year: "2021", title: "A kitchen and a camera", body: "Simone films the first churro lessons for a handful of students." },
  { year: "2023", title: "The catalogue grows", body: "Cakes, cheesecakes and French pastry join the platform." },
  { year: "2024", title: "Breads arrive", body: "Sourdough and laminated doughs complete the core curriculum." },
  { year: "2026", title: "Ten courses, one promise", body: "Every course still written, tested and taught by Simone." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="More than just baking classes."
        lede="Churro Academy exists because most baking content tells you what to do and never why it works. We teach the why, so the next bake is yours to control."
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            <Reveal className="relative">
              <span className="bg-forest absolute inset-0 -translate-x-4 translate-y-5 rounded-[2rem]" />
              <Image
                src={founder.portrait}
                alt="Chef Simone in the Churro Academy kitchen"
                placeholder="blur"
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="relative aspect-[4/3] w-full rounded-[2rem] object-cover"
              />
            </Reveal>

            <Reveal delay={0.1}>
              <Eyebrow>Our Story</Eyebrow>
              <h2 className="font-display text-ink mt-5 text-[2rem] leading-[1.15] font-medium tracking-[-0.01em] sm:text-[2.5rem]">
                Built by one chef who kept getting the same question.
              </h2>
              <div className="mt-6 space-y-5">
                <p className="text-muted leading-[1.85]">
                  &ldquo;Why did mine turn out different?&rdquo; It came up so often that the
                  answer became the whole curriculum. Not another collection of recipes —
                  an explanation of the variables underneath them.
                </p>
                <p className="text-muted leading-[1.85]">
                  Today the academy runs ten courses covering cakes, fried sweets, French
                  pastry and breads. Every one is developed and filmed in the same kitchen,
                  tested until it works reliably outside a professional setup.
                </p>
              </div>
              <Link
                href="/chef"
                className="group text-forest mt-8 inline-flex items-center gap-2 text-[0.9rem] font-medium"
              >
                Meet Chef Simone
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-cream-warm">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <Eyebrow>What We Believe</Eyebrow>
            <h2 className="font-display text-ink mt-5 max-w-2xl text-[2rem] leading-[1.15] font-medium tracking-[-0.01em] text-balance sm:text-[2.5rem]">
              Four things we refuse to compromise on.
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, body }, index) => (
              <Reveal as="li" key={title} delay={(index % 4) * 0.08}>
                <span className="text-forest flex size-12 items-center justify-center">
                  <Icon className="size-7" strokeWidth={1.25} aria-hidden="true" />
                </span>
                <h3 className="text-ink mt-5 text-[1rem] font-semibold">{title}</h3>
                <p className="text-muted mt-2.5 text-[0.88rem] leading-[1.7]">{body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <Eyebrow>How We Got Here</Eyebrow>
          </Reveal>
          <ol className="border-line/70 mt-10 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((milestone, index) => (
              <Reveal
                as="li"
                key={milestone.year}
                delay={(index % 4) * 0.07}
                className="bg-cream-warm px-6 py-8"
              >
                <p className="font-display text-forest text-[1.6rem] font-medium">
                  {milestone.year}
                </p>
                <h3 className="text-ink mt-3 text-[0.95rem] font-semibold">
                  {milestone.title}
                </h3>
                <p className="text-muted mt-2 text-[0.85rem] leading-[1.65]">
                  {milestone.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

    </>
  );
}
