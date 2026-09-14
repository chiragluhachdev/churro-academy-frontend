import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CoursePlayer } from "@/components/player/CoursePlayer";
import { fetchLearnCourse } from "@/lib/api";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Course Player" };

interface PlayerPageProps {
  params: Promise<{ username: string; slug: string }>;
  searchParams?: Promise<{ lesson?: string }>;
}

export default async function CoursePlayerPage({ params, searchParams }: PlayerPageProps) {
  const { slug, username } = await params;
  const { lesson: requested } = (await searchParams) ?? {};
  const { accessToken } = await requireSession();

  // Only returns data if this student owns the course (or an admin previews it).
  const data = await fetchLearnCourse(accessToken, slug);
  if (!data) notFound();
  const { course, progress, preview } = data;

  const ids = course.curriculum.flatMap((m) => m.lessons.map((l) => l.id));
  const done = new Set(progress.completedLessonIds);
  // Resume order: link in the URL, where they left off, first unfinished, first.
  const initialLessonId =
    (requested && ids.includes(requested) && requested) ||
    (progress.lastLessonId && ids.includes(progress.lastLessonId) && progress.lastLessonId) ||
    ids.find((id) => !done.has(id)) ||
    ids[0] ||
    "";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/${username}/dashboard/courses`}
          className="text-muted hover:text-forest inline-flex items-center gap-2 text-[0.85rem] font-medium transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to My Courses
        </Link>
        <p className="text-muted mt-5 text-[0.72rem] tracking-[0.18em] uppercase">{course.category}</p>
        <h1 className="font-display text-ink mt-2 text-[1.9rem] leading-tight font-medium sm:text-[2.3rem]">{course.title}</h1>
      </div>

      <CoursePlayer
        course={course}
        initialProgress={progress}
        initialLessonId={initialLessonId}
        preview={preview}
        basePath={`/${username}/dashboard/courses/${slug}`}
        certificatesHref={`/${username}/dashboard/certificates`}
      />
    </div>
  );
}
