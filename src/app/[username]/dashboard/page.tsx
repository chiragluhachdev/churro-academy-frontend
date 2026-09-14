import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, BookOpen, CheckCircle2, Flame, PlayCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/format";
import { fetchCourses, fetchMyEnrollments, studentStats } from "@/lib/api";
import { requireSession } from "@/lib/session";

export default async function DashboardOverviewPage() {
  const { user, accessToken } = await requireSession();
  const [enrolled, allCourses] = await Promise.all([
    fetchMyEnrollments(accessToken),
    fetchCourses(),
  ]);
  const stats = studentStats(enrolled);

  const inProgress = enrolled.filter((e) => !e.isComplete);
  const continueCourse = inProgress[0];
  const ownedSlugs = new Set(enrolled.map((e) => e.course.slug));
  const recommended = allCourses.filter((c) => !ownedSlugs.has(c.slug)).slice(0, 3);
  const firstName = user.name.split(" ")[0];

  const tiles: { icon: LucideIcon; value: string; label: string }[] = [
    { icon: BookOpen, value: String(stats.coursesEnrolled), label: "Courses enrolled" },
    { icon: PlayCircle, value: `${stats.lessonsDone}/${stats.totalLessons}`, label: "Lessons completed" },
    { icon: CheckCircle2, value: String(stats.coursesCompleted), label: "Courses finished" },
    { icon: Award, value: String(stats.certificates), label: "Certificates earned" },
  ];

  return (
    <div className="space-y-14">
      <Reveal>
        <DashboardHeader
          eyebrow={`Welcome back, ${firstName}`}
          title="Let's get baking."
          lede={
            stats.coursesEnrolled === 0
              ? "You haven't enrolled in anything yet — pick a course and it'll show up here."
              : `You're ${stats.overallProgress}% through everything you've enrolled in. Nice pace.`
          }
        />
      </Reveal>

      <Reveal delay={0.05}>
        <ul className="border-line/70 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border lg:grid-cols-4">
          {tiles.map(({ icon: Icon, value, label }) => (
            <li key={label} className="bg-cream-warm px-4 py-3.5 sm:px-5 sm:py-4.5">
              <span className="text-forest flex size-7 items-center justify-center">
                <Icon className="size-[1.05rem]" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="font-display text-ink mt-2.5 text-[1.35rem] leading-none font-medium sm:text-[1.55rem]">
                {value}
              </p>
              <p className="text-muted mt-1.5 text-[0.74rem] sm:text-[0.78rem]">{label}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      {continueCourse ? (
        <Reveal delay={0.1}>
          <Eyebrow>Pick up where you left off</Eyebrow>
          <div className="border-line/80 bg-forest-deep text-cream mt-5 grid overflow-hidden rounded-2xl border sm:grid-cols-[38fr_62fr]">
            <div className="relative aspect-[16/10] sm:aspect-auto">
              <Image
                src={continueCourse.course.thumbnail}
                alt={continueCourse.course.title}
                fill
                sizes="(max-width: 640px) 100vw, 38vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-9">
              <p className="text-cream/60 text-[0.75rem] tracking-[0.18em] uppercase">
                {continueCourse.course.category}
              </p>
              <h2 className="font-display mt-3 text-[1.6rem] leading-[1.2] font-medium text-balance sm:text-[1.9rem]">
                {continueCourse.course.title}
              </h2>
              <p className="text-cream/75 mt-3 text-[0.9rem]">
                {continueCourse.completedLessons} of {continueCourse.course.lessons} lessons done
              </p>
              <div className="mt-6 flex items-center gap-4">
                <ProgressBar
                  value={continueCourse.progress}
                  className="bg-cream/20 flex-1 [&>span]:bg-cream"
                  label={`${continueCourse.course.title} progress`}
                />
                <span className="text-cream/80 shrink-0 text-[0.8rem]">
                  {continueCourse.progress}%
                </span>
              </div>
              <Link
                href={`/${user.username}/dashboard/courses/${continueCourse.course.slug}`}
                className="bg-cream text-forest group mt-7 inline-flex w-fit items-center gap-2.5 rounded-full px-6 py-3 text-[0.9rem] font-medium transition-transform duration-300 hover:scale-[1.02]"
              >
                Resume lesson
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={0.1} className="border-line/80 rounded-2xl border border-dashed px-8 py-14 text-center">
          <BookOpen className="text-forest/40 mx-auto size-10" strokeWidth={1.3} aria-hidden="true" />
          <p className="font-display text-ink mt-5 text-[1.3rem] font-medium">
            Nothing in progress
          </p>
          <p className="text-muted mx-auto mt-2 max-w-sm text-[0.9rem] leading-[1.7]">
            Enroll in a course and it will appear here with your progress.
          </p>
          <Link
            href={`/${user.username}/dashboard/explore`}
            className="bg-forest text-cream hover:bg-forest-deep mt-7 inline-flex rounded-full px-6 py-3 text-[0.9rem] font-medium transition-colors"
          >
            Browse courses
          </Link>
        </Reveal>
      )}

      {inProgress.length > 0 && (
        <section>
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>In progress</Eyebrow>
              <h2 className="font-display text-ink mt-3 text-[1.5rem] font-medium">
                Still on the go
              </h2>
            </div>
            <Link
              href={`/${user.username}/dashboard/courses`}
              className="group text-forest inline-flex items-center gap-2 text-[0.88rem] font-medium"
            >
              All my courses
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <ul className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((entry, index) => (
              <Reveal as="li" key={entry.course.id} delay={(index % 3) * 0.06}>
                <Link
                  href={`/${user.username}/dashboard/courses/${entry.course.slug}`}
                  className="group border-line/80 bg-cream-warm/50 hover:border-forest/25 flex h-full flex-col overflow-hidden rounded-2xl border transition-[border-color,transform] duration-500 hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={entry.course.thumbnail}
                      alt={entry.course.title}
                      fill
                      sizes="(max-width: 640px) 90vw, 30vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-ink group-hover:text-forest text-[0.98rem] font-semibold transition-colors">
                      {entry.course.title}
                    </h3>
                    <p className="text-muted mt-1.5 text-[0.8rem]">
                      {entry.completedLessons} of {entry.course.lessons} lessons
                    </p>
                    <div className="mt-auto pt-5">
                      <ProgressBar value={entry.progress} label={`${entry.course.title} progress`} />
                      <p className="text-muted mt-2.5 text-[0.78rem]">{entry.progress}% complete</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {recommended.length > 0 && (
        <section>
          <Reveal>
            <Eyebrow>Recommended for you</Eyebrow>
            <h2 className="font-display text-ink mt-3 text-[1.5rem] font-medium">
              <Flame className="text-forest mr-2 inline size-5" aria-hidden="true" />
              Where to go next
            </h2>
          </Reveal>
          <ul className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((course, index) => (
              <Reveal as="li" key={course.id} delay={(index % 3) * 0.06}>
                <Link
                  href={`/courses/${course.slug}`}
                  className="group border-line/80 hover:border-forest/25 flex h-full items-center gap-4 rounded-2xl border p-4 transition-colors duration-300"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={course.thumbnail} alt={course.title} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-ink group-hover:text-forest text-[0.92rem] font-semibold transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-muted mt-1 text-[0.78rem]">
                      {course.lessons} lessons · {course.level}
                    </p>
                    <p className="text-ink font-display mt-2 text-[1rem] font-semibold">
                      {formatPrice(course.discountPrice ?? course.price)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
