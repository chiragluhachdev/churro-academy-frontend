"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";

import { savePostAction, type PostInput } from "@/app/admin/actions";
import { Card, Field, FormActions, ImageField, Toggle, inputClass } from "@/components/admin/fields";
import type { Post } from "@/lib/api";

const CATEGORIES = ["Technique", "Recipes", "Ingredients", "Behind the Scenes"];

function toSlug(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** ~220 words a minute, never under one. */
function estimateMinutes(text: string) {
  return Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 220));
}

export function PostForm({ initialData }: { initialData?: Post }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData));

  const [form, setForm] = useState<PostInput>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    body: initialData?.body ?? "",
    cover: initialData?.cover ?? "",
    category: initialData?.category ?? "Technique",
    author: initialData?.author ?? "Chef Simone Kathuria",
    publishedAt: (initialData?.publishedAt ?? new Date().toISOString()).slice(0, 10),
    readingMinutes: initialData?.readingMinutes ?? 5,
    featured: initialData?.featured ?? false,
    published: initialData?.published ?? true,
  });

  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!form.cover) {
      setError("Add a cover image — it's what shows on the blog grid.");
      return;
    }
    startTransition(async () => {
      const result = await savePostAction(initialData?.id ?? null, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card title="Article">
        <Field label="Title">
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
        <Field label="URL slug" hint={`Lives at /blog/${form.slug || "…"}`}>
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
        <Field label="Excerpt" hint="Two sentences — shown on the blog grid.">
          <textarea required rows={2} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Body" hint="Plain text. Leave a blank line between paragraphs.">
          <textarea
            rows={14}
            value={form.body}
            onChange={(e) => {
              set("body", e.target.value);
              set("readingMinutes", estimateMinutes(e.target.value));
            }}
            className={`${inputClass} font-[inherit] leading-[1.7]`}
          />
        </Field>
      </Card>

      <Card title="Cover">
        <ImageField label="Cover image" hint="Wide, 3:2." value={form.cover} onChange={(url) => set("cover", url)} aspect="aspect-[3/2]" />
      </Card>

      <Card title="Details">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Category">
            <input list="post-categories" value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass} />
            <datalist id="post-categories">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Author">
            <input value={form.author} onChange={(e) => set("author", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Publish date">
            <input type="date" value={form.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Reading time (minutes)" hint="Estimated from the body as you type.">
            <input type="number" min={1} value={form.readingMinutes} onChange={(e) => set("readingMinutes", Number(e.target.value))} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Toggle label="Published" hint="Hidden from the blog when off." checked={form.published} onChange={(v) => set("published", v)} />
          <Toggle label="Featured" hint="The large card at the top of the blog." checked={form.featured} onChange={(v) => set("featured", v)} />
        </div>
      </Card>

      <FormActions pending={pending} error={error} saveLabel={initialData ? "Save changes" : "Publish post"} onCancel={() => router.push("/admin/blog")} />
    </form>
  );
}
