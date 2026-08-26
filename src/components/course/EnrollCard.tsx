import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  Clock,
  Infinity as InfinityIcon,
  PlayCircle,
} from "lucide-react";

import { EnrollButton } from "@/components/course/EnrollButton";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/format";
import type { Course } from "@/types/course";

interface EnrollCardProps {
  course: Course;
  owned: boolean;
  signedIn: boolean;
  dashboardHref: string;
}

export function EnrollCard({ course, owned, signedIn, dashboardHref }: EnrollCardProps) {
  const price = course.discountPrice ?? course.price;

  return (
    <Reveal>
      <div className="border-line/70 bg-cream sticky top-28 overflow-hidden rounded-2xl border shadow-[0_12px_40px_-20px_rgba(41,75,50,0.2)]">
        {/* Price header */}
        <div className="bg-forest-deep text-cream px-7 py-6">
          <p className="font-display text-[2.2rem] font-semibold leading-none">
            {formatPrice(price)}
            {course.discountPrice && (
              <span className="text-cream/55 ml-2.5 font-sans text-[0.95rem] font-normal line-through">
                {formatPrice(course.price)}
              </span>
            )}
          </p>
          <p className="text-cream/65 mt-2 text-[0.82rem]">
            One-time payment · Lifetime access
          </p>
        </div>

        {/* CTA */}
        <div className="px-7 pt-6 pb-5">
          <EnrollButton
            courseId={course.id}
            owned={owned}
            signedIn={signedIn}
            dashboardHref={dashboardHref}
          />
        </div>

        {/* Course meta */}
        <ul className="border-line/70 divide-line/70 mx-7 divide-y border-t text-[0.85rem]">
          <li className="flex items-center gap-3 py-3.5">
            <PlayCircle className="text-forest size-[1.1rem]" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-muted flex-1">Lessons</span>
            <span className="text-ink font-medium">{course.lessons}</span>
          </li>
          <li className="flex items-center gap-3 py-3.5">
            <Clock className="text-forest size-[1.1rem]" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-muted flex-1">Duration</span>
            <span className="text-ink font-medium">{course.duration}</span>
          </li>
          <li className="flex items-center gap-3 py-3.5">
            <BarChart3 className="text-forest size-[1.1rem]" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-muted flex-1">Level</span>
            <span className="text-ink font-medium">{course.level}</span>
          </li>
          <li className="flex items-center gap-3 py-3.5">
            <InfinityIcon className="text-forest size-[1.1rem]" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-muted flex-1">Access</span>
            <span className="text-ink font-medium">Lifetime</span>
          </li>
          <li className="flex items-center gap-3 py-3.5">
            <Award className="text-forest size-[1.1rem]" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-muted flex-1">Certificate</span>
            <span className="text-ink font-medium">Yes</span>
          </li>
        </ul>

        {/* Included items */}
        {course.includedItems.length > 0 && (
          <div className="border-line/70 mx-7 mt-1 border-t pt-5 pb-7">
            <p className="text-ink text-[0.82rem] font-semibold uppercase tracking-wide">
              What&rsquo;s Included
            </p>
            <ul className="mt-3.5 space-y-2.5">
              {course.includedItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check
                    className="text-forest mt-0.5 size-4 shrink-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span className="text-muted text-[0.82rem] leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <div className="border-line/70 mx-7 border-t pt-5 pb-7">
            <p className="text-ink text-[0.82rem] font-semibold uppercase tracking-wide">
              Requirements
            </p>
            <ul className="mt-3.5 space-y-2.5">
              {course.requirements.map((req) => (
                <li key={req} className="flex items-start gap-2.5">
                  <BookOpen
                    className="text-muted mt-0.5 size-4 shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="text-muted text-[0.82rem] leading-snug">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Reveal>
  );
}
