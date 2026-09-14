import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { Reveal } from "@/components/ui/Reveal";
import { adminApi } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin - Add Review" };

export default async function NewTestimonialPage() {
  const { accessToken } = await requireAdmin();
  const courses = await adminApi.courses(accessToken);

  return (
    <div className="space-y-10">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight">Add review</h1>
      </Reveal>
      <Reveal delay={0.1}>
        <TestimonialForm courseTitles={courses.map((c) => c.title)} />
      </Reveal>
    </div>
  );
}
