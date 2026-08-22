"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Award, ChefHat, MonitorPlay, Play } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useState } from "react";

import heroPanel from "@/assets/hero-panel.webp";
import { Sparkle4 } from "@/components/brand/Sparkle";
import { ButtonLink } from "@/components/ui/Button";
import { IntroModal } from "@/components/ui/IntroModal";

const highlights: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: ChefHat, title: "Expert-Led", body: "Learn from industry experts" },
  { icon: MonitorPlay, title: "Step-by-Step", body: "Detailed lessons you can follow" },
  { icon: Award, title: "Certificate", body: "Earn a certificate with every course" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [introOpen, setIntroOpen] = useState(false);

  const openIntro = useCallback(() => setIntroOpen(true), []);
  const closeIntro = useCallback(() => setIntroOpen(false), []);

  // One shared entrance: children rise in sequence rather than all at once.
  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative z-10 pt-24 lg:pt-20">
      {/* The panel is a finished design asset — the arch mask, green outline,
          sparkle and "Bake. Create. Inspire." script are baked into it. Its
          background is the exact page cream, so it blends with no seam. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 right-0 -bottom-8 hidden w-[72%] lg:block"
        {...(reduceMotion
          ? {}
          : {
              initial: { opacity: 0, scale: 1.04 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
            })}
      >
        <Image
          src={heroPanel}
          alt=""
          fill
          priority
          sizes="72vw"
          placeholder="blur"
          className="object-contain object-[right_bottom]"
        />
      </motion.div>


      {/* Below lg the art sits behind the copy instead of beside it. The
          scrims keep contrast where the text actually is: heavy at the top and
          bottom, and fading from the left, so the chef stays visible at right. */}
      <div aria-hidden="true" className="absolute inset-0 lg:hidden">
        <Image
          src={heroPanel}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-[70%_22%] opacity-[0.38]"
        />
        <div className="from-cream/85 via-cream/35 to-cream absolute inset-0 bg-gradient-to-b" />
        <div className="from-cream/65 absolute inset-0 bg-gradient-to-r to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="lg:grid lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[44fr_56fr] lg:items-center">
          <div className="max-w-xl py-8 sm:py-10 lg:pt-12 lg:pb-8">
            <motion.div
              {...rise(0.05)}
              className="border-line/80 bg-pill/85 text-ink inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.62rem] font-medium tracking-[0.18em] uppercase backdrop-blur-[2px] sm:gap-2.5 sm:px-4 sm:py-2 sm:text-[0.72rem] sm:tracking-[0.2em]"
            >
              <Sparkle4 className="text-forest size-2.5 sm:size-3" />
              Learn <span className="text-muted/60">•</span> Bake{" "}
              <span className="text-muted/60">•</span> Inspire
            </motion.div>

            <motion.h1
              {...rise(0.15)}
              className="font-display text-ink mt-5 text-[2.15rem] leading-[1.08] font-medium tracking-[-0.015em] text-balance sm:mt-6 sm:text-[2.9rem] md:text-[3.4rem] lg:text-[4.1rem] lg:leading-[1.06]"
            >
              Master the Art of Baking,{" "}
              <em className="text-forest italic">Your Way.</em>
            </motion.h1>

            <motion.p
              {...rise(0.25)}
              className="text-ink/70 mt-4 max-w-md text-[0.92rem] leading-[1.7] sm:mt-5 sm:text-[0.95rem] lg:text-[1.05rem] lg:leading-[1.75]"
            >
              At Churro Academy, we turn your passion for desserts into real skills.
              Learn from expert chefs, at your pace, and bake creations that inspire.
            </motion.p>



            <motion.div {...rise(0.35)} className="mt-7 flex flex-wrap items-center gap-5 sm:mt-8 sm:gap-6">
              <ButtonLink href="/courses">
                Explore Courses
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </ButtonLink>

              <button
                type="button"
                onClick={openIntro}
                className="group text-ink inline-flex items-center gap-2.5 transition-opacity hover:opacity-80 sm:gap-3.5"
              >
                <span className="border-forest/25 text-forest group-hover:bg-forest group-hover:border-forest group-hover:text-cream flex size-9 items-center justify-center rounded-full border transition-colors duration-300 sm:size-12">
                  <Play className="size-3 translate-x-px fill-current sm:size-4" aria-hidden="true" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.78rem] font-medium sm:text-[0.95rem]">Watch Intro</span>
                  <span className="text-muted block text-[0.68rem] sm:text-sm">1 min</span>
                </span>
              </button>
            </motion.div>

            <motion.ul
              {...rise(0.45)}
              className="border-line/70 mt-5 grid grid-cols-3 gap-3 border-t pt-4 sm:mt-10 sm:gap-0 sm:pt-7"
            >
              {highlights.map(({ icon: Icon, title, body }, index) => (
                <li
                  key={title}
                  className={
                    index > 0
                      ? "border-line/70 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3.5 sm:border-l sm:pl-5"
                      : "flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3.5 sm:pr-5"
                  }
                >
                  <span className="bg-sand text-forest flex size-9 shrink-0 items-center justify-center rounded-full sm:size-11">
                    <Icon className="size-4 sm:size-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="text-ink block text-[0.78rem] font-semibold sm:text-[0.9rem]">
                      {title}
                    </span>
                    <span className="text-muted mt-1 block text-[0.7rem] leading-snug sm:text-[0.82rem]">
                      {body}
                    </span>
                  </span>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </div>


      {/* Intro video modal */}
      <IntroModal open={introOpen} onClose={closeIntro} />
    </section>
  );
}
