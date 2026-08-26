import type { Metadata } from "next";
import Image from "next/image";

import chefSimonePortrait from "@/assets/chef-simone.jpg";
import Link from "next/link";
import { ArrowRight, Award, BookOpen, Heart, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  InstagramIcon,
  PinterestIcon,
  YoutubeIcon,
} from "@/components/brand/SocialIcons";
import { CourseCard } from "@/components/course/CourseCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { founder, founderStats } from "@/data/chefs";
import { fetchFeaturedCourses } from "@/lib/api";

export const metadata: Metadata = {
  title: "Meet Chef Simone Kathuria",
  description:
    "Chef Simone founded Churro Academy and writes, tests and teaches every course on the platform.",
};

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

export default async function ChefPage() {
  const courses = await fetchFeaturedCourses();

  return (
    <>
      <PageHeader
        eyebrow="Meet the Chef"
        title="Chef Simone Kathuria"
        lede={founder.tagline}
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid items-start gap-14 lg:grid-cols-[38fr_62fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-28">
              <div className="relative">
                <span className="bg-forest absolute inset-0 translate-x-4 translate-y-5 rounded-[2rem]" />
                <Image
                  src={chefSimonePortrait}
                  alt={`${founder.name}, ${founder.title}`}
                  placeholder="blur"
                  sizes="(max-width: 1024px) 90vw, 34vw"
                  className="relative aspect-square w-full rounded-[2rem] object-cover"
                />
                <span className="border-cream absolute -bottom-5 left-6 size-20 overflow-hidden rounded-2xl border-4">
                  <Image
                    src="/logo.png"
                    alt=""
                    width={512}
                    height={512}
                    className="size-full object-cover"
                  />
                </span>
              </div>

              <p className="font-script text-forest mt-12 text-3xl">Simone</p>

              <ul className="mt-6 flex items-center gap-3">
                {founder.socials.map((social) => {
                  const Icon = socialIcons[social.icon];
                  return (
                    <li key={social.label}>
                      <Link
                        href={social.href}
                        target={social.href.startsWith("http") ? "_blank" : undefined}
                        rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                        aria-label={`${founder.name} on ${social.label}`}
                        className="bg-forest text-cream hover:bg-forest-deep flex size-10 items-center justify-center rounded-full transition-colors duration-300"
                      >
                        <Icon className="size-[1.05rem]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            <div>
              <Reveal>
                <p className="text-forest text-[0.85rem] font-medium tracking-wide">
                  {founder.title}
                </p>
                <div className="mt-6 space-y-5">
                  {founder.longBio.map((paragraph) => (
                    <p key={paragraph} className="text-muted leading-[1.85]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.1} className="mt-12">
                <Eyebrow>Specialities</Eyebrow>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {founder.specialities.map((speciality) => (
                    <li
                      key={speciality}
                      className="bg-sand text-ink rounded-full px-4 py-2 text-[0.82rem] font-medium"
                    >
                      {speciality}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.15} className="mt-12">
                <ul className="border-line/70 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
                  {founderStats.map((stat) => {
                    const Icon = statIcons[stat.icon];
                    return (
                      <li
                        key={stat.label}
                        className="bg-cream-warm flex items-center gap-4 px-6 py-6"
                      >
                        <span className="text-forest flex size-9 shrink-0 items-center justify-center">
                          <Icon className="size-5" strokeWidth={1.4} aria-hidden="true" />
                        </span>
                        <span>
                          <span className="text-ink block text-[1.15rem] font-semibold">
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
        </div>
      </section>

      <section className="bg-cream-warm">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Taught by Simone</Eyebrow>
              <h2 className="font-display text-ink mt-4 text-[2rem] leading-[1.15] font-medium sm:text-[2.4rem]">
                Start with one of these
              </h2>
            </div>
            <Link
              href="/courses"
              className="group text-forest inline-flex items-center gap-2 text-[0.9rem] font-medium"
            >
              View All Courses
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course, index) => (
              <Reveal as="li" key={course.id} delay={(index % 4) * 0.06}>
                <CourseCard course={course} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

    </>
  );
}
