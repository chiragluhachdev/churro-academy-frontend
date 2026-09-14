"use server";

import { updateTag } from "next/cache";

import {
  ApiError,
  CACHE_TAGS,
  api,
  type Chef,
  type CourseInput,
  type Post,
  type Testimonial,
} from "@/lib/api";
import { requireAdmin } from "@/lib/session";

/**
 * Every admin write goes through here rather than straight from the browser:
 *  - the backend token never leaves the server,
 *  - API_URL is the server-side value (a client bundle would fall back to
 *    localhost and break in production),
 *  - updateTag expires the matching public data, so the site shows the change
 *    on the very next request instead of after the cache window.
 */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

async function run<T>(tag: string | null, fn: (token: string) => Promise<T>): Promise<ActionResult<T>> {
  const { accessToken } = await requireAdmin();
  try {
    const data = await fn(accessToken);
    if (tag) updateTag(tag);
    return { ok: true, data } as ActionResult<T>;
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
    return { ok: false, error: message };
  }
}

/* ---------------------------------------------------------------- courses -- */

export async function saveCourseAction(id: string | null, input: CourseInput) {
  return run(CACHE_TAGS.courses, (token) =>
    id
      ? api(`/courses/${id}`, { method: "PATCH", token, body: input })
      : api("/courses", { method: "POST", token, body: input }),
  );
}

export async function deleteCourseAction(id: string) {
  return run(CACHE_TAGS.courses, (token) => api(`/courses/${id}`, { method: "DELETE", token }));
}

/* ----------------------------------------------------------- testimonials -- */

export type TestimonialInput = Omit<Testimonial, "id">;

export async function saveTestimonialAction(id: string | null, input: TestimonialInput) {
  return run(CACHE_TAGS.testimonials, (token) =>
    id
      ? api(`/admin/content/testimonials/${id}`, { method: "PATCH", token, body: input })
      : api("/admin/content/testimonials", { method: "POST", token, body: input }),
  );
}

export async function deleteTestimonialAction(id: string) {
  return run(CACHE_TAGS.testimonials, (token) =>
    api(`/admin/content/testimonials/${id}`, { method: "DELETE", token }),
  );
}

/* ------------------------------------------------------------------ posts -- */

export type PostInput = Omit<Post, "id">;

export async function savePostAction(id: string | null, input: PostInput) {
  return run(CACHE_TAGS.posts, (token) =>
    id
      ? api(`/admin/content/posts/${id}`, { method: "PATCH", token, body: input })
      : api("/admin/content/posts", { method: "POST", token, body: input }),
  );
}

export async function deletePostAction(id: string) {
  return run(CACHE_TAGS.posts, (token) =>
    api(`/admin/content/posts/${id}`, { method: "DELETE", token }),
  );
}

/* ------------------------------------------------------------------- chef -- */

export type ChefInput = Omit<Chef, "id">;

export async function saveChefAction(input: ChefInput) {
  return run(CACHE_TAGS.chef, (token) =>
    api("/admin/content/chef", { method: "PUT", token, body: input }),
  );
}

/* ---------------------------------------------------------------- uploads -- */

export interface UploadTicket {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/**
 * Signs a direct browser-to-Cloudinary upload. Files never pass through Next —
 * server actions cap bodies at 1 MB, which rules out real photos, let alone
 * lesson videos. The API secret stays on the backend.
 */
export async function getUploadTicketAction(kind: "image" | "video"): Promise<ActionResult<UploadTicket>> {
  return run(null, (token) => api<UploadTicket>("/upload/signature", { method: "POST", token, body: { kind } }));
}
