"use server";

import { revalidatePath } from "next/cache";

import { updateProgress } from "@/lib/api";
import { requireSession } from "@/lib/session";

export async function markLessonDone(courseId: string, completedLessons: number, currentPath: string) {
  const { accessToken } = await requireSession();
  await updateProgress(accessToken, courseId, completedLessons);
  revalidatePath(currentPath);
}
