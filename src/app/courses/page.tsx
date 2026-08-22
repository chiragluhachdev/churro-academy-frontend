import type { Metadata } from "next";

import { CourseCard } from "@/components/course/CourseCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { courses } from "@/data/courses";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Every Churro Academy course — cakes, churros, French pastry, breads and more, taught step by step with lifetime access.",
};

export default function CoursesPage() {
  const categories = [...new Set(courses.map((course) => course.category))];

  return (
    <>
      <PageHeader
        eyebrow="Courses"
        title="Every course, one place."
        lede="Ten programmes across cakes, fried sweets, French pastry and breads. Each one is structured, filmed close-up, and yours for life once you enrol."
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-[1400px] px-5 pt-8 pb-14 sm:px-8 sm:pt-12 lg:py-20">
          {/* Static for now — filtering arrives with the catalogue backend. */}
          <Reveal className="text-muted flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8rem]">
            <span className="text-ink font-medium">{courses.length} courses</span>
            <span aria-hidden="true">·</span>
            {categories.map((category, index) => (
              <span key={category}>
                {category}
                {index < categories.length - 1 && (
                  <span aria-hidden="true" className="ml-3">
                    ·
                  </span>
                )}
              </span>
            ))}
          </Reveal>

          <ul className="mt-6 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-7 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course, index) => (
              <Reveal as="li" key={course.id} delay={(index % 4) * 0.06}>
                <CourseCard course={course} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

    </>
  );
}
