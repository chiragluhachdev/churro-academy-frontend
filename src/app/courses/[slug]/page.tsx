import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseHero } from "@/components/course/CourseHero";
import { WhatYouWillLearn } from "@/components/course/WhatYouWillLearn";
import { Curriculum } from "@/components/course/Curriculum";
import { CourseInstructor } from "@/components/course/CourseInstructor";
import { CourseReviews } from "@/components/course/CourseReviews";
import { CourseFAQSection } from "@/components/course/CourseFAQ";
import { EnrollCard } from "@/components/course/EnrollCard";
import { EnrollBar } from "@/components/course/EnrollBar";
import { CheckoutProvider, type Viewer } from "@/components/checkout/CheckoutProvider";
import { fetchCourse, fetchCourses } from "@/lib/api";
import { getSession } from "@/lib/session";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ enroll?: string }>;
}

export async function generateStaticParams() {
  const courses = await fetchCourses();
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course) return {};

  return {
    title: course.title,
    description: course.shortDescription,
    openGraph: {
      title: `${course.title} · Churro Academy`,
      description: course.shortDescription,
      images: [{ url: course.heroImage, width: 1600, height: 900 }],
    },
  };
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const [course, session] = await Promise.all([fetchCourse(slug), getSession()]);
  if (!course) notFound();

  const viewer: Viewer = session ? "admin" : "guest";
  const adminEditHref = `/admin/courses/${course.id}/edit`;

  return (
    <CheckoutProvider course={course} viewer={viewer} adminEditHref={adminEditHref} autoOpen={query.enroll === "1"}>
      <div className="pt-28 pb-20 lg:pt-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 xl:gap-16">
            {/* Left column — scrollable content */}
            <div className="space-y-14">
              <CourseHero course={course} />
              <WhatYouWillLearn items={course.whatYouWillLearn} />
              <Curriculum modules={course.curriculum} />
              <CourseInstructor />
              <CourseReviews courseTitle={course.title} />
              {course.faqs && course.faqs.length > 0 && (
                <CourseFAQSection faqs={course.faqs} />
              )}
            </div>

            {/* Right column — sticky enroll card (desktop only) */}
            <aside className="hidden lg:block" aria-label="Enrollment">
              <EnrollCard course={course} />
            </aside>
          </div>
        </div>
      </div>
      <EnrollBar course={course} />
    </CheckoutProvider>
  );
}
