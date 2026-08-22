import type { Metadata } from "next";
import Image from "next/image";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { StarRating } from "@/components/ui/StarRating";
import { testimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Every review left by Churro Academy students, with the rating breakdown behind the average.",
};

export default function ReviewsPage() {
  const total = testimonials.length;
  const average =
    testimonials.reduce((sum, review) => sum + review.rating, 0) / total;

  // Highest rating first so the distribution bar reads top-down.
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = testimonials.filter((review) => review.rating === stars).length;
    return { stars, count, percent: total === 0 ? 0 : (count / total) * 100 };
  });

  return (
    <>
      <PageHeader
        eyebrow="Reviews"
        title="What students actually said."
        lede="Every review, unfiltered, with the full rating breakdown rather than just the headline average."
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[30fr_70fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <div className="border-line/80 bg-cream-warm rounded-2xl border p-8">
                <p className="font-display text-ink text-[3.5rem] leading-none font-medium">
                  {average.toFixed(1)}
                </p>
                <StarRating rating={average} className="mt-3" />
                <p className="text-muted mt-3 text-[0.85rem]">
                  Based on {total} reviews
                </p>

                <ul className="mt-8 space-y-3">
                  {distribution.map(({ stars, count, percent }) => (
                    <li key={stars} className="flex items-center gap-3">
                      <span className="text-muted w-10 shrink-0 text-[0.78rem]">
                        {stars} star
                      </span>
                      <span
                        className="bg-line/70 h-1.5 flex-1 overflow-hidden rounded-full"
                        role="img"
                        aria-label={`${count} of ${total} reviews gave ${stars} stars`}
                      >
                        <span
                          className="bg-gold block h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                      <span className="text-muted w-6 shrink-0 text-right text-[0.78rem]">
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <Eyebrow>All Reviews</Eyebrow>
              </Reveal>
              <ul className="divide-line/70 mt-6 divide-y">
                {testimonials.map((review, index) => (
                  <Reveal
                    as="li"
                    key={review.id}
                    delay={(index % 6) * 0.04}
                    className="py-7 first:pt-0"
                  >
                    <div className="flex items-start gap-4">
                      <Image
                        src={review.avatar}
                        alt=""
                        width={44}
                        height={44}
                        className="size-11 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="text-ink text-[0.92rem] font-semibold">
                            {review.name}
                          </p>
                          {review.location && (
                            <p className="text-muted text-[0.78rem]">{review.location}</p>
                          )}
                          <StarRating rating={review.rating} />
                        </div>
                        {review.course && (
                          <p className="text-forest mt-1.5 text-[0.78rem] font-medium">
                            {review.course}
                          </p>
                        )}
                        <p className="text-ink mt-3 leading-[1.75]">
                          &ldquo;{review.quote}&rdquo;
                        </p>
                        {review.story && (
                          <p className="text-muted mt-3 text-[0.9rem] leading-[1.75]">
                            {review.story}
                          </p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
