import { CourseForm } from "@/components/admin/CourseForm";
import { Reveal } from "@/components/ui/Reveal";
import { requireSession } from "@/lib/session";
import { api } from "@/lib/api";
import { notFound } from "next/navigation";
import type { AdminCourse } from "@/lib/api";

export const metadata = { title: "Admin - Edit Course" };

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const { accessToken } = await requireSession();
  
  // We can just fetch the course details from the public endpoint for editing, 
  // though the admin endpoint gives us extra data (published, enrollmentCount)
  // Let's get the full course list from admin and find it to get those extra fields.
  const courses = await api<{ courses: AdminCourse[] }>("/admin/courses", { token: accessToken }).then(r => r.courses);
  const course = courses.find((c) => c.id === params.id);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <Reveal>
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Edit Course</h1>
          <p className="text-muted mt-2 text-[0.95rem]">
            Updating: {course.title}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <CourseForm initialData={course} token={accessToken} />
      </Reveal>
    </div>
  );
}
