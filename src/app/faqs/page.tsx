import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd, faqJsonLd } from "@/lib/seo";
import { whatsappGreeting, whatsappNumber } from "@/data/site";

export const metadata: Metadata = {
  title: "FAQs — Online Baking Courses",
  description:
    "Common questions about Churro Academy's online baking courses: how access works, payment, refunds, equipment and more.",
  alternates: { canonical: "/faqs" },
};

const faqs = [
  {
    question: "What is Churro Academy?",
    answer:
      "Churro Academy is an online baking school. Every course is a structured, step-by-step video series — cakes, churros, French pastry, cheesecakes, breads and more — written, tested and taught by Chef Simone Kathuria.",
  },
  {
    question: "Who teaches the courses?",
    answer:
      "Every course is taught by Chef Simone Kathuria, who founded Churro Academy. She develops each recipe herself and films every lesson.",
  },
  {
    question: "How do I get my videos after I pay?",
    answer:
      "As soon as your payment is confirmed, your lesson videos and course material are emailed to you, and sent on WhatsApp as a backup. There's no app to install and no account to manage — everything lands wherever you already check messages.",
  },
  {
    question: "Is course access really lifetime?",
    answer:
      "Yes. It's a one-time payment with no subscription. Once you've bought a course, the videos are yours to rewatch whenever you like — nothing expires.",
  },
  {
    question: "Do I need any special equipment?",
    answer:
      "No. A standard home oven, mixing bowls, a whisk and a spatula are enough for most courses. Anything extra a specific course needs is listed on that course's page before you buy.",
  },
  {
    question: "Are the courses suitable for complete beginners?",
    answer:
      "Many of them, yes — courses like Cookie Craft, Churros From Scratch and Chocolate Cake Mastery are built to assume no prior baking experience. Each course page states its level (Beginner, Intermediate or Advanced) so you know what you're getting into.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "Cards and UPI are supported at checkout. Payment is processed securely and prices shown already include GST.",
  },
  {
    question: "What's your refund policy?",
    answer:
      "Courses come with a 7-day refund window. If a course isn't for you, get in touch within a week of buying and we'll refund it in full — see our Refund Policy for the details.",
  },
  {
    question: "Do you issue a certificate?",
    answer:
      "Not a formal certificate. The focus of every course is the actual skill — by the end you can bake the thing, not just show a document saying you watched something.",
  },
  {
    question: "How is a course structured?",
    answer:
      "Each course is broken into sections and lessons, so you always know what's coming next and roughly how long it runs. The full breakdown is on each course's own page before you buy.",
  },
  {
    question: "How do I contact Churro Academy?",
    answer: "WhatsApp is the fastest way to reach us, or email hello@churroacademy.com. Either way, a real person answers.",
  },
];

export default function FaqsPage() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappGreeting)}`;

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        eyebrow="Help"
        title="Frequently asked questions."
        lede="Everything students usually want to know before buying an online baking course, in one place. Still stuck? Reach us on WhatsApp."
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <div className="divide-line/70 divide-y">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-5 first:pt-0 last:pb-0">
                  <summary className="text-ink marker:content-none flex cursor-pointer list-none items-start justify-between gap-4 text-[1rem] font-semibold">
                    <span className="flex-1">{faq.question}</span>
                    <span className="text-forest mt-0.5 shrink-0 text-[1.2rem] leading-none transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="text-muted mt-3 text-[0.92rem] leading-[1.75]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-line/70 bg-cream-warm mt-14 rounded-2xl border p-7 text-center sm:p-9">
              <Eyebrow>Still have a question?</Eyebrow>
              <p className="text-ink mt-3 text-[1.1rem] font-medium">
                Message us on WhatsApp and a real person will reply.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-forest text-cream hover:bg-forest-deep group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-[0.9rem] font-medium transition-colors duration-300"
                >
                  Chat on WhatsApp
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link href="/courses" className="text-forest text-[0.9rem] font-medium hover:underline">
                  Browse courses
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
