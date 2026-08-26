import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { CourseCard } from "@/components/course/CourseCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { fetchFeaturedCourses } from "@/lib/api";

export async function FeaturedCourses() {
  const featured = await fetchFeaturedCourses();

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-20 lg:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-3 sm:gap-6">
          <div>
            <Eyebrow>Featured Courses</Eyebrow>
            <h2 className="font-display text-ink mt-3 text-[1.7rem] leading-[1.15] font-medium tracking-[-0.01em] sm:mt-4 sm:text-[2.6rem]">
              Handpicked for You
            </h2>
          </div>
          <Link
            href="/courses"
            className="group text-forest inline-flex items-center gap-2 text-[0.82rem] font-medium sm:text-[0.9rem]"
          >
            View All Courses
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {/* Phones get a 2x2 grid — all four visible without swiping. From sm up
            the rail returns, where there is room to scroll it. */}
        <Reveal delay={0.1} className="mt-6 sm:hidden">
          <ul className="grid grid-cols-2 gap-4">
            {featured.slice(0, 4).map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="mt-11 hidden sm:block">
          <Rail label="Featured courses">
            {featured.map((course) => (
              <div
                key={course.id}
                className="w-[46%] shrink-0 snap-start lg:w-[calc((100%-4.5rem)/4)]"
              >
                <CourseCard course={course} />
              </div>
            ))}
          </Rail>
        </Reveal>
      </div>
    </section>
  );
}
