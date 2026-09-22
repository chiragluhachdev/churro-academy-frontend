export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type CourseCategory =
  | "Cakes"
  | "Fried & Street"
  | "French Pastry"
  | "Cheesecakes"
  | "Breads"
  | "Basics";

export interface CurriculumLesson {
  /** Stable id, kept across admin edits. */
  id: string;
  title: string;
  /** Runtime in minutes — shown in the syllabus on the course page. */
  duration: number;
}

export interface CurriculumModule {
  id: string;
  title: string;
  lessons: CurriculumLesson[];
}

export interface CourseInstructorRef {
  id: string;
  name: string;
  title: string;
  avatar: string;
}

export interface CourseFAQ {
  question: string;
  answer: string;
}

/**
 * The full course shape. Phase 1 renders only a subset of these fields on the
 * home page, but the model is complete so that `/courses/[slug]` (Phase 2),
 * checkout (Phase 3) and the admin CMS (Phase 5) can consume the same type
 * without a migration. When this moves to MongoDB, this interface becomes the
 * Mongoose schema and only `src/data/courses.ts` changes.
 */
export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  heroImage: string;
  /** Whole rupees. Formatted for display by `formatPrice`. */
  price: number;
  discountPrice?: number;
  instructor: CourseInstructorRef;
  level: CourseLevel;
  /** Total runtime, human readable, e.g. "4h 20m". */
  duration: string;
  lessons: number;
  rating: number;
  reviewCount: number;
  category: CourseCategory;
  featured: boolean;
  badge?: string;
  curriculum: CurriculumModule[];
  whatYouWillLearn: string[];
  includedItems: string[];
  /** Prerequisites — shown on the course detail page. */
  requirements?: string[];
  /** Course-specific FAQs — shown as an accordion on the detail page. */
  faqs?: CourseFAQ[];
  /**
   * Where the recordings actually live — one Drive link (and its password,
   * if any) per course. Admin-only: the public course page never sees these;
   * they're what the enrollment email sends a buyer once they've paid.
   */
  driveLink?: string;
  drivePassword?: string;
}
