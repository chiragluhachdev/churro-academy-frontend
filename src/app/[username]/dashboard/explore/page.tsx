import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Reveal } from "@/components/ui/Reveal";
import { fetchCourses } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Explore Courses" };

export default async function DashboardExplorePage() {
  const courses = await fetchCourses();
  
  return (
    <div className="space-y-12">
      <Reveal>
        <DashboardHeader
          eyebrow="Explore"
          title="The full catalogue."
          lede="Find your next challenge and continue your baking journey."
        />
      </Reveal>

      <section>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <Reveal as="li" key={course.id} delay={(index % 3) * 0.06}>
              <Link
                href={`/courses/${course.slug}`}
                className="group border-line/80 hover:border-forest/25 flex h-full flex-col overflow-hidden rounded-2xl border transition-[border-color,transform] duration-500 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  {course.badge && (
                    <div className="absolute top-3 left-3 bg-cream text-forest px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider rounded-full shadow-sm">
                      {course.badge}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-forest text-[0.75rem] font-semibold tracking-wider uppercase">
                      {course.category}
                    </span>
                    <span className="text-muted text-[0.75rem]">
                      {course.duration}
                    </span>
                  </div>
                  <h3 className="text-ink group-hover:text-forest text-[1.1rem] font-display font-medium transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-muted mt-2 text-[0.85rem] line-clamp-2">
                    {course.shortDescription}
                  </p>
                  
                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-ink text-[1.1rem] font-semibold">
                        {formatPrice(course.discountPrice ?? course.price)}
                      </p>
                      {course.discountPrice && (
                        <span className="text-muted text-[0.8rem] line-through">
                          {formatPrice(course.price)}
                        </span>
                      )}
                    </div>
                    <span className="text-forest inline-flex items-center gap-1 text-[0.85rem] font-medium">
                      View
                      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
}
