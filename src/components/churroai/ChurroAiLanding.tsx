"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  Layers,
  MessageCircle,
  Percent,
  Plus,
  Printer,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Sparkle4 } from "@/components/brand/Sparkle";
import { Brand } from "@/components/churroai/Brand";
import { LiveDemo } from "@/components/churroai/LiveDemo";
import { formatTrialLength, passLength } from "@/lib/churroaiShared";
import { buttonBase, buttonSizes, buttonVariants } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { cn, formatPrice } from "@/lib/format";

/** Set in Admin → Churro AI. */
export interface Pricing {
  passName: string;
  passPrice: number;
  passDays: number;
  trialMinutes: number;
}

/** `live` = the calculator is switched on; `label` fits the visitor ("Try it free" / "Open Recipe Calculator"). */
export type Cta = { live: boolean; label: string; earlyAccessHref: string };

interface Props {
  cta: Cta;
  pricing: Pricing;
  signedIn: boolean;
  academyUrl: string;
}

const NAV = [
  { label: "Tools", href: "#tools" },
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function ChurroAiLanding({ cta, pricing, signedIn, academyUrl }: Props) {
  return (
    <div id="top" className="bg-cream text-ink relative overflow-x-clip">
      <Header cta={cta} signedIn={signedIn} />
      <Hero cta={cta} />
      <Suite cta={cta} />
      <HowItWorks />
      <Features />
      <PricingSection cta={cta} pricing={pricing} />
      <Faq pricing={pricing} />
      <FinalCta cta={cta} />
      <Footer academyUrl={academyUrl} earlyAccessHref={cta.earlyAccessHref} />
    </div>
  );
}

/* ------------------------------------------------------------------ CTA -- */

function PrimaryCta({
  cta,
  size = "md",
  tone = "forest",
  className,
}: {
  cta: Cta;
  size?: "sm" | "md";
  tone?: "forest" | "cream";
  className?: string;
}) {
  const cls = cn(
    buttonBase,
    tone === "cream" ? buttonVariants.cream : buttonVariants.primary,
    buttonSizes[size],
    "group",
    className,
  );
  const arrow = <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />;

  if (cta.live) {
    return (
      <Link href="/churroai/calculator" className={cls}>
        {cta.label}
        {arrow}
      </Link>
    );
  }
  return (
    <a href={cta.earlyAccessHref} target="_blank" rel="noreferrer" className={cls}>
      Get early access
      {arrow}
    </a>
  );
}

/* --------------------------------------------------------------- header -- */

function Header({ cta, signedIn }: { cta: Cta; signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500 print:hidden",
        scrolled ? "bg-cream/80 shadow-[0_1px_0_0_rgba(41,75,50,0.08)] backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <a href="#top" aria-label="Churro AI — top of page">
          <Brand />
        </a>
        <nav aria-label="Churro AI" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="text-ink/70 hover:text-forest text-[0.88rem] transition-colors">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {cta.live && !signedIn && (
            <Link href="/churroai/login" className="text-ink/70 hover:text-forest hidden text-[0.88rem] transition-colors sm:inline">
              Log in
            </Link>
          )}
          <PrimaryCta cta={cta} size="sm" />
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------- hero -- */

function Hero({ cta }: { cta: Cta }) {
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative pt-28 pb-20 sm:pt-32 lg:pt-36 lg:pb-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(var(--color-line) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 75%)",
          }}
        />
        <div className="bg-forest/10 absolute -top-40 right-[-12%] size-[560px] rounded-full blur-3xl" />
        <div className="absolute top-48 left-[-10%] size-[420px] rounded-full bg-[var(--color-gold)]/15 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="max-w-xl">
          <motion.div
            {...rise(0.05)}
            className="border-line/80 bg-pill/85 text-ink inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-[0.7rem] font-medium tracking-[0.18em] uppercase"
          >
            <Sparkle4 className="text-forest size-3" />
            New from Churro Academy
          </motion.div>

          <motion.h1
            {...rise(0.15)}
            className="font-display text-ink mt-6 text-[2.4rem] leading-[1.06] font-medium tracking-[-0.02em] text-balance sm:text-[3.2rem] lg:text-[3.9rem]"
          >
            Smart tools for bakers who <em className="text-forest italic">mean business.</em>
          </motion.h1>

          <motion.p
            {...rise(0.25)}
            className="text-ink/70 mt-5 max-w-lg text-[1rem] leading-[1.75] sm:text-[1.08rem]"
          >
            Churro AI is a growing suite of tools for home bakers and bakery businesses. It starts with the one every
            baker needs: knowing exactly what a batch costs, and what to charge for it.
          </motion.p>

          <motion.div {...rise(0.35)} className="mt-8 flex flex-wrap items-center gap-4">
            <PrimaryCta cta={cta} />
            <a
              href="#how"
              className={cn(buttonBase, buttonVariants.outline, buttonSizes.md, "group")}
            >
              See how it works
              <ChevronDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </motion.div>

          <motion.ul {...rise(0.45)} className="text-ink/70 mt-9 flex flex-wrap gap-x-6 gap-y-2.5 text-[0.85rem]">
            {["First try free", "No card to start", "Built by Churro Academy"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="bg-forest/10 text-forest flex size-5 items-center justify-center rounded-full">
                  <Check className="size-3" strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <LiveDemo />
          <p className="text-muted mt-4 text-center text-[0.78rem]">
            Try it — drag the sliders and watch every number update.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- suite -- */

function Suite({ cta }: { cta: Cta }) {
  return (
    <section id="tools" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>The suite</Eyebrow>
          <h2 className="font-display text-ink mt-4 text-[2rem] leading-[1.12] font-medium tracking-[-0.015em] sm:text-[2.6rem]">
            One home for the tools your bakery runs on.
          </h2>
          <p className="text-muted mt-4 text-[1rem] leading-[1.75]">
            Churro AI starts with recipe costing. New tools join the suite as they&rsquo;re ready, all in one place.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Reveal delay={0.05} className="lg:col-span-2">
            <article className="border-line/70 group relative h-full overflow-hidden rounded-3xl border bg-[#fffdf9] p-7 transition-shadow duration-500 hover:shadow-[0_30px_70px_-40px_rgba(22,59,41,0.55)] sm:p-9">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <span className="bg-forest text-cream flex size-12 items-center justify-center rounded-2xl">
                  <Calculator className="size-6" strokeWidth={1.6} />
                </span>
                <StatusBadge live={cta.live} />
              </div>
              <h3 className="font-display text-ink mt-6 text-[1.6rem] font-medium">Recipe Cost Calculator</h3>
              <p className="text-muted mt-3 max-w-lg text-[0.95rem] leading-[1.7]">
                Turn a recipe into a price. Add what you paid for each ingredient, your batch size and running costs,
                and get your cost per piece and a selling price that hits the margin you want.
              </p>
              <ul className="mt-6 grid gap-2.5 text-[0.88rem] sm:grid-cols-2">
                {[
                  "Ingredient-by-ingredient costing",
                  "Wastage, packaging, labour & gas",
                  "Selling price from your target margin",
                  "Print, PDF and CSV export",
                ].map((item) => (
                  <li key={item} className="text-ink/80 flex items-start gap-2.5">
                    <Check className="text-forest mt-0.5 size-4 shrink-0" strokeWidth={2.2} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <PrimaryCta cta={cta} size="sm" />
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.12}>
            <article className="border-line flex h-full flex-col justify-between rounded-3xl border-2 border-dashed p-7 sm:p-9">
              <div>
                <span className="bg-pill text-forest flex size-12 items-center justify-center rounded-2xl">
                  <Sparkles className="size-6" strokeWidth={1.6} />
                </span>
                <h3 className="font-display text-ink mt-6 text-[1.4rem] font-medium">More tools on the way</h3>
                <p className="text-muted mt-3 text-[0.92rem] leading-[1.7]">
                  We&rsquo;re building more tools for bakery businesses. They&rsquo;ll appear right here as they launch.
                </p>
              </div>
              <a
                href={cta.earlyAccessHref}
                target="_blank"
                rel="noreferrer"
                className="text-forest group mt-8 inline-flex items-center gap-1.5 text-[0.9rem] font-medium"
              >
                <Plus className="size-4" />
                Get notified on WhatsApp
              </a>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ live }: { live: boolean }) {
  if (live) {
    return (
      <span className="text-forest bg-forest/8 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-wide uppercase">
        <span className="relative flex size-2">
          <span className="bg-forest absolute inline-flex size-full animate-ping rounded-full opacity-60" />
          <span className="bg-forest relative inline-flex size-2 rounded-full" />
        </span>
        Live
      </span>
    );
  }
  return (
    <span className="text-ink inline-flex items-center rounded-full bg-[var(--color-gold)]/20 px-3 py-1 text-[0.72rem] font-semibold tracking-wide uppercase">
      Coming soon
    </span>
  );
}

/* ---------------------------------------------------------- how it works -- */

const STEPS = [
  {
    title: "Add your ingredients",
    body: "Enter what you used and what you paid for it. Each ingredient is costed for you.",
    snippet: (
      <ul className="divide-line/50 divide-y text-[0.78rem]">
        {[
          ["Flour · 300 g", "₹18.00"],
          ["Butter · 150 g", "₹75.00"],
          ["Chocolate · 200 g", "₹80.00"],
        ].map(([name, cost]) => (
          <li key={name} className="flex justify-between py-1.5">
            <span className="text-ink/80">{name}</span>
            <span className="text-ink font-medium tabular-nums">{cost}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Set your batch & costs",
    body: "Batch size, wastage, packaging, labour and gas. Nothing gets left out of the price.",
    snippet: (
      <div className="flex flex-wrap gap-2 text-[0.75rem]">
        {["40 pieces", "5% wastage", "₹1.50 packaging", "₹100 labour", "₹50 gas"].map((chip) => (
          <span key={chip} className="border-line/70 text-ink/80 rounded-full border bg-white px-2.5 py-1">
            {chip}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Get your selling price",
    body: "Pick the margin you want. See your cost per piece and the price that earns it.",
    snippet: (
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted text-[0.7rem]">Suggested price · 40% margin</p>
          <p className="font-display text-forest text-[1.6rem] leading-none font-semibold">₹20.12</p>
        </div>
        <p className="text-muted text-right text-[0.7rem]">
          Cost <span className="text-ink font-medium">₹12.07</span>
        </p>
      </div>
    ),
  },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-cream-warm border-line/60 scroll-mt-20 border-y py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="font-display text-ink mt-4 text-[2rem] leading-[1.12] font-medium tracking-[-0.015em] sm:text-[2.6rem]">
            From recipe to price in three steps.
          </h2>
        </Reveal>

        <ol className="relative mt-14 grid gap-6 lg:grid-cols-3">
          <span
            aria-hidden="true"
            className="border-forest/25 absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed lg:block"
          />
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.1} className="relative">
              <div className="flex justify-center lg:justify-start">
                <span className="bg-forest text-cream ring-cream-warm relative z-10 flex size-14 items-center justify-center rounded-full font-display text-[1.35rem] font-medium ring-8">
                  {i + 1}
                </span>
              </div>
              <div className="border-line/70 mt-6 rounded-3xl border bg-[#fffdf9] p-6">
                <h3 className="text-ink text-[1.05rem] font-semibold">{step.title}</h3>
                <p className="text-muted mt-2 text-[0.9rem] leading-[1.65]">{step.body}</p>
                <div className="border-line/60 bg-cream mt-5 rounded-2xl border p-4">{step.snippet}</div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- features -- */

const FEATURES: { icon: LucideIcon; title: string; body: string; dark?: boolean }[] = [
  { icon: Calculator, title: "Ingredient costing", body: "Cost every ingredient from what you actually paid for it, by weight or by piece." },
  { icon: Scale, title: "Recipe scaling", body: "Going from 10 pieces to 100? See the multiplier for your recipe instantly." },
  { icon: Layers, title: "Wastage & overheads", body: "Wastage, packaging, labour and gas all count, so no cost hides in the price." },
  {
    icon: Percent,
    title: "Margin-based pricing",
    body: "Choose the profit margin you want. The calculator works backwards to the price that delivers it.",
    dark: true,
  },
  { icon: Target, title: "Test your own price", body: "Already have a price in mind? Enter it and see your real revenue, profit and margin." },
  { icon: Printer, title: "Print, PDF & CSV", body: "Print a clean cost sheet, save it as a PDF or export everything to a spreadsheet." },
];

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>Inside the calculator</Eyebrow>
          <h2 className="font-display text-ink mt-4 text-[2rem] leading-[1.12] font-medium tracking-[-0.015em] sm:text-[2.6rem]">
            Everything that goes into a fair price.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, dark }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08}>
              <div
                className={cn(
                  "group h-full rounded-3xl border p-7 transition-[transform,box-shadow] duration-500 hover:-translate-y-1",
                  dark
                    ? "bg-forest-deep text-cream border-transparent hover:shadow-[0_30px_70px_-35px_rgba(22,59,41,0.8)]"
                    : "border-line/70 bg-[#fffdf9] hover:shadow-[0_24px_60px_-38px_rgba(22,59,41,0.5)]",
                )}
              >
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-2xl",
                    dark ? "bg-cream/10 text-cream" : "bg-forest/10 text-forest",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.7} />
                </span>
                <h3 className={cn("mt-5 text-[1.05rem] font-semibold", dark ? "text-cream" : "text-ink")}>{title}</h3>
                <p className={cn("mt-2 text-[0.9rem] leading-[1.65]", dark ? "text-cream/70" : "text-muted")}>{body}</p>
                {dark && (
                  <p className="border-cream/15 text-cream/85 mt-5 border-t pt-4 font-mono text-[0.78rem]">
                    price = cost ÷ (1 − margin)
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- pricing -- */

function PricingSection({ cta, pricing }: { cta: Cta; pricing: Pricing }) {
  const trial = formatTrialLength(pricing.trialMinutes);
  return (
    <section id="pricing" className="bg-cream-warm border-line/60 scroll-mt-20 border-y py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="font-display text-ink mt-4 text-[2rem] leading-[1.12] font-medium tracking-[-0.015em] sm:text-[2.6rem]">
            Try it free. Then one simple pass.
          </h2>
          <p className="text-muted mt-4 text-[1rem] leading-[1.75]">
            Sign in with your phone number and cost a real recipe before you pay anything.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="border-line/70 flex flex-col rounded-3xl border bg-[#fffdf9] p-8 sm:p-9">
              <p className="text-ink text-[0.95rem] font-semibold">Free try</p>
              <p className="font-display text-ink mt-4 text-[2.6rem] leading-none font-semibold">₹0</p>
              <p className="text-muted mt-2 text-[0.85rem]">{trial} with the full calculator</p>
              <ul className="mt-7 space-y-3 text-[0.9rem]">
                {["Just your mobile number", "No card needed", "Every feature unlocked"].map((item) => (
                  <li key={item} className="text-ink/80 flex items-start gap-2.5">
                    <Check className="text-forest mt-0.5 size-4 shrink-0" strokeWidth={2.2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-forest-deep text-cream relative flex flex-col overflow-hidden rounded-3xl p-8 sm:p-9">
              <div aria-hidden="true" className="bg-forest-soft/40 pointer-events-none absolute -top-20 -right-20 size-64 rounded-full blur-3xl" />
              <div className="relative flex flex-1 flex-col">
                <p className="text-[0.95rem] font-semibold">{pricing.passName}</p>
                <p className="font-display mt-4 text-[2.6rem] leading-none font-semibold">
                  {formatPrice(pricing.passPrice)}
                  <span className="text-cream/60 font-sans text-[0.95rem] font-normal"> / {passLength(pricing.passDays)}</span>
                </p>
                <p className="text-cream/60 mt-2 text-[0.85rem]">One payment, GST included</p>
                <ul className="mt-7 space-y-3 text-[0.9rem]">
                  {["Unlimited use of the calculator", "Print, PDF and CSV export", "Sign in from any device", "GST invoice by email"].map(
                    (item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-gold)]" strokeWidth={2.4} />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
                <div className="mt-8">
                  <PrimaryCta cta={cta} tone="cream" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ -- */

function faqs(pricing: Pricing) {
  return [
    {
      q: "What is Churro AI?",
      a: "A growing set of tools from Churro Academy for home bakers and bakery businesses. It starts with the Recipe Cost Calculator.",
    },
    {
      q: "Who is it for?",
      a: "Anyone who sells what they bake: home bakers, cloud kitchens, cafés and small bakeries.",
    },
    {
      q: "How much does it cost?",
      a: `Your first try is free — ${formatTrialLength(pricing.trialMinutes)} with the full calculator. After that, the ${pricing.passName} is ${formatPrice(pricing.passPrice)} a ${passLength(pricing.passDays)}, paid once through Razorpay, with a GST invoice by email. It doesn't renew on its own.`,
    },
    {
      q: "How do I sign in?",
      a: "With your mobile number and a one-time code. There's no password to remember, and you can sign in from any device.",
    },
    {
      q: "Do I need to be a Churro Academy student?",
      a: "No. Churro AI is open to every baker, whether or not you've taken a course with us.",
    },
    {
      q: "Is my recipe data stored anywhere?",
      a: "No. The calculator runs in your browser, so your recipe numbers aren't sent to or saved on our servers.",
    },
    {
      q: "Can I print or export my costing?",
      a: "Yes. Print a cost sheet, save it as a PDF from the print window, or export everything to CSV for Excel or Google Sheets.",
    },
  ];
}

function Faq({ pricing }: { pricing: Pricing }) {
  const FAQS = faqs(pricing);
  return (
    <section id="faq" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="font-display text-ink mt-4 text-[2rem] leading-[1.12] font-medium tracking-[-0.015em] sm:text-[2.6rem]">
            Questions, answered.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="divide-line/70 border-line/70 divide-y rounded-3xl border bg-[#fffdf9]">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group px-6 py-5 sm:px-7">
                <summary className="text-ink flex cursor-pointer list-none items-center justify-between gap-4 text-[0.98rem] font-medium [&::-webkit-details-marker]:hidden">
                  {q}
                  <Plus className="text-forest size-4 shrink-0 transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="text-muted mt-3 text-[0.92rem] leading-[1.7]">{a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ final CTA -- */

function FinalCta({ cta }: { cta: Cta }) {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <div className="bg-forest-deep relative overflow-hidden rounded-[2rem] px-7 py-14 text-center sm:px-12 sm:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="bg-forest-soft/40 absolute -top-24 -left-24 size-80 rounded-full blur-3xl" />
              <div className="absolute -right-20 -bottom-28 size-80 rounded-full bg-[var(--color-gold)]/20 blur-3xl" />
            </div>
            <div className="relative">
              <Sparkle4 className="mx-auto size-6 text-[var(--color-gold)]" />
              <h2 className="font-display text-cream mx-auto mt-5 max-w-2xl text-[2rem] leading-[1.12] font-medium tracking-[-0.015em] sm:text-[2.8rem]">
                Price every bake with confidence.
              </h2>
              <p className="text-cream/70 mx-auto mt-4 max-w-lg text-[1rem] leading-[1.7]">
                Stop guessing what to charge. Know your cost, choose your margin, and sell with confidence.
              </p>
              <div className="mt-9 flex justify-center">
                <PrimaryCta cta={cta} tone="cream" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- footer -- */

function Footer({ academyUrl, earlyAccessHref }: { academyUrl: string; earlyAccessHref: string }) {
  return (
    <footer className="border-line/60 border-t print:hidden">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <Brand />
          <p className="text-muted mt-2 text-[0.8rem]">
            A product of{" "}
            <a href={academyUrl} className="text-forest font-medium hover:underline">
              Churro Academy
            </a>
          </p>
        </div>
        <nav aria-label="Churro AI footer" className="text-ink/70 flex flex-wrap gap-x-6 gap-y-2 text-[0.85rem]">
          <a href="#tools" className="hover:text-forest">Tools</a>
          <a href="#faq" className="hover:text-forest">FAQ</a>
          <a href={earlyAccessHref} target="_blank" rel="noreferrer" className="hover:text-forest inline-flex items-center gap-1.5">
            <MessageCircle className="size-3.5" />
            Contact us
          </a>
        </nav>
        <p className="text-muted text-[0.78rem]">© {new Date().getFullYear()} Churro Academy</p>
      </div>
    </footer>
  );
}
