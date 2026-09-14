import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import type { ReactNode } from "react";

const promises = [
  "Manage courses and the public site",
  "See every order and its invoice",
  "Everything configurable, no deploy needed",
];

interface AuthShellProps {
  title: string;
  lede: string;
  children: ReactNode;
  /** Shown under the form, if there's anything to add. */
  footer?: ReactNode;
}

/**
 * Split layout for the admin sign-in screen: form on the cream side, brand
 * panel on the forest side. The panel is hidden below `lg`, where the form
 * takes over.
 */
export function AuthShell({ title, lede, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[52fr_48fr]">
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="text-muted hover:text-forest group inline-flex items-center gap-2 self-start text-[0.85rem] transition-colors"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to site
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[26rem]">
            <Link href="/" aria-label="Churro Academy — home" className="inline-flex">
              <Image
                src="/logo.png"
                alt=""
                width={512}
                height={512}
                className="size-12 rounded-full object-cover"
              />
            </Link>

            <h1 className="font-display text-ink mt-8 text-[2rem] leading-[1.15] font-medium tracking-[-0.015em]">
              {title}
            </h1>
            <p className="text-muted mt-3 text-[0.95rem] leading-[1.7]">{lede}</p>

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-8">{footer}</div>}
          </div>
        </div>
      </div>

      {/* Brand panel — decorative, so it is hidden from assistive tech. */}
      <aside
        aria-hidden="true"
        className="bg-forest-deep text-cream relative hidden overflow-hidden lg:block"
      >
        <Image
          src="/logo-mark.png"
          alt=""
          width={512}
          height={512}
          className="pointer-events-none absolute -right-20 -bottom-24 h-[30rem] w-auto rotate-[12deg] opacity-[0.06]"
        />

        <div className="relative flex h-full flex-col justify-between p-14">
          <p className="font-script text-cream/80 text-4xl leading-tight">
            Bake.
            <br />
            Create.
            <br />
            Inspire.
          </p>

          <div>
            <p className="font-display text-[2.1rem] leading-[1.2] font-medium text-balance">
              The kitchen behind the kitchen.
            </p>
            <ul className="mt-9 space-y-4">
              {promises.map((promise) => (
                <li key={promise} className="flex items-start gap-3.5">
                  <span className="border-cream/25 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border">
                    <Check className="size-3.5" strokeWidth={2.2} />
                  </span>
                  <span className="text-cream/75 text-[0.92rem] leading-[1.6]">
                    {promise}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-cream/50 text-[0.8rem]">
            © {new Date().getFullYear()} Churro Academy
          </p>
        </div>
      </aside>
    </div>
  );
}
