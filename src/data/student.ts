import { courses } from "@/data/courses";
import type { Course } from "@/types/course";

export interface Enrollment {
  courseSlug: string;
  /** Lessons finished so far, out of the course's total. */
  completedLessons: number;
  /** Title of the lesson to resume on. */
  nextLesson: string;
  /** ISO date of the last time they opened it. */
  lastOpened: string;
  completedOn?: string;
}

export interface Certificate {
  id: string;
  courseSlug: string;
  issuedOn: string;
  credentialId: string;
}

export interface Student {
  name: string;
  firstName: string;
  email: string;
  memberSince: string;
  avatar: string;
}

/**
 * Demo student. Phase 4 is frontend-only — there is no auth and no database, so
 * the dashboard reads this fixture. When NextAuth and MongoDB land, replace the
 * accessors at the bottom of this file and the components stay unchanged.
 */
export const student: Student = {
  name: "Ananya Sharma",
  firstName: "Ananya",
  email: "ananya@example.com",
  memberSince: "2025-11-02",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces&q=80&auto=format",
};

export const enrollments: Enrollment[] = [
  {
    courseSlug: "churros-from-scratch",
    completedLessons: 8,
    nextLesson: "Course complete",
    lastOpened: "2026-08-18",
    completedOn: "2026-08-18",
  },
  {
    courseSlug: "chocolate-cake-mastery",
    completedLessons: 7,
    nextLesson: "Silky chocolate ganache",
    lastOpened: "2026-08-21",
  },
  {
    courseSlug: "macaron-perfection",
    completedLessons: 3,
    nextLesson: "Macaronage — reading the batter",
    lastOpened: "2026-08-20",
  },
  {
    courseSlug: "cookie-craft",
    completedLessons: 9,
    nextLesson: "Course complete",
    lastOpened: "2026-07-30",
    completedOn: "2026-07-30",
  },
  {
    courseSlug: "artisan-sourdough",
    completedLessons: 2,
    nextLesson: "Feeding schedule and readiness",
    lastOpened: "2026-08-12",
  },
];

export const certificates: Certificate[] = [
  {
    id: "c1",
    courseSlug: "churros-from-scratch",
    issuedOn: "2026-08-18",
    credentialId: "CA-CFS-8842",
  },
  {
    id: "c2",
    courseSlug: "cookie-craft",
    issuedOn: "2026-07-30",
    credentialId: "CA-CKC-7310",
  },
];

export interface EnrolledCourse extends Enrollment {
  course: Course;
  /** 0–100, rounded. */
  progress: number;
  isComplete: boolean;
}

/** Enrollments joined to their course, newest activity first. */
export function getEnrolledCourses(): EnrolledCourse[] {
  return enrollments
    .flatMap((enrollment) => {
      const course = courses.find((entry) => entry.slug === enrollment.courseSlug);
      if (!course) return [];
      const progress = Math.round((enrollment.completedLessons / course.lessons) * 100);
      return [{ ...enrollment, course, progress, isComplete: progress >= 100 }];
    })
    .sort((a, b) => b.lastOpened.localeCompare(a.lastOpened));
}

/** The in-progress course they touched most recently. */
export function getContinueCourse(): EnrolledCourse | undefined {
  return getEnrolledCourses().find((entry) => !entry.isComplete);
}

/** Courses they have not enrolled in yet. */
export function getRecommendedCourses(limit = 3): Course[] {
  const owned = new Set(enrollments.map((entry) => entry.courseSlug));
  return courses.filter((course) => !owned.has(course.slug)).slice(0, limit);
}

export function getStudentStats() {
  const enrolled = getEnrolledCourses();
  const lessonsDone = enrolled.reduce((sum, entry) => sum + entry.completedLessons, 0);
  const totalLessons = enrolled.reduce((sum, entry) => sum + entry.course.lessons, 0);
  return {
    coursesEnrolled: enrolled.length,
    coursesCompleted: enrolled.filter((entry) => entry.isComplete).length,
    lessonsDone,
    totalLessons,
    certificates: certificates.length,
    overallProgress:
      totalLessons === 0 ? 0 : Math.round((lessonsDone / totalLessons) * 100),
  };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
