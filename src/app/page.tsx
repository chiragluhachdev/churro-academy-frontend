import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { FeaturedCourses } from "@/components/sections/FeaturedCourses";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Instructor } from "@/components/sections/Instructor";
import { Testimonials } from "@/components/sections/Testimonials";
import { WhatIs } from "@/components/sections/WhatIs";
import { WhyLearn } from "@/components/sections/WhyLearn";

/**
 * Source order is the phone order — courses come first, then the explainer,
 * and "Why Learn With Us" is dropped entirely (its four benefits largely repeat
 * the What Is pillars, which stay). `lg:order-*` restores the desktop sequence
 * without rendering any section twice.
 */
export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="flex flex-col">
      <div className="lg:order-1">
        <Hero />
      </div>
      <div className="lg:order-3">
        <FeaturedCourses />
      </div>
      <div className="lg:order-2">
        <WhatIs />
      </div>
      <div className="hidden lg:order-4 lg:block">
        <WhyLearn />
      </div>
      <div className="lg:order-5">
        <Instructor />
      </div>
      <div className="lg:order-6">
        <Testimonials />
      </div>
      <div className="lg:order-7">
        <FinalCta />
      </div>
    </div>
  );
}
