import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { fetchSiteSettings } from "@/lib/api";
import { whatsappGreeting, whatsappNumber } from "@/data/site";

export const metadata: Metadata = {
  title: "We'll Be Back Soon",
  robots: { index: false, follow: false },
};

const DEFAULT_MESSAGE = "We're making a few updates behind the scenes. Check back shortly.";

/**
 * Swapped in for every public page by the proxy when maintenance mode is on
 * (except for the admin, who stays signed in and can see the real site to
 * turn it back off). Not linked anywhere — only ever reached via the rewrite.
 */
export default async function MaintenancePage() {
  const site = await fetchSiteSettings().catch(() => null);
  const message = site?.maintenanceMessage || DEFAULT_MESSAGE;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappGreeting)}`;

  return (
    <section className="bg-cream flex min-h-screen items-center justify-center px-5 py-28">
      <Reveal className="max-w-lg text-center">
        <div className="flex justify-center">
          <Logo href="/" />
        </div>
        <h1 className="font-display text-ink mt-8 text-[2rem] leading-[1.15] font-medium tracking-[-0.015em] sm:text-[2.6rem]">
          We&rsquo;ll be back soon
        </h1>
        <p className="text-muted mt-5 text-[1rem] leading-[1.75]">{message}</p>
        <Link
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="bg-forest text-cream hover:bg-forest-deep mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.9rem] font-medium transition-colors"
        >
          <MessageCircle className="size-4" />
          Message us on WhatsApp
        </Link>
      </Reveal>
    </section>
  );
}
