import Image from "next/image";
import Link from "next/link";
import { BarChart3, PlayCircle } from "lucide-react";

import { StarRating } from "@/components/ui/StarRating";
import { formatPrice } from "@/lib/format";
import type { Course } from "@/types/course";

export function CourseCard({ course }: { course: Course }) {
  const price = course.discountPrice ?? course.price;

  return (
    <article className="group border-line/80 bg-cream hover:border-forest/25 h-full overflow-hidden rounded-2xl border transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease-editorial)] hover:-translate-y-1 hover:shadow-[0_20px_44px_-28px_rgba(41,75,50,0.45)]">
      <Link href={`/courses/${course.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 45vw, 24vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.06]"
          />
          {course.badge && (
            <span className="bg-cream/95 text-ink absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide backdrop-blur-sm sm:top-3 sm:right-3 sm:px-3 sm:py-1 sm:text-[0.7rem]">
              {course.badge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3.5 sm:p-5">
          <h3 className="text-ink group-hover:text-forest text-[0.88rem] font-semibold transition-colors sm:text-[1.02rem]">
            {course.title}
          </h3>
          <p className="text-muted mt-1.5 line-clamp-2 text-[0.78rem] leading-[1.55] sm:mt-2 sm:text-[0.85rem]">
            {course.shortDescription}
          </p>

          <div className="text-muted border-line/70 mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t pt-3 text-[0.72rem] sm:mt-5 sm:gap-x-5 sm:pt-4 sm:text-[0.78rem]">
            <span className="inline-flex items-center gap-1.5">
              <PlayCircle className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
              {course.lessons} Lessons
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
              {course.level}
            </span>
          </div>

          <div className="mt-3 flex flex-col items-start gap-1.5 sm:mt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <p className="text-ink font-display text-[1.05rem] font-semibold sm:text-[1.25rem]">
              {formatPrice(price)}
              {course.discountPrice && (
                <span className="text-muted ml-2 font-sans text-[0.78rem] font-normal line-through">
                  {formatPrice(course.price)}
                </span>
              )}
            </p>
            <span className="text-muted inline-flex items-center gap-1.5 text-[0.72rem] sm:text-[0.78rem]">
              <StarRating rating={course.rating} className="gap-0" />
              <span className="text-ink font-medium">{course.rating}</span>
              <span>({course.reviewCount})</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
