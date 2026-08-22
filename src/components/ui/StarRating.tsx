import { Star } from "lucide-react";

import { cn } from "@/lib/format";

interface StarRatingProps {
  /** 0–5; halves are rounded to the nearest whole star for the glyph fill. */
  rating: number;
  className?: string;
  starClassName?: string;
}

export function StarRating({ rating, className, starClassName }: StarRatingProps) {
  const filled = Math.round(rating);

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            "size-3.5",
            index < filled ? "fill-gold text-gold" : "text-line fill-line",
            starClassName,
          )}
        />
      ))}
    </span>
  );
}
