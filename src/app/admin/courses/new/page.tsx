import { CourseForm } from "@/components/admin/CourseForm";
import { Reveal } from "@/components/ui/Reveal";
import { requireSession } from "@/lib/session";

export const metadata = { title: "Admin - New Course" };

export default async function NewCoursePage() {
  const { accessToken } = await requireSession();

  return (
    <div className="space-y-10">
      <Reveal>
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">New Course</h1>
          <p className="text-muted mt-2 text-[0.95rem]">
            Add a new course to the catalogue.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <CourseForm token={accessToken} />
      </Reveal>
    </div>
  );
}
