import Image from "next/image";
import { Quote } from "lucide-react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { StarRating } from "@/components/ui/StarRating";
import { fetchTestimonialsForCourse } from "@/lib/api";

export async function CourseReviews({ courseTitle }: { courseTitle: string }) {
  const reviews = await fetchTestimonialsForCourse(courseTitle);
  // No reviews yet: leave the section out rather than show an empty heading.
  if (reviews.length === 0) return null;

  return (
    <section>
      <Reveal>
        <Eyebrow>Student Reviews</Eyebrow>
        <h2 className="font-display text-ink mt-3 text-[1.65rem] leading-[1.15] font-medium tracking-[-0.01em] sm:text-[1.9rem]">
          What Students Say
        </h2>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {reviews.map((review) => (
            <figure
              key={review.id}
              className="border-line/80 bg-cream-warm/60 rounded-2xl border p-6"
            >
              <Quote
                className="text-forest/25 size-5 shrink-0"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <blockquote className="text-ink mt-3 text-[0.9rem] leading-[1.7]">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="border-line/70 mt-5 flex items-center gap-3 border-t pt-4">
                <Image
                  src={review.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover"
                />
                <span className="min-w-0">
                  <span className="text-ink block text-[0.85rem] font-semibold">
                    {review.name}
                  </span>
                  <StarRating rating={review.rating} className="mt-0.5" />
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
