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
  /** Cache tags, so admin saves can expire exactly this data via updateTag. */
  tags?: string[];
}

/**
 * Thin wrapper over the Express API. Everything the site renders comes through
 * here, so the frontend holds no database credentials.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, revalidate, tags, headers, ...rest } = options;

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
    next: revalidate === undefined ? undefined : { revalidate, tags },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? "Request failed.");
  }
  return data as T;
}

/** Every admin-editable dataset gets one tag; saving expires it site-wide. */
export const CACHE_TAGS = {
  courses: "courses",
  testimonials: "testimonials",
  posts: "posts",
  chef: "chef",
} as const;

/* ------------------------------------------------------------ catalogue -- */

export async function fetchCourses(): Promise<Course[]> {
  const { courses } = await api<{ courses: Course[] }>("/courses", {
    revalidate: 300,
    tags: [CACHE_TAGS.courses],
  });
  return courses;
}

export async function fetchFeaturedCourses(): Promise<Course[]> {
  const { courses } = await api<{ courses: Course[] }>("/courses?featured=true", {
    revalidate: 300,
    tags: [CACHE_TAGS.courses],
  });
  return courses;
}

export async function fetchCourse(slug: string): Promise<Course | null> {
  try {
    const { course } = await api<{ course: Course }>(`/courses/${slug}`, {
      revalidate: 300,
      tags: [CACHE_TAGS.courses],
    });
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
  createCourse: (token: string, data: CourseInput) =>
    api<{ course: AdminCourse }>("/courses", { method: "POST", token, body: data }).then(
      (r) => r.course,
    ),
  updateCourse: (token: string, id: string, data: Partial<CourseInput>) =>
    api<{ course: AdminCourse }>(`/courses/${id}`, { method: "PATCH", token, body: data }).then(
      (r) => r.course,
    ),
  /** Includes unpublished drafts, unlike the public content fetchers. */
  testimonials: (token: string) =>
    api<{ testimonials: Testimonial[] }>("/admin/content/testimonials", { token }).then(
      (r) => r.testimonials,
    ),
  posts: (token: string) =>
    api<{ posts: Post[] }>("/admin/content/posts", { token }).then((r) => r.posts),
  deleteCourse: (token: string, id: string) =>
    api<{ ok: boolean }>(`/courses/${id}`, { method: "DELETE", token }),
};

/** Fields the admin course form edits. */
export interface CourseInput {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  heroImage: string;
  price: number;
  discountPrice?: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: number;
  category: string;
  featured: boolean;
  published: boolean;
  badge?: string;
}

/* ---------------------------------------------------------- site content -- */

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  story: string;
  avatar: string;
  rating: number;
  course: string;
  location: string;
  featured: boolean;
  published: boolean;
  order: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover: string;
  category: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  featured: boolean;
  published: boolean;
}

export type ChefStatIcon = "experience" | "recipes" | "students" | "passion";
export type ChefSocialIcon = "instagram" | "youtube" | "pinterest";

export interface Chef {
  id: string;
  name: string;
  title: string;
  tagline: string;
  bio: string;
  longBio: string[];
  avatar: string;
  portrait: string;
  specialities: string[];
  stats: { value: string; label: string; icon: ChefStatIcon }[];
  socials: { label: string; href: string; icon: ChefSocialIcon }[];
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { testimonials } = await api<{ testimonials: Testimonial[] }>("/content/testimonials", {
    revalidate: 300,
    tags: [CACHE_TAGS.testimonials],
  });
  return testimonials;
}

export async function fetchFeaturedTestimonials(): Promise<Testimonial[]> {
  const { testimonials } = await api<{ testimonials: Testimonial[] }>(
    "/content/testimonials?featured=true",
    { revalidate: 300, tags: [CACHE_TAGS.testimonials] },
  );
  return testimonials;
}

export async function fetchTestimonialsForCourse(courseTitle: string): Promise<Testimonial[]> {
  const all = await fetchTestimonials();
  return all.filter((t) => t.course === courseTitle);
}

export async function fetchPosts(): Promise<Post[]> {
  const { posts } = await api<{ posts: Post[] }>("/content/posts", {
    revalidate: 300,
    tags: [CACHE_TAGS.posts],
  });
  return posts;
}

export async function fetchPost(slug: string): Promise<Post | null> {
  try {
    const { post } = await api<{ post: Post }>(`/content/posts/${slug}`, {
      revalidate: 300,
      tags: [CACHE_TAGS.posts],
    });
    return post;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchChef(): Promise<Chef> {
  const { chef } = await api<{ chef: Chef }>("/content/chef", {
    revalidate: 300,
    tags: [CACHE_TAGS.chef],
  });
  return chef;
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
