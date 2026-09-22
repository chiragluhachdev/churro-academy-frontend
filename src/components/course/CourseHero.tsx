import Image from "next/image";
import Link from "next/link";
import { BarChart3, ChevronRight, Clock, PlayCircle } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { StarRating } from "@/components/ui/StarRating";
import { formatCount } from "@/lib/format";
import type { Course } from "@/types/course";

export function CourseHero({ course }: { course: Course }) {
  return (
    <section>
      <Reveal>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="text-muted flex items-center gap-1.5 text-[0.82rem]">
            <li>
              <Link href="/" className="hover:text-forest transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </li>
            <li>
              <Link href="/courses" className="hover:text-forest transition-colors">
                Courses
              </Link>
            </li>
            <li>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </li>
            <li className="text-ink truncate font-medium">{course.title}</li>
          </ol>
        </nav>

        {/* Hero image */}
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl lg:rounded-3xl">
          <Image
            src={course.heroImage}
            alt={course.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
          {course.badge && (
            <span className="bg-cream/95 text-ink absolute top-4 left-4 rounded-full px-4 py-1.5 text-[0.75rem] font-semibold tracking-wide backdrop-blur-sm">
              {course.badge}
            </span>
          )}
        </div>

        {/* Category + Title */}
        <div className="mt-7">
          <span className="text-forest bg-forest/8 inline-block rounded-full px-3.5 py-1 text-[0.72rem] font-semibold tracking-wide uppercase">
            {course.category}
          </span>
          <h1 className="font-display text-ink mt-4 text-[2.2rem] leading-[1.1] font-medium tracking-[-0.015em] text-balance sm:text-[2.8rem]">
            {course.title}
          </h1>
          <p className="text-muted mt-4 max-w-2xl text-[1.02rem] leading-[1.75]">
            {course.description}
          </p>
        </div>

        {/* Meta row */}
        <div className="border-line/70 mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-5 text-[0.85rem]">
          <span className="text-muted inline-flex items-center gap-1.5">
            <StarRating rating={course.rating} />
            <span className="text-ink ml-1 font-semibold">{course.rating}</span>
            <span>({formatCount(course.reviewCount)} reviews)</span>
          </span>
          {course.lessons > 0 && (
            <span className="text-muted inline-flex items-center gap-1.5">
              <PlayCircle className="size-4" strokeWidth={1.5} aria-hidden="true" />
              {course.lessons} lessons
            </span>
          )}
          <span className="text-muted inline-flex items-center gap-1.5">
            <Clock className="size-4" strokeWidth={1.5} aria-hidden="true" />
            {course.duration}
          </span>
          <span className="text-muted inline-flex items-center gap-1.5">
            <BarChart3 className="size-4" strokeWidth={1.5} aria-hidden="true" />
            {course.level}
          </span>
        </div>

        {/* Instructor mini */}
        <div className="mt-5 flex items-center gap-3">
          <Image
            src={course.instructor.avatar}
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
          <span className="text-[0.88rem]">
            <span className="text-muted">Taught by </span>
            <span className="text-ink font-semibold">{course.instructor.name}</span>
          </span>
        </div>
      </Reveal>
    </section>
  );
}
