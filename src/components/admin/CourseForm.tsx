"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";

import { saveCourseAction } from "@/app/admin/actions";
import { Card, Field, FieldGroup, FormActions, ImageField, Toggle, inputClass } from "@/components/admin/fields";
import { FaqEditor, StringListEditor } from "@/components/admin/ListEditor";
import type { AdminCourse, CourseInput } from "@/lib/api";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CourseForm({ initialData }: { initialData?: AdminCourse }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Auto-derive the slug from the title until the admin edits it by hand.
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData));

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ?? "",
    thumbnail: initialData?.thumbnail ?? "",
    heroImage: initialData?.heroImage ?? "",
    price: String(initialData?.price ?? ""),
    discountPrice: initialData?.discountPrice != null ? String(initialData.discountPrice) : "",
    level: (initialData?.level ?? "Beginner") as CourseInput["level"],
    duration: initialData?.duration ?? "",
    category: initialData?.category ?? "",
    badge: initialData?.badge ?? "",
    featured: initialData?.featured ?? false,
    published: initialData?.published ?? true,
    driveLink: initialData?.driveLink ?? "",
    drivePassword: initialData?.drivePassword ?? "",
  });
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(
    () => initialData?.whatYouWillLearn ?? [],
  );
  const [includedItems, setIncludedItems] = useState<string[]>(
    () => initialData?.includedItems ?? [],
  );
  const [requirements, setRequirements] = useState<string[]>(
    () => initialData?.requirements ?? [],
  );
  const [faqs, setFaqs] = useState(() => initialData?.faqs ?? []);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.thumbnail) {
      setError("Add a thumbnail — it's what shows on the course card.");
      return;
    }
    const price = Number(form.price);
    const discount = form.discountPrice === "" ? null : Number(form.discountPrice);
    if (discount !== null && discount >= price) {
      setError("Sale price has to be lower than the regular price.");
      return;
    }

    if (form.driveLink.trim() && !/^https?:\/\//i.test(form.driveLink.trim())) {
      setError("The Drive link must start with https://.");
      return;
    }

    const clean = (list: string[]) => list.map((v) => v.trim()).filter(Boolean);
    const payload: CourseInput = {
      ...form,
      price,
      discountPrice: discount,
      badge: form.badge.trim(),
      driveLink: form.driveLink.trim(),
      drivePassword: form.drivePassword.trim(),
      whatYouWillLearn: clean(whatYouWillLearn),
      includedItems: clean(includedItems),
      requirements: clean(requirements),
      faqs: faqs
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
        .filter((f) => f.question && f.answer),
    };

    startTransition(async () => {
      const result = await saveCourseAction(initialData?.id ?? null, payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/courses");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card title="Basics">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Course title">
            <input
              required
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", toSlug(e.target.value));
              }}
              className={inputClass}
            />
          </Field>
          <Field label="URL slug" hint={`Page lives at /courses/${form.slug || "…"}`}>
            <input
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", toSlug(e.target.value));
              }}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Short description" hint="One line — shown on course cards.">
          <input
            required
            value={form.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Full description">
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputClass}
          />
        </Field>
      </Card>

      <Card title="Details & pricing">
        <div className="grid gap-6 md:grid-cols-3">
          <Field label="Category">
            <input
              required
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Cakes"
              className={inputClass}
            />
          </Field>
          <Field label="Level">
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value as CourseInput["level"])}
              className={inputClass}
            >
              {LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </Field>
          <Field label="Badge" hint="Optional, e.g. Bestseller">
            <input value={form.badge} onChange={(e) => set("badge", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Duration" hint="e.g. 4h 10m">
            <input value={form.duration} onChange={(e) => set("duration", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Price (₹)" hint="Whole rupees">
            <input
              required
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Sale price (₹)" hint="Optional — leave blank for no sale">
            <input
              type="number"
              min={0}
              value={form.discountPrice}
              onChange={(e) => set("discountPrice", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      <Card title="Course delivery">
        <p className="text-muted -mt-2 text-[0.85rem]">
          Where the actual recordings live. The site never shows this — as soon as someone pays, it&rsquo;s
          emailed to them automatically (and included on the resend if you add or change it later).
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Google Drive link">
            <input
              type="url"
              value={form.driveLink}
              onChange={(e) => set("driveLink", e.target.value)}
              placeholder="https://drive.google.com/drive/folders/…"
              className={inputClass}
            />
          </Field>
          <Field label="Folder password" hint="Optional — leave blank if the link needs no password.">
            <input
              value={form.drivePassword}
              onChange={(e) => set("drivePassword", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      <Card title="Course page content">
        <FieldGroup label="What you'll learn">
          <StringListEditor
            value={whatYouWillLearn}
            onChange={setWhatYouWillLearn}
            placeholder="e.g. Temper chocolate for a glossy finish"
            addLabel="Add outcome"
          />
        </FieldGroup>
        <FieldGroup label="What's included">
          <StringListEditor
            value={includedItems}
            onChange={setIncludedItems}
            placeholder="e.g. Lifetime access"
            addLabel="Add item"
          />
        </FieldGroup>
        <FieldGroup label="Requirements" hint="Optional — what students need before starting.">
          <StringListEditor
            value={requirements}
            onChange={setRequirements}
            placeholder="e.g. A standard home oven"
            addLabel="Add requirement"
          />
        </FieldGroup>
        <FieldGroup label="Course FAQs" hint="Optional — shown on the course page.">
          <FaqEditor value={faqs} onChange={setFaqs} />
        </FieldGroup>
      </Card>

      <Card title="Images">
        <div className="grid gap-6 md:grid-cols-2">
          <ImageField
            label="Thumbnail"
            hint="Course cards. 4:3 works best."
            value={form.thumbnail}
            onChange={(url) => set("thumbnail", url)}
            aspect="aspect-[4/3]"
          />
          <ImageField
            label="Hero image"
            hint="Top of the course page. Wide, 16:9."
            value={form.heroImage}
            onChange={(url) => set("heroImage", url)}
          />
        </div>
      </Card>

      <Card title="Visibility">
        <div className="grid gap-5 sm:grid-cols-2">
          <Toggle
            label="Published"
            hint="Off keeps it as a draft — hidden from the site and not purchasable."
            checked={form.published}
            onChange={(v) => set("published", v)}
          />
          <Toggle
            label="Featured on home page"
            hint="Shows in 'Handpicked for You'."
            checked={form.featured}
            onChange={(v) => set("featured", v)}
          />
        </div>
      </Card>

      <FormActions
        pending={pending}
        error={error}
        saveLabel={initialData ? "Save changes" : "Create course"}
        onCancel={() => router.push("/admin/courses")}
      />
    </form>
  );
}
