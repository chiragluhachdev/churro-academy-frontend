import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { instructor } from "@/data/chefs";

export function CourseInstructor() {
  return (
    <section>
      <Reveal>
        <Eyebrow>Your Instructor</Eyebrow>
        <div className="border-line/70 bg-cream-warm mt-5 flex flex-col items-start gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:gap-7">
          <Image
            src={instructor.portrait}
            alt={`${instructor.name}, ${instructor.title}`}
            placeholder="blur"
            width={96}
            height={96}
            sizes="96px"
            className="size-24 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-ink text-[1.3rem] font-medium">
              {instructor.name}
            </h3>
            <p className="text-muted mt-0.5 text-[0.82rem]">{instructor.title}</p>
            <p className="text-muted mt-3 text-[0.88rem] leading-[1.7]">
              {instructor.bio}
            </p>
            <Link
              href="/#instructor"
              className="group text-forest mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-medium"
            >
              Learn more about {instructor.name}
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
