import { cookies } from "next/headers";

import { ApiError, api } from "@/lib/api";
import { AI_DEFAULT_CONFIG, type AiConfig, type AiMember } from "@/lib/churroaiShared";

/**
 * Churro AI's own session — an httpOnly cookie holding the backend's member
 * token, set and cleared only by server actions. Entirely separate from the
 * admin's NextAuth session. Server-only: client components use churroaiShared.
 */
export const AI_SESSION_COOKIE = "churroai_session";
export const AI_CACHE_TAG = "ai";

export async function fetchAiConfig(): Promise<AiConfig> {
  try {
    const { config } = await api<{ config: AiConfig }>("/ai/config", { revalidate: 60, tags: [AI_CACHE_TAG] });
    return config;
  } catch {
    return AI_DEFAULT_CONFIG;
  }
}

export async function getAiToken(): Promise<string | null> {
  return (await cookies()).get(AI_SESSION_COOKIE)?.value ?? null;
}

/** The signed-in member, or null when signed out or the session has lapsed. */
export async function fetchAiMember(): Promise<AiMember | null> {
  const token = await getAiToken();
  if (!token) return null;
  try {
    const { member } = await api<{ member: AiMember }>("/ai/me", { token });
    return member;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
