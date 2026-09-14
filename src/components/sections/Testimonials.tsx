import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { StarRating } from "@/components/ui/StarRating";
import { fetchFeaturedTestimonials, fetchTestimonials } from "@/lib/api";

export async function Testimonials() {
  // Admin picks which reviews appear here; if none are flagged, fall back to the
  // first few published ones so the section is never empty.
  const featured = await fetchFeaturedTestimonials();
  const testimonials = featured.length > 0 ? featured : (await fetchTestimonials()).slice(0, 4);
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-[1400px] px-5 pb-12 sm:px-8 sm:pb-20 lg:pb-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Student Success Stories</Eyebrow>
            <h2 className="font-display text-ink mt-4 text-[2.1rem] leading-[1.15] font-medium tracking-[-0.01em] sm:text-[2.6rem]">
              Loved by 20,000+ Bakers
            </h2>
          </div>
          <Link
            href="/success-stories"
            className="group text-forest inline-flex items-center gap-2 text-[0.9rem] font-medium"
          >
            View All Reviews
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="mt-11">
          <Rail label="Student testimonials">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.id}
                className="border-line/80 bg-cream-warm/60 flex w-[82vw] shrink-0 snap-start flex-col rounded-2xl border p-6 sm:w-[46%] lg:w-[calc((100%-4.5rem)/4)]"
              >
                <Quote
                  className="text-forest/25 size-6 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <blockquote className="text-ink mt-4 flex-1 text-[0.92rem] leading-[1.7]">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <figcaption className="border-line/70 mt-6 flex items-center gap-3 border-t pt-5">
                  <Image
                    src={testimonial.avatar}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 rounded-full object-cover"
                  />
                  <span className="min-w-0">
                    <span className="text-ink block text-[0.88rem] font-semibold">
                      {testimonial.name}
                    </span>
                    <StarRating rating={testimonial.rating} className="mt-1" />
                    {testimonial.course && (
                      <span className="text-muted mt-1.5 block truncate text-[0.75rem]">
                        {testimonial.course}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            ))}
          </Rail>
        </Reveal>
      </div>
    </section>
  );
}
