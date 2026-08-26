import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MarkDoneButton } from "@/components/dashboard/MarkDoneButton";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Reveal } from "@/components/ui/Reveal";
import { fetchMyEnrollments } from "@/lib/api";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Course Player" };

interface PlayerPageProps {
  params: Promise<{ username: string; slug: string }>;
}

export default async function CoursePlayerPage({ params }: PlayerPageProps) {
  const { slug, username } = await params;
  const { accessToken } = await requireSession();
  
  const enrollments = await fetchMyEnrollments(accessToken);
  const enrollment = enrollments.find((e) => e.course.slug === slug);
  
  if (!enrollment) notFound();

  const { course, completedLessons, progress } = enrollment;

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="mb-4">
          <Link
            href={`/${username}/dashboard/courses`}
            className="text-muted hover:text-forest inline-flex items-center gap-2 text-[0.85rem] font-medium transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to My Courses
          </Link>
        </div>
        <DashboardHeader
          eyebrow={course.category}
          title={course.title}
          lede={`${completedLessons} of ${course.lessons} lessons completed`}
        />
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left Column: Video Player Placeholder & Controls */}
        <Reveal delay={0.05} className="space-y-6">
          <div className="bg-forest-deep relative aspect-video w-full overflow-hidden rounded-2xl border border-cream/10 shadow-lg flex items-center justify-center">
            {/* Dummy Video Player */}
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 flex flex-col items-center gap-4 text-cream">
              <button
                type="button"
                className="text-cream/90 hover:text-cream hover:scale-110 transition-all duration-300"
              >
                <PlayCircle className="size-20" strokeWidth={1} />
              </button>
              <p className="font-display text-[1.2rem] font-medium tracking-wide">
                Video Player (Coming Soon)
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-cream-warm rounded-xl border border-line/70">
            <div className="flex-1 max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-ink text-[0.85rem] font-semibold">Overall Progress</span>
                <span className="text-forest text-[0.85rem] font-medium">{progress}%</span>
              </div>
              <ProgressBar value={progress} label="Course progress" />
            </div>
            
            <div className="ml-6">
              <MarkDoneButton 
                courseId={course.id} 
                completedLessons={completedLessons} 
                totalLessons={course.lessons} 
              />
            </div>
          </div>
        </Reveal>

        {/* Right Column: Curriculum List */}
        <Reveal delay={0.1}>
          <div className="bg-cream border-line/70 rounded-2xl border sticky top-28">
            <div className="border-line/70 border-b p-5">
              <h3 className="font-display text-ink text-[1.1rem] font-semibold">Course Content</h3>
            </div>
            <div className="p-3">
              <ul className="space-y-1">
                {Array.from({ length: course.lessons }).map((_, i) => {
                  const isDone = i < completedLessons;
                  const isCurrent = i === completedLessons;
                  return (
                    <li key={i}>
                      <button
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                          isCurrent
                            ? "bg-forest/10 text-forest"
                            : isDone
                            ? "text-muted hover:bg-cream-warm"
                            : "text-ink hover:bg-cream-warm"
                        }`}
                      >
                        <div
                          className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isDone
                              ? "bg-forest border-forest text-cream"
                              : isCurrent
                              ? "border-forest text-forest"
                              : "border-line text-muted"
                          }`}
                        >
                          <span className="text-[0.65rem] font-bold">{i + 1}</span>
                        </div>
                        <span className={`text-[0.85rem] truncate ${isCurrent ? "font-semibold" : "font-medium"}`}>
                          Lesson {i + 1}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
