import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Churro Academy collects when you buy a course, how it's used, and how to reach us about it.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "17 September 2026";

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "What we collect",
    body: (
      <p>
        Buying a course doesn&rsquo;t require an account — we only collect what checkout needs: your
        name, email address, WhatsApp number, and the course and amount you paid. If you message us on
        WhatsApp or email, we keep that conversation to help you.
      </p>
    ),
  },
  {
    heading: "How we use it",
    body: (
      <ul className="mt-1 list-disc space-y-1.5 pl-5">
        <li>To process your payment and confirm your order.</li>
        <li>To email and WhatsApp you the lesson videos and material for the course you bought.</li>
        <li>To send you your invoice and respond if you contact support.</li>
        <li>To improve the courses and site — we don&rsquo;t sell your data, ever.</li>
      </ul>
    ),
  },
  {
    heading: "Who we share it with",
    body: (
      <p>
        We use a small number of service providers to run the site, each only with the data they need
        to do their job: a payment processor to handle checkout, an email provider to send your
        enrollment email, and cloud hosting and database providers to run the site and store orders.
        None of them are permitted to use your data for their own purposes.
      </p>
    ),
  },
  {
    heading: "Cookies",
    body: (
      <p>
        The public site sets no tracking or advertising cookies. A session cookie is used only for the
        admin dashboard sign-in, which visitors never see. If that changes — for example, if we add
        analytics — this policy will be updated first.
      </p>
    ),
  },
  {
    heading: "How long we keep it",
    body: (
      <p>
        Order and payment records are kept as long as needed for accounting, invoicing and legal
        requirements. You can ask us to delete personal details not required for those purposes at any
        time — see Contact below.
      </p>
    ),
  },
  {
    heading: "Your rights",
    body: (
      <p>
        You can ask what personal data we hold about you, ask us to correct it, or ask us to delete it,
        by emailing{" "}
        <Link href="mailto:hello@churroacademy.com" className="text-forest font-medium hover:underline">
          hello@churroacademy.com
        </Link>
        . We&rsquo;ll respond within a reasonable time.
      </p>
    ),
  },
  {
    heading: "Children",
    body: (
      <p>
        Churro Academy isn&rsquo;t directed at children, and checkout is not intended to be used by anyone
        under 18.
      </p>
    ),
  },
  {
    heading: "Changes to this policy",
    body: (
      <p>
        If this policy changes materially, we&rsquo;ll update the date above. Continuing to use the site
        after a change means you accept the update.
      </p>
    ),
  },
  {
    heading: "Contact",
    body: (
      <p>
        Questions about your data? Reach us through{" "}
        <Link href="/contact" className="text-forest font-medium hover:underline">
          Contact Us
        </Link>
        .
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Policies" title="Privacy Policy." lede={`Last updated ${LAST_UPDATED}.`} />

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
