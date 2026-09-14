"use client";

import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";

import { saveTestimonialAction, type TestimonialInput } from "@/app/admin/actions";
import { Card, Field, FormActions, ImageField, Toggle, inputClass } from "@/components/admin/fields";
import type { Testimonial } from "@/lib/api";
import { cn } from "@/lib/format";

export function TestimonialForm({
  initialData,
  courseTitles,
}: {
  initialData?: Testimonial;
  courseTitles: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialInput>({
    name: initialData?.name ?? "",
    quote: initialData?.quote ?? "",
    story: initialData?.story ?? "",
    avatar: initialData?.avatar ?? "",
    rating: initialData?.rating ?? 5,
    course: initialData?.course ?? "",
    location: initialData?.location ?? "",
    featured: initialData?.featured ?? false,
    published: initialData?.published ?? true,
    order: initialData?.order ?? 0,
  });

  const set = <K extends keyof TestimonialInput>(key: K, value: TestimonialInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveTestimonialAction(initialData?.id ?? null, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/testimonials");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card title="The review">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Reviewer name">
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ananya S." className={inputClass} />
          </Field>
          <Field label="Location" hint="Optional">
            <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Pune" className={inputClass} />
          </Field>
        </div>

        <Field label="Quote" hint="One or two sentences. Shown everywhere reviews appear.">
          <textarea required rows={2} value={form.quote} onChange={(e) => set("quote", e.target.value)} className={inputClass} />
        </Field>

        <Field label="Full story" hint="Optional. Reviews with a story are featured on the Success Stories page.">
          <textarea rows={4} value={form.story} onChange={(e) => set("story", e.target.value)} className={inputClass} />
        </Field>

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Course" hint="Links the review to that course's page.">
            <select value={form.course} onChange={(e) => set("course", e.target.value)} className={inputClass}>
              <option value="">— Not tied to a course —</option>
              {courseTitles.map((title) => (
                <option key={title}>{title}</option>
              ))}
            </select>
          </Field>

          <div className="space-y-2">
            <span className="text-ink block text-[0.85rem] font-medium">Rating</span>
            <div className="flex gap-1.5" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={form.rating === n}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  onClick={() => set("rating", n)}
                  className="p-0.5"
                >
                  <Star className={cn("size-7 transition-colors", n <= form.rating ? "fill-gold text-gold" : "text-line")} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Photo">
        <div className="max-w-[12rem]">
          <ImageField label="Avatar" hint="Square works best." value={form.avatar} onChange={(url) => set("avatar", url)} aspect="aspect-square" />
        </div>
      </Card>

      <Card title="Visibility">
        <div className="grid gap-5 sm:grid-cols-3">
          <Toggle label="Published" hint="Hidden from the site when off." checked={form.published} onChange={(v) => set("published", v)} />
          <Toggle label="Show on home page" hint="The 'Loved by bakers' carousel." checked={form.featured} onChange={(v) => set("featured", v)} />
          <Field label="Sort order" hint="Lower numbers show first.">
            <input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} className={inputClass} />
          </Field>
        </div>
      </Card>

      <FormActions pending={pending} error={error} saveLabel={initialData ? "Save changes" : "Add review"} onCancel={() => router.push("/admin/testimonials")} />
    </form>
  );
}
