"use server";

import { revalidatePath } from "next/cache";

import { ApiError, api, type LearnProgress } from "@/lib/api";
import { requireSession } from "@/lib/session";

/** Marks one lesson done or not done. The backend accepts only real lesson ids. */
export async function setLessonCompleteAction(
  slug: string,
  lessonId: string,
  complete: boolean,
): Promise<{ ok: true; progress: LearnProgress } | { ok: false; error: string }> {
  const { user, accessToken } = await requireSession();
  try {
    const { progress } = await api<{ progress: LearnProgress }>(
      `/learn/${slug}/lessons/${encodeURIComponent(lessonId)}/complete`,
      { method: complete ? "POST" : "DELETE", token: accessToken },
    );
    revalidatePath(`/${user.username}/dashboard`, "layout");
    return { ok: true, progress };
  } catch (error) {
    return { ok: false, error: error instanceof ApiError ? error.message : "Couldn't save progress." };
  }
}

/** Remembers the open lesson so the player resumes there. Fire-and-forget. */
export async function openLessonAction(slug: string, lessonId: string) {
  const { accessToken } = await requireSession();
  await api(`/learn/${slug}/lessons/${encodeURIComponent(lessonId)}/open`, {
    method: "POST",
    token: accessToken,
  }).catch(() => undefined);
}
