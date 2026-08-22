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
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCourseBySlug, courses } from "@/data/courses";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
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

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pt-28 pb-20 lg:pt-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 xl:gap-16">
            {/* Left column — scrollable content */}
            <div className="space-y-14">
              <CourseHero course={course} />
              <WhatYouWillLearn items={course.whatYouWillLearn} />
              <Curriculum modules={course.curriculum} />
              <CourseInstructor />
              <CourseReviews courseSlug={course.slug} />
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
      </main>
      <Footer />
      <EnrollBar course={course} />
    </>
  );
}
