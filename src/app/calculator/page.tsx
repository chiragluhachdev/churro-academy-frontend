import type { Metadata } from "next";
import { Calculator, Download, Printer, Scale, TrendingUp } from "lucide-react";

import { CostCalculator } from "@/components/calculator/CostCalculator";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { fetchSiteSettings } from "@/lib/api";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Recipe Costing Calculator",
  description:
    "Free recipe costing calculator for home bakers and small bakeries — work out ingredient cost, wastage, packaging and labour, then find the right selling price for your target profit margin.",
  alternates: { canonical: "/calculator" },
};

const FEATURES = [
  { label: "Ingredient Costing", icon: Calculator },
  { label: "Recipe Scaling", icon: Scale },
  { label: "Profit & Margin", icon: TrendingUp },
  { label: "Printable Sheet", icon: Printer },
  { label: "Export to CSV", icon: Download },
];

export default async function CalculatorPage() {
  const [site, session] = await Promise.all([
    fetchSiteSettings().catch(() => undefined),
    getSession(),
  ]);
  // Locked by default — a signed-in admin can still preview it before unlocking.
  const unlocked = Boolean(site?.calculatorEnabled) || Boolean(session?.user);

  if (!unlocked) {
    return (
      <section className="bg-cream flex min-h-screen items-center justify-center px-5 py-28">
        <Reveal className="max-w-md text-center">
          <Eyebrow>Free Tool</Eyebrow>
          <h1 className="font-display text-ink mt-4 text-[1.9rem] leading-[1.15] font-medium tracking-[-0.015em] sm:text-[2.3rem]">
            Not available yet
          </h1>
          <p className="text-muted mt-4 text-[0.95rem] leading-[1.75]">
            The recipe costing calculator is coming soon — check back shortly.
          </p>
        </Reveal>
      </section>
    );
  }

  return (
    <>
      <section className="bg-cream-warm border-line/60 border-b">
        <div className="mx-auto max-w-[1400px] px-5 pt-28 pb-9 sm:px-8 sm:pt-32 sm:pb-12 lg:pt-40 lg:pb-16">
          <Reveal className="max-w-3xl">
            <Eyebrow>Free Tool</Eyebrow>
            <h1 className="font-display text-ink mt-4 text-[2.1rem] leading-[1.08] font-medium tracking-[-0.015em] text-balance sm:mt-5 sm:text-[3.1rem]">
              Recipe Costing Calculator
            </h1>
            <p className="text-muted mt-4 max-w-2xl text-[0.95rem] leading-[1.75] sm:mt-6 sm:text-[1.05rem]">
              Work out exactly what a batch costs you to make — ingredients, wastage, packaging and
              labour — then find the right selling price for the profit margin you want.
            </p>
          </Reveal>

          <Reveal delay={0.08} className="mt-7 flex flex-wrap gap-2.5 sm:mt-9">
            {FEATURES.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="bg-forest/8 text-forest inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.78rem] font-medium"
              >
                <Icon className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                {label}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <CostCalculator />
    </>
  );
}
