import type { Course, CurriculumModule } from "@/types/course";

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
  billing: "billing",
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

/* ---------------------------------------------------------------- admin -- */

export interface AdminStats {
  courses: number;
  paidOrders: number;
  customers: number;
  revenue: number;
}

export interface AdminCourse extends Course {
  published: boolean;
  enrollmentCount: number;
}

export interface GstBreakdown {
  totalAmount: number;
  gstRate: number;
  taxableValue: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
}

export type OrderStatus = "created" | "paid" | "failed" | "expired";

/** One row in the billing/audit screen. */
export interface AdminOrder {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  courseTitle: string;
  amount: number;
  listPrice: number;
  status: OrderStatus;
  provider: "dummy" | "razorpay";
  gst: GstBreakdown;
  createdAt?: string;
  paidAt?: string;
  emailSentAt?: string;
  emailError: string;
}

/** Everything the printable invoice needs, for one order. */
export interface AdminOrderDetail {
  id: string;
  invoiceNumber: string;
  status: OrderStatus;
  provider: "dummy" | "razorpay";
  providerPaymentId: string;
  amount: number;
  listPrice: number;
  currency: string;
  gst: GstBreakdown;
  createdAt?: string;
  paidAt?: string;
  buyer: { name: string; email: string; phone: string };
  course: { title: string; slug: string };
  seller: { companyName: string; gstin: string; address: string; email: string; phone: string };
  emailSentAt?: string;
  emailError: string;
  /** What a resend would actually go out with. */
  courseDelivery: { driveLink: string; hasPassword: boolean };
}

export const adminApi = {
  stats: (token: string) =>
    api<{ stats: AdminStats }>("/admin/stats", { token }).then((r) => r.stats),
  courses: (token: string) =>
    api<{ courses: AdminCourse[] }>("/admin/courses", { token }).then((r) => r.courses),
  /** The billing/audit screen. `status`/`q` narrow it; omit for everything. */
  orders: (token: string, params?: { status?: OrderStatus; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.q) qs.set("q", params.q);
    const suffix = qs.toString() ? `?${qs}` : "";
    return api<{ orders: AdminOrder[] }>(`/admin/orders${suffix}`, { token }).then((r) => r.orders);
  },
  order: (token: string, id: string) =>
    api<{ order: AdminOrderDetail }>(`/admin/orders/${id}`, { token }).then((r) => r.order),
  resendOrderEmail: (token: string, id: string) =>
    api<{ ok: boolean }>(`/admin/orders/${id}/resend-email`, { method: "POST", token }),
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
  updateBilling: (token: string, data: BillingInfo) =>
    api<{ billing: BillingInfo }>("/admin/content/billing", { method: "PUT", token, body: data }).then(
      (r) => r.billing,
    ),
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
  /** `null` clears an existing sale. */
  discountPrice: number | null;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  category: string;
  featured: boolean;
  published: boolean;
  badge?: string;
  curriculum?: CurriculumModule[];
  whatYouWillLearn: string[];
  includedItems: string[];
  requirements: string[];
  faqs: { question: string; answer: string }[];
  /** Where the recordings live — one Drive link/password per course, emailed to a buyer once paid. */
  driveLink: string;
  drivePassword: string;
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

/** The seller's own details, for the invoice and (lightly) the footer. Not secret. */
export interface BillingInfo {
  companyName: string;
  gstin: string;
  address: string;
  email: string;
  phone: string;
  gstRate: number;
}

export async function fetchBilling(): Promise<BillingInfo> {
  const { billing } = await api<{ billing: BillingInfo }>("/content/billing", {
    revalidate: 300,
    tags: [CACHE_TAGS.billing],
  });
  return billing;
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ---------------------------------------------------------------- checkout -- */

/**
 * A checkout order, seen by the guest who created it — there's no account,
 * so the order id itself is what lets the browser come back to this one
 * order for its status or its invoice.
 */
export interface CheckoutOrder {
  id: string;
  status: OrderStatus;
  provider: "dummy" | "razorpay";
  testMode: boolean;
  amount: number;
  listPrice: number;
  discount: number;
  currency: string;
  expiresAt?: string;
  paidAt?: string;
  invoiceNumber: string;
  gst: GstBreakdown;
  /** Razorpay's own order id — needed to open its checkout widget. Empty in test mode. */
  providerOrderId: string;
  /** Razorpay's publishable key_id — safe client-side. Empty in test mode. */
  razorpayKeyId: string;
  course: {
    id: string;
    slug: string;
    title: string;
    thumbnail: string;
    level: string;
    duration: string;
    lessons: number;
    includedItems: string[];
  };
  buyer: { name: string; email: string; phone: string };
  seller: BillingInfo;
}

export async function fetchOrder(id: string): Promise<CheckoutOrder | null> {
  try {
    const { order } = await api<{ order: CheckoutOrder }>(`/orders/${id}`);
    return order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
