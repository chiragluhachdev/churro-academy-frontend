import Link from "next/link";
import { Mail } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { InstagramIcon, YoutubeIcon } from "@/components/brand/SocialIcons";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { footerNav } from "@/data/site";

const socials = [
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "YouTube", href: "#", Icon: YoutubeIcon },
  { label: "Email", href: "mailto:hello@churroacademy.com", Icon: Mail },
];

export function Footer() {
  return (
    <footer className="bg-forest-dark text-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14 lg:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.5fr] lg:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <Logo tone="cream" />
            <p className="mt-5 text-[0.88rem] font-medium lg:mt-6">Learn. Bake. Inspire.</p>
            <p className="text-cream/65 mt-3 max-w-xs text-[0.85rem] leading-[1.7]">
              Empowering bakers everywhere to create, grow and inspire through the art of
              baking.
            </p>
            <ul className="mt-5 flex items-center gap-3 lg:mt-7">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    aria-label={label}
                    className="border-cream/20 text-cream hover:bg-cream hover:text-forest-dark flex size-9 items-center justify-center rounded-full border transition-colors duration-300"
                  >
                    <Icon className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Three-up on phones so no half-row is left empty; `lg:contents`
              dissolves this wrapper so each nav becomes its own desktop column. */}
          <div className="col-span-2 grid grid-cols-3 gap-x-4 lg:contents">
            {footerNav.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className="text-[0.85rem] font-semibold lg:text-[0.92rem]">
                  {group.heading}
                </h2>
                <ul className="mt-3.5 space-y-2.5 lg:mt-5 lg:space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-cream/65 hover:text-cream text-[0.78rem] transition-colors lg:text-[0.85rem]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h2 className="text-[0.92rem] font-semibold">Newsletter</h2>
            <p className="text-cream/65 mt-4 text-[0.85rem] leading-[1.7]">
              Get baking tips, recipes and exclusive updates.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-cream/15 mt-10 border-t pt-6 lg:mt-14 lg:pt-7">
          <p className="text-cream/55 text-center text-[0.8rem]">
            © {new Date().getFullYear()} Churro Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
