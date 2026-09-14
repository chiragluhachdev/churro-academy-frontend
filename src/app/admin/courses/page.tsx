import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, EyeOff } from "lucide-react";
import { adminApi } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { CourseRowActions } from "@/components/admin/CourseRowActions";
import { formatPrice } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Admin - Courses" };

export default async function AdminCoursesPage() {
  const { accessToken } = await requireAdmin();
  const courses = await adminApi.courses(accessToken);

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight">Courses</h1>
            <p className="text-muted mt-2 text-[0.95rem]">
              Manage your course catalogue.
            </p>
          </div>
          <Link
            href="/admin/courses/new"
            className="bg-forest hover:bg-forest-deep text-cream inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.9rem] font-medium transition-colors"
          >
            <Plus className="size-4" strokeWidth={2} />
            New Course
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="bg-cream-warm border border-line/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-forest/5 text-muted border-b border-line/50">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Course</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Status</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Price</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem]">Sold</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[0.75rem] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-forest/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative size-12 rounded-lg overflow-hidden shrink-0">
                          <Image src={course.thumbnail} alt={course.title} fill sizes="48px" className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-ink text-[0.95rem]">{course.title}</p>
                          <p className="text-muted text-[0.8rem] mt-0.5">{course.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${course.published ? 'bg-forest/10 text-forest' : 'bg-sand text-ink/70'}`}>
                        {course.published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-ink">
                      {formatPrice(course.discountPrice ?? course.price)}
                      {course.discountPrice != null && (
                        <span className="text-muted ml-2 text-[0.8rem] font-normal line-through">
                          {formatPrice(course.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {course.enrollmentCount} order{course.enrollmentCount !== 1 && 's'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CourseRowActions
                        id={course.id}
                        slug={course.slug}
                        title={course.title}
                        published={course.published}
                        enrollmentCount={course.enrollmentCount}
                      />
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                      No courses found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
