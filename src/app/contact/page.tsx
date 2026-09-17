import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";

import { InstagramIcon, YoutubeIcon } from "@/components/brand/SocialIcons";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { fetchChef } from "@/lib/api";
import { JsonLd, SITE_URL, absoluteUrl } from "@/lib/seo";
import { whatsappGreeting, whatsappNumber } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Churro Academy — WhatsApp or email us with questions about courses, orders or anything else.",
  alternates: { canonical: "/contact" },
};

const SUPPORT_EMAIL = "hello@churroacademy.com";

export default async function ContactPage() {
  const chef = await fetchChef().catch(() => null);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappGreeting)}`;
  const instagram = chef?.socials.find((s) => s.icon === "instagram" && /^https?:\/\//.test(s.href))?.href;
  const youtube = chef?.socials.find((s) => s.icon === "youtube" && /^https?:\/\//.test(s.href))?.href;

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: absoluteUrl("/contact"),
    about: { "@id": `${SITE_URL}/#organization` },
    mainEntity: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: "+91-8130809374",
          email: SUPPORT_EMAIL,
          availableLanguage: ["English", "Hindi"],
        },
      ],
    },
  };

  return (
    <>
      <JsonLd data={contactPageJsonLd} />
      <PageHeader
        eyebrow="Get in Touch"
        title="Questions about a course? Ask a real person."
        lede="No ticket system, no chatbot loop. WhatsApp or email reaches Chef Simone Kathuria's team directly."
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            <Reveal className="border-line/70 bg-cream-warm rounded-2xl border p-7 sm:p-8">
              <span className="bg-forest text-cream flex size-11 items-center justify-center rounded-full">
                <MessageCircle className="size-5" strokeWidth={1.6} />
              </span>
              <h2 className="text-ink mt-5 text-[1.15rem] font-semibold">WhatsApp</h2>
              <p className="text-muted mt-2 text-[0.9rem] leading-[1.7]">
                The fastest way to reach us — for course questions, order help or anything else.
              </p>
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="text-forest group mt-5 inline-flex items-center gap-1.5 text-[0.9rem] font-medium"
              >
                Chat on WhatsApp
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>

            <Reveal delay={0.08} className="border-line/70 bg-cream-warm rounded-2xl border p-7 sm:p-8">
              <span className="bg-forest text-cream flex size-11 items-center justify-center rounded-full">
                <Mail className="size-5" strokeWidth={1.6} />
              </span>
              <h2 className="text-ink mt-5 text-[1.15rem] font-semibold">Email</h2>
              <p className="text-muted mt-2 text-[0.9rem] leading-[1.7]">
                For anything in writing — refund requests, invoices, or a question that needs detail.
              </p>
              <Link
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-forest group mt-5 inline-flex items-center gap-1.5 text-[0.9rem] font-medium"
              >
                {SUPPORT_EMAIL}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          {(instagram || youtube) && (
            <Reveal delay={0.14} className="mt-6">
              <p className="text-muted text-[0.85rem]">Or follow along for recipes and behind-the-scenes:</p>
              <ul className="mt-3 flex items-center gap-3">
                {instagram && (
                  <li>
                    <Link
                      href={instagram}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Churro Academy on Instagram"
                      className="border-line/70 text-forest hover:bg-forest/5 flex size-10 items-center justify-center rounded-full border transition-colors"
                    >
                      <InstagramIcon className="size-4" />
                    </Link>
                  </li>
                )}
                {youtube && (
                  <li>
                    <Link
                      href={youtube}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Churro Academy on YouTube"
                      className="border-line/70 text-forest hover:bg-forest/5 flex size-10 items-center justify-center rounded-full border transition-colors"
                    >
                      <YoutubeIcon className="size-4" />
                    </Link>
                  </li>
                )}
              </ul>
            </Reveal>
          )}

          <Reveal delay={0.2} className="mt-10 text-[0.88rem]">
            <p className="text-muted">
              Looking for quick answers instead? Check the{" "}
              <Link href="/faqs" className="text-forest font-medium hover:underline">
                FAQs
              </Link>{" "}
              — payment, refunds, equipment and access are all covered there.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
