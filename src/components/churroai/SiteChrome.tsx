import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Brand } from "@/components/churroai/Brand";
import { buttonBase, buttonSizes, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/format";

/** Slim Churro AI header for the policy and contact pages. */
export function SiteHeader() {
  return (
    <header className="border-line/60 bg-cream/85 fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" aria-label="Churro AI home">
          <Brand />
        </Link>
        <Link href="/calculator" className={cn(buttonBase, buttonVariants.primary, buttonSizes.sm, "group")}>
          Try it free
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-line/60 border-t print:hidden">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <Brand />
          <p className="text-muted mt-2 text-[0.8rem]">A product of Churro Academy</p>
        </div>
        <nav aria-label="Policies" className="text-ink/70 flex flex-wrap gap-x-6 gap-y-2 text-[0.85rem]">
          <Link href="/" className="hover:text-forest">Home</Link>
          <Link href="/terms" className="hover:text-forest">Terms</Link>
          <Link href="/privacy" className="hover:text-forest">Privacy</Link>
          <Link href="/refunds" className="hover:text-forest">Refunds</Link>
          <Link href="/contact" className="hover:text-forest">Contact</Link>
        </nav>
        <p className="text-muted text-[0.78rem]">© {new Date().getFullYear()} Churro Academy</p>
      </div>
    </footer>
  );
}
