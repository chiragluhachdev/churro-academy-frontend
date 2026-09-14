import Image from "next/image";
import Link from "next/link";
import { Edit3, Eye, EyeOff, Home, Plus, Star } from "lucide-react";

import { deleteTestimonialAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/fields";
import { Reveal } from "@/components/ui/Reveal";
import { adminApi } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Admin - Reviews" };

export default async function AdminTestimonialsPage() {
  const { accessToken } = await requireAdmin();
  const testimonials = await adminApi.testimonials(accessToken);

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight">Reviews</h1>
            <p className="text-muted mt-2 text-[0.95rem]">
              Testimonials on the home page, Reviews, Success Stories and course pages.
            </p>
          </div>
          <Link
            href="/admin/testimonials/new"
            className="bg-forest hover:bg-forest-deep text-cream inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.9rem] font-medium transition-colors"
          >
            <Plus className="size-4" strokeWidth={2} />
            Add review
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <ul className="border-line/50 bg-cream-warm divide-line/30 divide-y overflow-hidden rounded-2xl border">
          {testimonials.map((t) => (
            <li key={t.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                {t.avatar ? (
                  <Image src={t.avatar} alt="" width={44} height={44} className="size-11 shrink-0 rounded-full object-cover" unoptimized />
                ) : (
                  <span className="bg-forest text-cream flex size-11 shrink-0 items-center justify-center rounded-full font-medium">
                    {t.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-ink font-medium">{t.name}</p>
                    <span className="inline-flex items-center gap-0.5 text-[0.78rem]">
                      <Star className="fill-gold text-gold size-3.5" />
                      {t.rating}
                    </span>
                    {t.course && <span className="text-muted text-[0.78rem]">{t.course}</span>}
                  </div>
                  <p className="text-muted mt-1 line-clamp-2 text-[0.88rem]">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${t.published ? "bg-forest/10 text-forest" : "bg-sand text-ink/70"}`}>
                      {t.published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                      {t.published ? "Published" : "Hidden"}
                    </span>
                    {t.featured && (
                      <span className="bg-gold/15 text-ink inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium">
                        <Home className="size-3" />
                        Home page
                      </span>
                    )}
                    {t.story && <span className="bg-sand text-ink/80 rounded-full px-2 py-0.5 text-[0.7rem] font-medium">Has story</span>}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-5 text-sm">
                <Link href={`/admin/testimonials/${t.id}/edit`} className="text-forest hover:text-forest-deep inline-flex items-center gap-1.5 font-medium">
                  <Edit3 className="size-4" />
                  Edit
                </Link>
                <DeleteButton action={deleteTestimonialAction.bind(null, t.id)} confirmText={`Delete ${t.name}'s review?`} />
              </div>
            </li>
          ))}
          {testimonials.length === 0 && <li className="text-muted px-6 py-12 text-center">No reviews yet.</li>}
        </ul>
      </Reveal>
    </div>
  );
}
