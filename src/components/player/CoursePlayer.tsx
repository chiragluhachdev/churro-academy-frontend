"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Circle, Eye, Loader2, PlayCircle, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { openLessonAction, setLessonCompleteAction } from "@/app/actions/progress";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import type { LearnProgress } from "@/lib/api";
import { cn } from "@/lib/format";
import { formatMinutes, resolveVideo } from "@/lib/video";
import type { Course } from "@/types/course";

interface CoursePlayerProps {
  course: Course;
  initialProgress: LearnProgress;
  initialLessonId: string;
  /** Admin preview: everything is viewable but progress isn't recorded. */
  preview: boolean;
  basePath: string;
  certificatesHref: string;
}

export function CoursePlayer({ course, initialProgress, initialLessonId, preview, basePath, certificatesHref }: CoursePlayerProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [currentId, setCurrentId] = useState(initialLessonId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  const lessons = useMemo(
    () =>
      course.curriculum.flatMap((section, s) =>
        section.lessons.map((lesson, l) => ({ ...lesson, sectionTitle: section.title, number: `${s + 1}.${l + 1}` })),
      ),
    [course.curriculum],
  );
  const index = Math.max(0, lessons.findIndex((l) => l.id === currentId));
  const lesson = lessons[index];
  const done = new Set(progress.completedLessonIds);
  const isDone = lesson ? done.has(lesson.id) : false;
  const video = resolveVideo(lesson?.videoUrl);

  // Keep the URL shareable and resumable without a full navigation.
  useEffect(() => {
    if (!lesson) return;
    const url = `${basePath}?lesson=${encodeURIComponent(lesson.id)}`;
    window.history.replaceState(null, "", url);
    if (!preview) void openLessonAction(course.slug, lesson.id);
    listRef.current?.querySelector(`[data-lesson="${CSS.escape(lesson.id)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [lesson, basePath, preview, course.slug]);

  function go(delta: number) {
    const next = lessons[index + delta];
    if (next) setCurrentId(next.id);
  }

  function toggleComplete(target: { id: string } | undefined = lesson, complete = !isDone, advance = false) {
    if (!target || preview) return;
    setError(null);
    // Optimistic: tick it now, reconcile with the server's answer.
    const optimistic = new Set(progress.completedLessonIds);
    if (complete) optimistic.add(target.id);
    else optimistic.delete(target.id);
    setProgress((p) => ({ ...p, completedLessonIds: [...optimistic], completedLessons: optimistic.size }));

    startTransition(async () => {
      const result = await setLessonCompleteAction(course.slug, target.id, complete);
      if (result.ok) {
        setProgress((p) => ({ ...p, ...result.progress }));
        if (advance && complete) go(1);
        router.refresh();
      } else {
        setProgress(initialProgress);
        setError(result.error);
      }
    });
  }

  if (!lesson) {
    return (
      <div className="border-line/80 rounded-2xl border border-dashed px-8 py-16 text-center">
        <Video className="text-forest/40 mx-auto size-10" strokeWidth={1.3} />
        <p className="font-display text-ink mt-4 text-[1.3rem] font-medium">Lessons are on their way</p>
        <p className="text-muted mt-2 text-[0.9rem]">This course doesn&rsquo;t have any lessons yet.</p>
      </div>
    );
  }

  const percent = progress.totalLessons ? Math.round((progress.completedLessonIds.length / progress.totalLessons) * 100) : 0;
  const courseDone = progress.totalLessons > 0 && progress.completedLessonIds.length >= progress.totalLessons;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        {preview && (
          <p className="bg-gold/15 text-ink flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.82rem]">
            <Eye className="text-gold size-4" />
            Admin preview — you can watch everything, but progress isn&rsquo;t recorded.
          </p>
        )}

        <div className="bg-ink relative aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
          {video.kind === "youtube" || video.kind === "vimeo" ? (
            <iframe
              key={lesson.id}
              src={video.embedUrl}
              title={lesson.title}
              className="absolute inset-0 size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : video.kind === "file" ? (
            <video
              key={lesson.id}
              src={video.src}
              controls
              controlsList="nodownload"
              playsInline
              className="absolute inset-0 size-full bg-black"
              onContextMenu={(e) => e.preventDefault()}
              // Finishing the video marks the lesson done and moves on.
              onEnded={() => !preview && !isDone && toggleComplete(lesson, true, true)}
            />
          ) : (
            <div className="text-cream/80 absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <PlayCircle className="size-14" strokeWidth={1} />
              <p className="font-display text-[1.15rem]">Video for this lesson is coming soon</p>
              {lesson.description && <p className="text-cream/55 text-[0.85rem]">Read the notes below in the meantime.</p>}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-muted text-[0.75rem] tracking-[0.14em] uppercase">
              Lesson {lesson.number} · {lesson.sectionTitle}
            </p>
            <h2 className="font-display text-ink mt-1.5 text-[1.5rem] leading-tight font-medium">{lesson.title}</h2>
            {lesson.duration > 0 && <p className="text-muted mt-1 text-[0.82rem]">{formatMinutes(lesson.duration)}</p>}
          </div>
          {!preview && (
            <button
              type="button"
              onClick={() => toggleComplete()}
              disabled={pending}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[0.88rem] font-medium transition-colors disabled:opacity-60",
                isDone ? "bg-forest/10 text-forest hover:bg-forest/15" : "bg-forest text-cream hover:bg-forest-deep",
              )}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              {isDone ? "Completed" : "Mark as complete"}
            </button>
          )}
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-[0.85rem] text-red-700">{error}</p>}

        {lesson.description && (
          <div className="border-line/70 bg-cream-warm/50 rounded-2xl border p-5">
            <p className="text-ink mb-2 text-[0.85rem] font-semibold">Lesson notes</p>
            <p className="text-ink/80 text-[0.92rem] leading-[1.75] whitespace-pre-line">{lesson.description}</p>
          </div>
        )}

        <div className="border-line/70 flex items-center justify-between gap-3 border-t pt-5">
          <button type="button" onClick={() => go(-1)} disabled={index === 0} className="text-ink hover:bg-forest/5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.88rem] font-medium disabled:opacity-35">
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <span className="text-muted text-[0.8rem]">
            {index + 1} / {lessons.length}
          </span>
          <button type="button" onClick={() => go(1)} disabled={index === lessons.length - 1} className="text-ink hover:bg-forest/5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.88rem] font-medium disabled:opacity-35">
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="border-line/70 bg-cream overflow-hidden rounded-2xl border">
          <div className="border-line/70 border-b p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-ink text-[1.05rem] font-semibold">Course content</h3>
              <span className="text-forest text-[0.82rem] font-medium">{percent}%</span>
            </div>
            <ProgressBar value={percent} className="mt-3" label="Course progress" />
            <p className="text-muted mt-2 text-[0.75rem]">
              {progress.completedLessonIds.length} of {progress.totalLessons} lessons complete
            </p>
            {courseDone && !preview && (
              <Link href={certificatesHref} className="bg-forest text-cream hover:bg-forest-deep mt-4 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[0.85rem] font-medium transition-colors">
                <Award className="size-4" />
                View your certificate
              </Link>
            )}
          </div>

          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2 lg:max-h-[calc(100vh-16rem)]">
            {course.curriculum.map((section, s) => {
              const sectionDone = section.lessons.filter((l) => done.has(l.id)).length;
              return (
                <div key={section.id} className="mb-2">
                  <div className="flex items-baseline justify-between px-3 pt-3 pb-1.5">
                    <p className="text-ink text-[0.8rem] font-semibold">
                      {s + 1}. {section.title}
                    </p>
                    <span className="text-muted text-[0.7rem]">
                      {sectionDone}/{section.lessons.length}
                    </span>
                  </div>
                  <ul>
                    {section.lessons.map((item, l) => {
                      const active = item.id === lesson.id;
                      const complete = done.has(item.id);
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            data-lesson={item.id}
                            onClick={() => setCurrentId(item.id)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                              active ? "bg-forest/10" : "hover:bg-cream-warm",
                            )}
                          >
                            <span
                              role={preview ? undefined : "checkbox"}
                              aria-checked={preview ? undefined : complete}
                              aria-label={preview ? undefined : complete ? "Mark as not complete" : "Mark as complete"}
                              onClick={(e) => {
                                if (preview) return;
                                e.stopPropagation();
                                toggleComplete(item, !complete);
                              }}
                              className="mt-0.5 shrink-0"
                            >
                              {complete ? (
                                <CheckCircle2 className="text-forest size-[1.1rem]" />
                              ) : (
                                <Circle className={cn("size-[1.1rem]", active ? "text-forest" : "text-line")} />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={cn("block text-[0.85rem] leading-snug", active ? "text-forest font-semibold" : "text-ink")}>
                                {s + 1}.{l + 1} {item.title}
                              </span>
                              <span className="text-muted mt-0.5 flex items-center gap-1.5 text-[0.7rem]">
                                {item.videoUrl ? <PlayCircle className="size-3" /> : null}
                                {formatMinutes(item.duration)}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
