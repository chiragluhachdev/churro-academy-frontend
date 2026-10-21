"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { AnimatedNumber } from "@/components/churroai/AnimatedNumber";
import { cn, formatPrice, formatPricePrecise } from "@/lib/format";

/** A 20-piece churro batch; every quantity and cost scales from here. */
const BASE_BATCH = 20;
const INGREDIENTS = [
  { name: "All-purpose flour", qty: 250, unit: "g", cost: 15 },
  { name: "Butter", qty: 60, unit: "g", cost: 30 },
  { name: "Sugar & cinnamon", qty: 80, unit: "g", cost: 12 },
  { name: "Frying oil", qty: 500, unit: "ml", cost: 60 },
  { name: "Chocolate dip", qty: 150, unit: "g", cost: 60 },
];
const WASTAGE = 0.05;
const PACKAGING_PER_PIECE = 2;
const LABOUR = 120;
const GAS = 40;

const rupees = (n: number) => formatPricePrecise(Math.max(0, n));
const wholeRupees = (n: number) => formatPrice(Math.max(0, Math.round(n)));

function formatQty(qty: number, unit: string) {
  if (unit === "g" && qty >= 1000) return `${(qty / 1000).toFixed(1)} kg`;
  if (unit === "ml" && qty >= 1000) return `${(qty / 1000).toFixed(1)} l`;
  return `${Math.round(qty)} ${unit}`;
}

export function LiveDemo() {
  const [batch, setBatch] = useState(40);
  const [margin, setMargin] = useState(40);

  const r = useMemo(() => {
    const scale = batch / BASE_BATCH;
    const ingredients = INGREDIENTS.reduce((sum, i) => sum + i.cost, 0) * scale;
    const wastage = ingredients * WASTAGE;
    const packaging = PACKAGING_PER_PIECE * batch;
    const fixed = LABOUR + GAS;
    const total = ingredients + wastage + packaging + fixed;
    const costPerPiece = total / batch;
    const price = costPerPiece / (1 - margin / 100);
    return {
      scale,
      total,
      costPerPiece,
      price,
      profit: (price - costPerPiece) * batch,
      fixedPerPiece: fixed / batch,
      segments: [
        { label: "Ingredients", value: ingredients + wastage, color: "bg-forest" },
        { label: "Packaging", value: packaging, color: "bg-[var(--color-gold)]" },
        { label: "Labour & gas", value: fixed, color: "bg-forest-soft/45" },
      ],
    };
  }, [batch, margin]);

  const float = (delay: number) => ({
    animate: { y: [0, -8, 0] },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const, delay },
  });

  return (
    <div className="relative">
      {/* Live profit chip — floats off the window's corner on wide screens. */}
      <motion.div
        {...float(0)}
        className="border-line/70 absolute -top-5 -left-6 z-10 hidden items-center gap-2.5 rounded-2xl border bg-white/90 px-4 py-3 shadow-[0_14px_40px_-18px_rgba(22,59,41,0.45)] backdrop-blur sm:flex"
      >
        <span className="bg-forest/10 text-forest flex size-8 items-center justify-center rounded-xl">
          <TrendingUp className="size-4" strokeWidth={1.8} />
        </span>
        <span className="leading-tight">
          <span className="text-muted block text-[0.68rem]">Profit per batch</span>
          <AnimatedNumber value={r.profit} format={wholeRupees} className="text-ink text-[0.95rem] font-semibold" />
        </span>
      </motion.div>

      {/* App window */}
      <div className="border-line/80 overflow-hidden rounded-[1.4rem] border bg-[#fffdf9] shadow-[0_40px_90px_-40px_rgba(22,59,41,0.55)]">
        <div className="border-line/70 flex items-center gap-3 border-b bg-[var(--color-cream-warm)] px-4 py-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="bg-line size-2.5 rounded-full" />
            <span className="bg-line size-2.5 rounded-full" />
            <span className="bg-line size-2.5 rounded-full" />
          </span>
          <span className="text-ink/70 flex-1 text-center text-[0.75rem] font-medium">Recipe Cost Calculator</span>
          <span className="text-forest bg-forest/8 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide uppercase">
            <span className="relative flex size-1.5">
              <span className="bg-forest absolute inline-flex size-full animate-ping rounded-full opacity-60" />
              <span className="bg-forest relative inline-flex size-1.5 rounded-full" />
            </span>
            Live
          </span>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-muted text-[0.68rem] font-medium tracking-[0.16em] uppercase">Recipe</p>
              <p className="font-display text-ink mt-0.5 text-[1.15rem] font-medium">Classic Cinnamon Churros</p>
            </div>
            <span className="text-muted shrink-0 text-[0.75rem]">{batch} pieces</span>
          </div>

          <ul className="divide-line/50 border-line/60 divide-y rounded-xl border bg-white/70 text-[0.78rem]">
            {INGREDIENTS.map((item) => (
              <li key={item.name} className="flex items-center gap-3 px-3.5 py-2">
                <span className="text-ink flex-1 truncate">{item.name}</span>
                <span className="text-muted w-16 text-right tabular-nums">{formatQty(item.qty * r.scale, item.unit)}</span>
                <AnimatedNumber
                  value={item.cost * r.scale}
                  format={rupees}
                  className="text-ink w-20 text-right font-medium tabular-nums"
                />
              </li>
            ))}
          </ul>

          <div className="grid gap-4 sm:grid-cols-2">
            <Slider
              label="Batch size"
              value={batch}
              display={`${batch} pcs`}
              min={10}
              max={120}
              step={5}
              onChange={setBatch}
            />
            <Slider
              label="Profit margin"
              value={margin}
              display={`${margin}%`}
              min={10}
              max={70}
              step={1}
              onChange={setMargin}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--color-gold)]/15 px-4 py-3">
              <p className="text-ink/70 text-[0.7rem] font-medium">Cost per piece</p>
              <AnimatedNumber
                value={r.costPerPiece}
                format={rupees}
                className="font-display text-ink mt-0.5 block text-[1.45rem] font-semibold tabular-nums"
              />
            </div>
            <div className="bg-forest rounded-xl px-4 py-3">
              <p className="text-cream/70 text-[0.7rem] font-medium">Suggested price</p>
              <AnimatedNumber
                value={r.price}
                format={rupees}
                className="font-display text-cream mt-0.5 block text-[1.45rem] font-semibold tabular-nums"
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between text-[0.72rem]">
              <span className="text-muted">Where the money goes</span>
              <span className="text-ink font-medium">
                Batch cost <AnimatedNumber value={r.total} format={wholeRupees} className="tabular-nums" />
              </span>
            </div>
            <div className="bg-line/50 mt-2 flex h-2.5 overflow-hidden rounded-full">
              {r.segments.map((s) => (
                <motion.span
                  key={s.label}
                  className={cn("h-full", s.color)}
                  initial={false}
                  animate={{ width: `${(s.value / r.total) * 100}%` }}
                  transition={{ type: "spring", stiffness: 140, damping: 22 }}
                />
              ))}
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem]">
              {r.segments.map((s) => (
                <li key={s.label} className="text-muted flex items-center gap-1.5">
                  <span className={cn("size-2 rounded-full", s.color)} />
                  {s.label} {Math.round((s.value / r.total) * 100)}%
                </li>
              ))}
            </ul>
            <p className="border-line/60 text-ink/75 mt-3.5 border-t pt-3 text-[0.75rem] leading-snug">
              Labour &amp; gas add{" "}
              <AnimatedNumber value={r.fixedPerPiece} format={rupees} className="text-forest font-semibold tabular-nums" />{" "}
              to each piece. Bigger batches spread them thinner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[0.75rem]">
        <span className="text-ink/80 font-medium">{label}</span>
        <span className="text-forest font-semibold tabular-nums">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={display}
        className="accent-forest mt-2 h-1.5 w-full cursor-pointer"
      />
    </label>
  );
}
