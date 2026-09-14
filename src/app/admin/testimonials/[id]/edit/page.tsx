import { notFound } from "next/navigation";

import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { Reveal } from "@/components/ui/Reveal";
import { adminApi } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin - Edit Review" };

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { accessToken } = await requireAdmin();
  const [testimonials, courses] = await Promise.all([
    adminApi.testimonials(accessToken),
    adminApi.courses(accessToken),
  ]);
  const testimonial = testimonials.find((t) => t.id === id);
  if (!testimonial) notFound();

  return (
    <div className="space-y-10">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight">Edit review</h1>
        <p className="text-muted mt-2 text-[0.95rem]">{testimonial.name}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <TestimonialForm initialData={testimonial} courseTitles={courses.map((c) => c.title)} />
      </Reveal>
    </div>
  );
}
