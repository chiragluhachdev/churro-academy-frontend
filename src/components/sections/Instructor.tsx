import Image from "next/image";

import Link from "next/link";
import { Award, BookOpen, Heart, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  InstagramIcon,
  PinterestIcon,
  YoutubeIcon,
} from "@/components/brand/SocialIcons";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ChefPortrait } from "@/components/chef/ChefPortrait";
import { fetchChef } from "@/lib/api";

const statIcons: Record<string, LucideIcon> = {
  experience: Award,
  recipes: BookOpen,
  students: Users,
  passion: Heart,
};

const socialIcons = {
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  pinterest: PinterestIcon,
} as const;

export async function Instructor() {
  const instructor = await fetchChef();

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-20 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[32fr_42fr_26fr] lg:gap-12">
          <Reveal className="relative mx-auto w-full max-w-[22rem]">
            {/* Handwritten aside, echoing the hero script. */}
            <div className="text-forest absolute -top-2 -left-2 z-10 hidden sm:block lg:-left-6">
              <p className="font-script text-2xl leading-tight">
                Chef &amp;
                <br />
                Founder
              </p>
              <svg
                viewBox="0 0 60 40"
                aria-hidden="true"
                className="mt-1 ml-6 h-8 w-14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <path d="M2 4c14 6 26 18 34 30" />
                <path d="M28 34c4 .6 7 .6 9 .2M36 24c1.4 4 .8 8-.6 10.4" />
              </svg>
            </div>

            <div className="relative aspect-square">
              {/* Offset disc, so the portrait reads as a composition not a sticker. */}
              <span className="bg-forest absolute inset-0 translate-x-4 translate-y-5 rounded-full" />
              <ChefPortrait
                url={instructor.portrait}
                alt={`${instructor.name}, ${instructor.title}`}
                sizes="(max-width: 1024px) 22rem, 24vw"
                className="relative size-full rounded-full object-cover"
              />
              <span className="border-cream absolute bottom-3 left-2 size-16 overflow-hidden rounded-full border-4">
                <Image src="/logo.png" alt="" width={512} height={512} className="size-full object-cover" />
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Eyebrow>Meet Your Instructor</Eyebrow>
            <h2 className="font-display text-ink mt-4 text-[2.1rem] leading-[1.15] font-medium tracking-[-0.01em] sm:text-[2.6rem]">
              {instructor.name}
            </h2>
            <p className="text-muted mt-6 max-w-lg leading-[1.8]">{instructor.bio}</p>

            <p className="font-script text-forest mt-8 text-3xl">Valeria</p>

            <ul className="mt-7 flex items-center gap-3">
              {instructor.socials.map((social) => {
                const Icon = socialIcons[social.icon];
                return (
                  <li key={social.label}>
                    <Link
                      href={social.href}
                      aria-label={`${instructor.name} on ${social.label}`}
                      className="bg-forest text-cream hover:bg-forest-deep flex size-10 items-center justify-center rounded-full transition-colors duration-300"
                    >
                      <Icon className="size-[1.05rem]" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <ul className="bg-cream-warm border-line/70 divide-line/70 divide-y rounded-2xl border px-6">
              {instructor.stats.map((stat) => {
                const Icon = statIcons[stat.icon];
                return (
                  <li key={stat.label} className="flex items-center gap-4 py-5">
                    <span className="text-forest flex size-9 shrink-0 items-center justify-center">
                      <Icon className="size-5" strokeWidth={1.4} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="text-ink block text-[1.05rem] font-semibold">
                        {stat.value}
                      </span>
                      <span className="text-muted mt-0.5 block text-[0.8rem]">
                        {stat.label}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
