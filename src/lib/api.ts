import type { Course } from "@/types/course";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string;
  /** Seconds to cache. Omit for always-fresh (per-user data). */
  revalidate?: number;
}

/**
 * Thin wrapper over the Express API. Everything the site renders comes through
 * here, so the frontend holds no database credentials.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, revalidate, headers, ...rest } = options;

  const response = await fetch(`${API_URL}/api${path}`, {
    ...rest,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    // Per-user reads must never be cached across requests.
    cache: revalidate === undefined ? "no-store" : undefined,
    next: revalidate === undefined ? undefined : { revalidate },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? "Request failed.");
  }
  return data as T;
}

/* ------------------------------------------------------------ catalogue -- */

export async function fetchCourses(): Promise<Course[]> {
  const { courses } = await api<{ courses: Course[] }>("/courses", { revalidate: 60 });
  return courses;
}

export async function fetchFeaturedCourses(): Promise<Course[]> {
  const { courses } = await api<{ courses: Course[] }>("/courses?featured=true", {
    revalidate: 60,
  });
  return courses;
}

export async function fetchCourse(slug: string): Promise<Course | null> {
  try {
    const { course } = await api<{ course: Course }>(`/courses/${slug}`, { revalidate: 60 });
    return course;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/* ---------------------------------------------------------- enrollments -- */

export interface Enrollment {
  id: string;
  course: Course;
  completedLessons: number;
  progress: number;
  isComplete: boolean;
  lastOpenedAt: string;
  completedAt?: string;
  amountPaid: number;
  paymentStatus: "paid" | "pending" | "failed";
}

export async function fetchMyEnrollments(token: string): Promise<Enrollment[]> {
  const { enrollments } = await api<{ enrollments: Enrollment[] }>("/enrollments/me", { token });
  return enrollments;
}

export async function updateProgress(token: string, courseId: string, completedLessons: number) {
  return api<{ ok: boolean; completedLessons: number }>(`/enrollments/${courseId}/progress`, {
    method: "PATCH",
    token,
    body: { completedLessons },
  });
}

export function studentStats(enrollments: Enrollment[]) {
  const lessonsDone = enrollments.reduce((sum, e) => sum + e.completedLessons, 0);
  const totalLessons = enrollments.reduce((sum, e) => sum + e.course.lessons, 0);
  const completed = enrollments.filter((e) => e.isComplete);
  return {
    coursesEnrolled: enrollments.length,
    coursesCompleted: completed.length,
    lessonsDone,
    totalLessons,
    certificates: completed.length,
    overallProgress: totalLessons === 0 ? 0 : Math.round((lessonsDone / totalLessons) * 100),
  };
}

/* ---------------------------------------------------------------- admin -- */

export interface AdminStats {
  users: number;
  courses: number;
  enrollments: number;
  revenue: number;
}

export interface AdminCourse extends Course {
  published: boolean;
  enrollmentCount: number;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "student" | "admin";
  createdAt?: string;
  enrollmentCount: number;
}

export interface AdminEnrollment {
  id: string;
  user: { name: string; username: string; email: string } | null;
  course: { title: string; slug: string } | null;
  amountPaid: number;
  paymentStatus: string;
  createdAt: string;
}

export const adminApi = {
  stats: (token: string) =>
    api<{ stats: AdminStats }>("/admin/stats", { token }).then((r) => r.stats),
  courses: (token: string) =>
    api<{ courses: AdminCourse[] }>("/admin/courses", { token }).then((r) => r.courses),
  users: (token: string) =>
    api<{ users: AdminUser[] }>("/admin/users", { token }).then((r) => r.users),
  enrollments: (token: string) =>
    api<{ enrollments: AdminEnrollment[] }>("/admin/enrollments", { token }).then(
      (r) => r.enrollments,
    ),
  createCourse: (token: string, data: any) =>
    api<{ course: AdminCourse }>("/courses", { method: "POST", token, body: data }).then(
      (r) => r.course,
    ),
  updateCourse: (token: string, id: string, data: any) =>
    api<{ course: AdminCourse }>(`/courses/${id}`, { method: "PATCH", token, body: data }).then(
      (r) => r.course,
    ),
  deleteCourse: (token: string, id: string) =>
    api<{ ok: boolean }>(`/courses/${id}`, { method: "DELETE", token }),
  uploadImage: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // Use raw fetch for FormData because api() JSON stringifies the body
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed.");
    return res.json() as Promise<{ url: string }>;
  },
};
