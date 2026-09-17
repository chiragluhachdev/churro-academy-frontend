import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Churro Academy's refund policy — a 7-day, no-questions-asked refund window on every course.",
  alternates: { canonical: "/refunds" },
  robots: { index: true, follow: true },
};

export default function RefundsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Policies"
        title="Refund Policy."
        lede="Simple, on purpose: 7 days, full refund, no interrogation."
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 lg:py-20">
          <Reveal className="space-y-10">
            <div>
              <h2 className="font-display text-ink text-[1.3rem] font-medium">The 7-day window</h2>
              <p className="text-muted mt-3 text-[0.95rem] leading-[1.8]">
                If a course isn&rsquo;t right for you, tell us within 7 days of your purchase date and
                we&rsquo;ll refund it in full — no partial refunds, no reason required. After 7 days, the
                purchase is final, since by then you&rsquo;ve typically had time to work through most of the
                course.
              </p>
            </div>

            <div>
              <h2 className="font-display text-ink text-[1.3rem] font-medium">How to request one</h2>
              <p className="text-muted mt-3 text-[0.95rem] leading-[1.8]">
                Email{" "}
                <Link href="mailto:hello@churroacademy.com" className="text-forest font-medium hover:underline">
                  hello@churroacademy.com
                </Link>{" "}
                or message us on WhatsApp with the email address you used to buy the course and, if you
                have it, your invoice number. We&rsquo;ll confirm the refund by reply.
              </p>
            </div>

            <div>
              <h2 className="font-display text-ink text-[1.3rem] font-medium">What happens next</h2>
              <p className="text-muted mt-3 text-[0.95rem] leading-[1.8]">
                Once a refund is approved, the amount is returned to your original payment method. Banks
                and payment providers typically take 5–7 business days to show it, occasionally longer
                depending on your bank.
              </p>
            </div>

            <div>
              <h2 className="font-display text-ink text-[1.3rem] font-medium">Questions</h2>
              <p className="text-muted mt-3 text-[0.95rem] leading-[1.8]">
                This policy is also referenced in our{" "}
                <Link href="/terms" className="text-forest font-medium hover:underline">
                  Terms &amp; Conditions
                </Link>
                . For anything not covered here, reach out through{" "}
                <Link href="/contact" className="text-forest font-medium hover:underline">
                  Contact Us
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
