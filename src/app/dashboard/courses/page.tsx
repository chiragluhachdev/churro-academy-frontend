import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate, getEnrolledCourses } from "@/data/student";

export const metadata: Metadata = { title: "My Courses" };

export default function MyCoursesPage() {
  const enrolled = getEnrolledCourses();
  const inProgress = enrolled.filter((entry) => !entry.isComplete);
  const completed = enrolled.filter((entry) => entry.isComplete);

  return (
    <div className="space-y-12">
      <Reveal>
        <DashboardHeader
          eyebrow="My Courses"
          title="Everything you own."
          lede={`${enrolled.length} courses, yours for life. ${completed.length} finished so far.`}
        />
      </Reveal>

      {[
        { heading: "In progress", items: inProgress },
        { heading: "Completed", items: completed },
      ].map(
        ({ heading, items }) =>
          items.length > 0 && (
            <section key={heading}>
              <Reveal>
                <h2 className="text-ink text-[0.8rem] font-semibold tracking-[0.18em] uppercase">
                  {heading}
                  <span className="text-muted ml-2 font-normal">({items.length})</span>
                </h2>
              </Reveal>

              <ul className="mt-6 space-y-5">
                {items.map((entry, index) => (
                  <Reveal as="li" key={entry.courseSlug} delay={(index % 4) * 0.05}>
                    <Link
                      href={`/courses/${entry.course.slug}`}
                      className="group border-line/80 hover:border-forest/25 flex flex-col gap-5 rounded-2xl border p-5 transition-colors duration-300 sm:flex-row sm:items-center"
                    >
                      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl sm:aspect-square sm:w-28">
                        <Image
                          src={entry.course.thumbnail}
                          alt={entry.course.title}
                          fill
                          sizes="(max-width: 640px) 90vw, 112px"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h3 className="text-ink group-hover:text-forest text-[1.02rem] font-semibold transition-colors">
                            {entry.course.title}
                          </h3>
                          {entry.isComplete && (
                            <span className="text-forest bg-sand inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium">
                              <CheckCircle2 className="size-3" aria-hidden="true" />
                              Complete
                            </span>
                          )}
                        </div>

                        <p className="text-muted mt-1.5 text-[0.82rem]">
                          {entry.isComplete
                            ? `Finished ${formatDate(entry.completedOn ?? entry.lastOpened)}`
                            : `Next — ${entry.nextLesson}`}
                        </p>

                        <div className="mt-4 flex items-center gap-4">
                          <ProgressBar
                            value={entry.progress}
                            className="max-w-xs flex-1"
                            label={`${entry.course.title} progress`}
                          />
                          <span className="text-muted shrink-0 text-[0.78rem]">
                            {entry.completedLessons}/{entry.course.lessons} lessons
                          </span>
                        </div>
                      </div>

                      <div className="text-muted flex shrink-0 items-center gap-4 text-[0.78rem] sm:flex-col sm:items-end sm:gap-2">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                          {entry.course.duration}
                        </span>
                        <span className="text-forest inline-flex items-center gap-1.5 font-medium">
                          {entry.isComplete ? "Review" : "Resume"}
                          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            </section>
          ),
      )}
    </div>
  );
}
