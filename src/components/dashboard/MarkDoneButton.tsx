"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/format";
import { markLessonDone } from "@/app/actions/progress";

interface MarkDoneButtonProps {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
}

export function MarkDoneButton({
  courseId,
  completedLessons,
  totalLessons,
}: MarkDoneButtonProps) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  
  const isComplete = completedLessons >= totalLessons;

  return (
    <button
      type="button"
      onClick={() => {
        if (!isComplete) {
          startTransition(() => {
            markLessonDone(courseId, completedLessons + 1, pathname);
          });
        }
      }}
      disabled={isPending || isComplete}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.9rem] font-medium transition-colors",
        isComplete
          ? "bg-forest-deep text-cream opacity-80"
          : "bg-forest text-cream hover:bg-forest-deep disabled:opacity-70"
      )}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Check className="size-4" strokeWidth={isComplete ? 2.5 : 2} />
      )}
      {isComplete ? "Course Completed" : "Mark Next Lesson as Done"}
    </button>
  );
}
