import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/format";

interface LogoProps {
  /** `cream` is for use on the dark forest sections (footer). */
  tone?: "forest" | "cream";
  className?: string;
}

export function Logo({ tone = "forest", className }: LogoProps) {
  const onDark = tone === "cream";

  return (
    <Link
      href="/"
      aria-label="Churro Academy — home"
      className={cn(
        "group inline-flex items-center gap-3 transition-opacity hover:opacity-90",
        onDark ? "text-cream" : "text-forest",
        className,
      )}
    >
      {/*
        Two assets from the same mark: the green tile reads as a badge on the
        cream pages, but would sink into the dark footer, so that gets the
        cream monogram on transparency instead.
      */}
      <Image
        src={onDark ? "/logo-mark.png" : "/logo.png"}
        alt=""
        width={512}
        height={512}
        priority
        className={cn("size-9 shrink-0", !onDark && "rounded-full object-cover")}
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.35rem] leading-none font-semibold tracking-[0.05em]">
          CHURRO
        </span>
        <span className="mt-1 text-[0.6rem] leading-none font-medium tracking-[0.24em]">
          ACADEMY
        </span>
      </span>
    </Link>
  );
}
