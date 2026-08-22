import { ArrowRight } from "lucide-react";

import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="bg-forest-deep text-cream relative overflow-hidden">
      {/* Oversized monogram, bled off the right edge as texture. */}
      <Image
        src="/logo-mark.png"
        alt=""
        width={512}
        height={512}
        className="pointer-events-none absolute -right-16 -bottom-24 h-[26rem] w-auto rotate-[12deg] opacity-[0.07]"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
        <Reveal className="border-cream/20 flex flex-col items-start gap-8 rounded-3xl border px-7 py-10 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex items-center gap-6">
            <span className="border-cream/25 hidden size-20 shrink-0 items-center justify-center rounded-full border sm:flex">
              <Image src="/logo-mark.png" alt="" width={512} height={512} className="size-11" />
            </span>
            <div>
              <h2 className="font-display text-[1.9rem] leading-[1.15] font-medium tracking-[-0.01em] text-balance sm:text-[2.35rem]">
                Ready to Bake Something Amazing?
              </h2>
              <p className="text-cream/70 mt-3 max-w-lg leading-[1.7]">
                Join thousands of home bakers who turned their passion into irresistible
                creations.
              </p>
            </div>
          </div>

          <ButtonLink href="/courses" variant="cream" className="shrink-0">
            Explore Courses
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
