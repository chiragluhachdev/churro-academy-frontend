import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you buy and access a course from Churro Academy.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "17 September 2026";

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Who these terms are between",
    body: (
      <p>
        These terms are between you and Churro Academy (&ldquo;we&rdquo;, &ldquo;us&rdquo;), an online baking
        school founded by Chef Simone Kathuria. By buying a course, you agree to them.
      </p>
    ),
  },
  {
    heading: "2. What you’re buying",
    body: (
      <p>
        Each course is a set of pre-recorded video lessons plus any accompanying material (recipe
        notes, guides). There is no live instruction and no in-app player — once your payment is
        confirmed, your lesson videos and material are sent to the email address and WhatsApp number
        you provided at checkout.
      </p>
    ),
  },
  {
    heading: "3. Price and payment",
    body: (
      <p>
        Prices are shown in Indian Rupees (₹) and are inclusive of GST. Payment is a one-time charge
        per course — there is no subscription. We reserve the right to change a course&rsquo;s price at
        any time; the price you were charged at checkout is the price that applies to your purchase.
      </p>
    ),
  },
  {
    heading: "4. Access and license",
    body: (
      <p>
        Once you&rsquo;ve paid for a course, you get lifetime access to its lesson videos and material for
        your own personal, non-commercial use. You may not re-record, re-upload, redistribute, resell,
        publicly share, or use course content to train any model or service. Video links are personal
        to your purchase — please don&rsquo;t forward them.
      </p>
    ),
  },
  {
    heading: "5. Refunds",
    body: (
      <p>
        Courses come with a 7-day, full refund window from the date of purchase. See our{" "}
        <Link href="/refunds" className="text-forest font-medium hover:underline">
          Refund Policy
        </Link>{" "}
        for how to request one.
      </p>
    ),
  },
  {
    heading: "6. No guaranteed outcome",
    body: (
      <p>
        We teach technique carefully and test every recipe, but baking involves real ingredients,
        ovens and hands — results can vary with equipment, altitude, ingredient brands and practice.
        We don&rsquo;t guarantee a specific result from any course.
      </p>
    ),
  },
  {
    heading: "7. Intellectual property",
    body: (
      <p>
        All course content — video, text, recipes, images and the Churro Academy name and mark — is
        owned by Churro Academy or Chef Simone Kathuria and is protected by copyright. Rights not
        expressly granted here are reserved.
      </p>
    ),
  },
  {
    heading: "8. Acceptable use",
    body: (
      <p>
        You agree not to misuse the site or checkout — for example, by attempting to pay less than the
        listed price, interfering with the site&rsquo;s operation, or using it for anything unlawful.
      </p>
    ),
  },
  {
    heading: "9. Changes to these terms",
    body: (
      <p>
        We may update these terms as the service changes. The date at the top of this page shows when
        it was last revised; continuing to use the site after a change means you accept the update.
      </p>
    ),
  },
  {
    heading: "10. Governing law",
    body: <p>These terms are governed by the laws of India.</p>,
  },
  {
    heading: "11. Contact",
    body: (
      <p>
        Questions about these terms? Reach us through{" "}
        <Link href="/contact" className="text-forest font-medium hover:underline">
          Contact Us
        </Link>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Policies" title="Terms & Conditions." lede={`Last updated ${LAST_UPDATED}.`} />

      <section className="bg-cream">
        <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 lg:py-20">
          <Reveal className="space-y-9">
            {sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display text-ink text-[1.2rem] font-medium">{section.heading}</h2>
                <div className="text-muted mt-2.5 text-[0.92rem] leading-[1.8]">{section.body}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
