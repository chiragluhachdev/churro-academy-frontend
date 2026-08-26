"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { adminApi } from "@/lib/api";
import type { AdminCourse } from "@/lib/api";

interface CourseFormProps {
  initialData?: AdminCourse;
  token: string;
}

export function CourseForm({ initialData, token }: CourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ?? "",
    thumbnail: initialData?.thumbnail ?? "",
    heroImage: initialData?.heroImage ?? "",
    price: initialData?.price ?? 0,
    discountPrice: initialData?.discountPrice ?? "",
    level: initialData?.level ?? "Beginner",
    duration: initialData?.duration ?? "",
    lessons: initialData?.lessons ?? 1,
    category: initialData?.category ?? "",
    featured: initialData?.featured ?? false,
    published: initialData?.published ?? false,
  });

  const [uploadingField, setUploadingField] = useState<"thumbnail" | "heroImage" | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "heroImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    setError(null);
    try {
      const { url } = await adminApi.uploadImage(token, file);
      setFormData((prev) => ({ ...prev, [field]: url }));
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      discountPrice: formData.discountPrice === "" ? undefined : Number(formData.discountPrice),
    };

    try {
      if (initialData?.id) {
        await adminApi.updateCourse(token, initialData.id, payload);
      } else {
        await adminApi.createCourse(token, payload);
      }
      router.push("/admin/courses");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[0.95rem]">
          {error}
        </div>
      )}

      <div className="bg-cream-warm border border-line/50 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[0.85rem] font-medium text-ink">Course Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-cream border border-line/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-forest/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[0.85rem] font-medium text-ink">Slug</label>
            <input
              required
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-cream border border-line/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-forest/50 transition-colors"
              placeholder="e.g. chocolate-cake-mastery"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[0.85rem] font-medium text-ink">Short Description</label>
          <input
            required
            type="text"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            className="w-full bg-cream border border-line/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-forest/50 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[0.85rem] font-medium text-ink">Full Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-cream border border-line/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-forest/50 transition-colors resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[0.85rem] font-medium text-ink">Category</label>
            <input
              required
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-cream border border-line/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-forest/50 transition-colors"
              placeholder="e.g. Cakes, Breads"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[0.85rem] font-medium text-ink">Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              className="w-full bg-cream border border-line/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-forest/50 transition-colors"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[0.85rem] font-medium text-ink">Duration (e.g. 4h 10m)</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full bg-cream border border-line/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-forest/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[0.85rem] font-medium text-ink">Total Lessons</label>
            <input
              required
              type="number"
              min="1"
              value={formData.lessons}
              onChange={(e) => setFormData({ ...formData, lessons: Number(e.target.value) })}
              className="w-full bg-cream border border-line/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-forest/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[0.85rem] font-medium text-ink">Price (in cents/INR equivalent)</label>
            <input
              required
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full bg-cream border border-line/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-forest/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-line/30">
          <div className="space-y-3">
            <label className="text-[0.85rem] font-medium text-ink">Thumbnail Image</label>
            <div className="flex items-center gap-4">
              {formData.thumbnail ? (
                <div className="relative size-24 rounded-lg overflow-hidden shrink-0 border border-line/50">
                  <Image src={formData.thumbnail} alt="Thumbnail" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, thumbnail: "" })}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/80"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <div className="size-24 rounded-lg border-2 border-dashed border-line/50 flex flex-col items-center justify-center text-muted">
                  <ImageIcon className="size-6 mb-1 opacity-50" />
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer bg-cream border border-line/50 hover:bg-forest/5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[0.85rem] font-medium transition-colors">
                  {uploadingField === "thumbnail" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e, "thumbnail")}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[0.85rem] font-medium text-ink">Hero Image</label>
            <div className="flex items-center gap-4">
              {formData.heroImage ? (
                <div className="relative h-24 w-40 rounded-lg overflow-hidden shrink-0 border border-line/50">
                  <Image src={formData.heroImage} alt="Hero" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, heroImage: "" })}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/80"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-40 rounded-lg border-2 border-dashed border-line/50 flex flex-col items-center justify-center text-muted">
                  <ImageIcon className="size-6 mb-1 opacity-50" />
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer bg-cream border border-line/50 hover:bg-forest/5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[0.85rem] font-medium transition-colors">
                  {uploadingField === "heroImage" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e, "heroImage")}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-4 border-t border-line/30">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="rounded text-forest focus:ring-forest size-4"
            />
            <span className="text-[0.9rem] font-medium text-ink">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded text-forest focus:ring-forest size-4"
            />
            <span className="text-[0.9rem] font-medium text-ink">Featured on Home Page</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-full text-[0.9rem] font-medium border border-line/50 hover:bg-black/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-forest hover:bg-forest-deep text-cream px-8 py-2.5 rounded-full text-[0.9rem] font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {initialData ? "Save Changes" : "Create Course"}
        </button>
      </div>
    </form>
  );
}
