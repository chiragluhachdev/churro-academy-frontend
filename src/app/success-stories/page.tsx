import type { Metadata } from "next";
import Image from "next/image";
import { Quote } from "lucide-react";

import { FinalCta } from "@/components/sections/FinalCta";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { StarRating } from "@/components/ui/StarRating";
import { fetchTestimonials } from "@/lib/api";

export const metadata: Metadata = {
  title: "Student Success Stories",
  description:
    "Bakers who took a Churro Academy online baking course and what changed for them afterwards.",
  alternates: { canonical: "/success-stories" },
};

export default async function SuccessStoriesPage() {
  const testimonials = await fetchTestimonials();
  const stories = testimonials.filter((testimonial) => testimonial.story);
  const shortOnes = testimonials.filter((testimonial) => !testimonial.story);

  return (
    <>
      <PageHeader
        eyebrow="Student Success Stories"
        title="Loved by 20,000+ bakers."
        lede="Not ratings out of context — what people were stuck on, and what actually unstuck them."
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
          <ul className="grid gap-8 lg:grid-cols-2">
            {stories.map((story, index) => (
              <Reveal
                as="li"
                key={story.id}
                delay={(index % 2) * 0.08}
                className="border-line/80 bg-cream-warm/60 flex flex-col rounded-2xl border p-7 sm:p-9"
              >
                <Quote
                  className="text-forest/25 size-7 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <blockquote className="mt-5">
                  <p className="font-display text-ink text-[1.35rem] leading-[1.45] font-medium text-balance">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                  <p className="text-muted mt-4 leading-[1.8]">{story.story}</p>
                </blockquote>

                <figcaption className="border-line/70 mt-7 flex items-center gap-4 border-t pt-6">
                  <Image
                    src={story.avatar}
                    alt=""
                    width={52}
                    height={52}
                    className="size-13 rounded-full object-cover"
                  />
                  <span className="min-w-0">
                    <span className="text-ink block text-[0.92rem] font-semibold">
                      {story.name}
                      {story.location && (
                        <span className="text-muted font-normal"> · {story.location}</span>
                      )}
                    </span>
                    <StarRating rating={story.rating} className="mt-1.5" />
                    {story.course && (
                      <span className="text-muted mt-1.5 block text-[0.78rem]">
                        {story.course}
                      </span>
                    )}
                  </span>
                </figcaption>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-cream-warm">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <h2 className="font-display text-ink text-[1.9rem] leading-[1.15] font-medium sm:text-[2.3rem]">
              And plenty more, briefly
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {shortOnes.map((testimonial, index) => (
              <Reveal
                as="li"
                key={testimonial.id}
                delay={(index % 4) * 0.06}
                className="border-line/80 bg-cream flex h-full flex-col rounded-2xl border p-6"
              >
                <blockquote className="text-ink flex-1 text-[0.92rem] leading-[1.7]">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="border-line/70 mt-5 flex items-center gap-3 border-t pt-5">
                  <Image
                    src={testimonial.avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                  <span className="min-w-0">
                    <span className="text-ink block truncate text-[0.85rem] font-semibold">
                      {testimonial.name}
                    </span>
                    <StarRating rating={testimonial.rating} className="mt-1" />
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
