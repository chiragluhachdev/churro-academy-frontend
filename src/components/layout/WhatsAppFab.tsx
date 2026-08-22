import { MessageCircle } from "lucide-react";

import { whatsappGreeting, whatsappNumber } from "@/data/site";

/**
 * Floating contact button for the public site. It opens WhatsApp, but wears a
 * neutral chat bubble rather than the WhatsApp glyph so it reads as "talk to
 * us" and sits inside the brand palette instead of fighting it.
 *
 * The dashboard has its own equivalent (SupportFab); this one is mounted inside
 * ChromeGate, so the two never appear together.
 */
export function WhatsAppFab() {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappGreeting)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed right-5 bottom-5 z-40 flex items-center gap-3 sm:right-8 sm:bottom-8"
    >
      {/* Label reveals on hover and on keyboard focus; never shown on phones,
          where there is no hover and the space is tight. */}
      <span className="bg-forest text-cream pointer-events-none hidden translate-x-3 rounded-full px-4 py-2.5 text-[0.82rem] font-medium whitespace-nowrap opacity-0 shadow-[0_10px_28px_-14px_rgba(41,75,50,0.85)] transition-[opacity,transform] duration-300 ease-[var(--ease-editorial)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block">
        Chat with us
      </span>

      <span className="relative flex size-14 shrink-0 items-center justify-center">
        {/* Slow halo, suppressed for anyone who prefers reduced motion. */}
        <span
          aria-hidden="true"
          className="bg-forest/25 absolute inset-0 rounded-full motion-safe:animate-ping"
          style={{ animationDuration: "2.8s" }}
        />
        <span className="bg-forest text-cream relative flex size-14 items-center justify-center rounded-full shadow-[0_14px_30px_-12px_rgba(41,75,50,0.8)] transition-transform duration-300 ease-[var(--ease-editorial)] group-hover:scale-105 group-active:scale-95">
          <MessageCircle className="size-6" strokeWidth={1.7} aria-hidden="true" />
          <span
            aria-hidden="true"
            className="border-cream absolute top-1 right-1 size-3 rounded-full border-2 bg-emerald-400"
          />
        </span>
      </span>
    </a>
  );
}
