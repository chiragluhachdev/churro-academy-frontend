"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Calculator,
  ChevronDown,
  Download,
  Loader2,
  Lock,
  Percent,
  Plus,
  Printer,
  RotateCcw,
  Scale,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/format";

// ---------------------------------------------------------------------------
// Multi-currency support
// ---------------------------------------------------------------------------

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  /** Approximate exchange rate relative to 1 USD */
  rateToUSD: number;
}

const CURRENCIES: CurrencyInfo[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", rateToUSD: 83.5 },
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", rateToUSD: 1.0 },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", rateToUSD: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", rateToUSD: 0.79 },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", locale: "en-CA", rateToUSD: 1.36 },
  { code: "AUD", symbol: "AU$", name: "Australian Dollar", locale: "en-AU", rateToUSD: 1.52 },
  { code: "AED", symbol: "AED", name: "UAE Dirham", locale: "ar-AE", rateToUSD: 3.67 },
  { code: "SGD", symbol: "SG$", name: "Singapore Dollar", locale: "en-SG", rateToUSD: 1.35 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP", rateToUSD: 155.0 },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", locale: "es-MX", rateToUSD: 17.5 },
];

const CURRENCY_MAP: Record<string, CurrencyInfo> = Object.fromEntries(CURRENCIES.map((c) => [c.code, c]));
const DEFAULT_CURRENCY = CURRENCIES[0]; // INR

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Format a monetary value in the given currency. */
function formatMoney(amount: number, currency: CurrencyInfo): string {
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currency.code === "JPY" ? 0 : 2,
    maximumFractionDigits: currency.code === "JPY" ? 0 : 2,
  }).format(amount);
}

/** Convert an amount between currencies using approximate rates. */
function convertAmount(amount: number, fromCode: string, toCode: string): number {
  if (fromCode === toCode || !amount) return amount;
  const from = CURRENCY_MAP[fromCode] || DEFAULT_CURRENCY;
  const to = CURRENCY_MAP[toCode] || DEFAULT_CURRENCY;
  const inUSD = amount / from.rateToUSD;
  const inTarget = inUSD * to.rateToUSD;
  return to.code === "JPY" ? Math.round(inTarget) : round2(inTarget);
}


// No up/down arrows on number boxes: numbers are typed, not nudged.
const inputClass =
  "w-full rounded-xl border border-line/60 bg-cream px-3.5 py-2.5 text-[0.86rem] text-ink transition-colors placeholder:text-muted/50 focus:border-forest/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const UNITS = ["g", "kg", "ml", "l", "pcs", "tbsp", "tsp"];

interface Ingredient {
  id: string;
  name: string;
  qtyUsed: number;
  unit: string;
  purchaseQty: number;
  purchasePrice: number;
}

const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: "seed-1", name: "All Purpose Flour", qtyUsed: 300, unit: "g", purchaseQty: 1000, purchasePrice: 60 },
  { id: "seed-2", name: "Sugar", qtyUsed: 180, unit: "g", purchaseQty: 1000, purchasePrice: 50 },
  { id: "seed-3", name: "Butter", qtyUsed: 150, unit: "g", purchaseQty: 500, purchasePrice: 250 },
  { id: "seed-4", name: "Dark Chocolate", qtyUsed: 200, unit: "g", purchaseQty: 1000, purchasePrice: 400 },
];

const DEFAULTS = {
  ingredients: DEFAULT_INGREDIENTS,
  originalYield: 10,
  targetYield: 10,
  wastagePct: 5,
  packagingPerPiece: 1.5,
  labourCost: 100,
  electricityCost: 50,
  otherCost: 50,
  targetMargin: 40,
  actualSellingPrice: 0,
};

/**
 * The recipe in progress and its last calculation, kept in this browser (it
 * never leaves the device). Paying mid free try reloads the page, and a free
 * try's one calculation shouldn't vanish with a new tab.
 */
const STORE_KEY = "churroai:calculator";
type Inputs = typeof DEFAULTS;

/** A calculation: the recipe exactly as it was when Calculate was clicked, and its numbers. */
interface Result {
  inputs: Inputs;
  sums: Sums;
}
type Saved = Inputs & { result?: Result | null; currencyCode?: string };

function readSaved(): Partial<Saved> | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Saved>) : null;
  } catch {
    return null;
  }
}

function costUsed(ing: Ingredient): number {
  if (!ing.purchaseQty) return 0;
  return (ing.qtyUsed / ing.purchaseQty) * ing.purchasePrice;
}

type Sums = ReturnType<typeof computeSums>;

function computeSums(i: Inputs) {
  const rowCosts: Record<string, number> = Object.fromEntries(i.ingredients.map((ing) => [ing.id, costUsed(ing)]));
  const ingredientCost = i.ingredients.reduce((sum, ing) => sum + costUsed(ing), 0);
  const wastageAmount = ingredientCost * (i.wastagePct / 100);
  const ingredientCostWithWastage = ingredientCost + wastageAmount;
  const packagingCost = i.packagingPerPiece * i.targetYield;
  const totalBatchCost = ingredientCostWithWastage + packagingCost + i.labourCost + i.electricityCost + i.otherCost;
  const costPerPiece = i.targetYield > 0 ? totalBatchCost / i.targetYield : 0;
  const marginFraction = Math.min(i.targetMargin, 99) / 100;
  const suggestedSellingPrice = marginFraction < 1 ? costPerPiece / (1 - marginFraction) : 0;
  const profitPerPiece = suggestedSellingPrice - costPerPiece;
  const scalingFactor = i.originalYield > 0 ? i.targetYield / i.originalYield : 0;

  const effectivePrice = i.actualSellingPrice > 0 ? i.actualSellingPrice : suggestedSellingPrice;
  const actualRevenue = effectivePrice * i.targetYield;
  const actualGrossProfit = actualRevenue - totalBatchCost;
  const actualGrossMargin = actualRevenue > 0 ? (actualGrossProfit / actualRevenue) * 100 : 0;

  return {
    rowCosts,
    ingredientCost,
    wastageAmount,
    ingredientCostWithWastage,
    packagingCost,
    totalBatchCost,
    costPerPiece,
    suggestedSellingPrice,
    profitPerPiece,
    scalingFactor,
    effectivePrice,
    actualRevenue,
    actualGrossProfit,
    actualGrossMargin,
  };
}

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

/**
 * Free-try limits: one calculation and one export. `calcUsed`/`exportUsed`
 * say they're spent; the claims spend them (resolving true if allowed);
 * `onLocked` is where a spent one sends them — the pass. Omitted for pass
 * holders: no limits.
 */
export interface TrialLimits {
  calcUsed: boolean;
  exportUsed: boolean;
  claimCalc: () => Promise<boolean>;
  claimExport: () => Promise<boolean>;
  onLocked: () => void;
}

/**
 * Results appear only when Calculate is clicked, never live while typing —
 * and stay those of that click until the next one.
 */
export function CostCalculator({
  limits,
  isPaid = false,
  defaultCurrency = "INR",
}: {
  limits?: TrialLimits;
  isPaid?: boolean;
  defaultCurrency?: string;
} = {}) {
  const initialCurrency = CURRENCY_MAP[defaultCurrency] || DEFAULT_CURRENCY;
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULTS.ingredients);
  const [originalYield, setOriginalYield] = useState(DEFAULTS.originalYield);
  const [targetYield, setTargetYield] = useState(DEFAULTS.targetYield);
  const [wastagePct, setWastagePct] = useState(DEFAULTS.wastagePct);
  const [packagingPerPiece, setPackagingPerPiece] = useState(DEFAULTS.packagingPerPiece);
  const [labourCost, setLabourCost] = useState(DEFAULTS.labourCost);
  const [electricityCost, setElectricityCost] = useState(DEFAULTS.electricityCost);
  const [otherCost, setOtherCost] = useState(DEFAULTS.otherCost);
  const [targetMargin, setTargetMargin] = useState(DEFAULTS.targetMargin);
  const [actualSellingPrice, setActualSellingPrice] = useState(DEFAULTS.actualSellingPrice);
  const [result, setResult] = useState<Result | null>(null);
  const [currency, setCurrency] = useState<CurrencyInfo>(initialCurrency);
  const [restored, setRestored] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [exporting, setExporting] = useState(false);
  // During a free try the sheet only prints through the button below, so the browser's own Print can't skip the limit.
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const done = () => setPrinting(false);
    window.addEventListener("afterprint", done);
    return () => window.removeEventListener("afterprint", done);
  }, []);

  /** Runs an export, spending the free try's one export first when there's a limit. */
  async function gated(run: () => void) {
    if (!limits) return run();
    if (limits.exportUsed) return limits.onLocked();
    setExporting(true);
    const ok = await limits.claimExport();
    setExporting(false);
    if (ok) run();
  }

  function printSheet() {
    if (!limits) return window.print();
    setPrinting(true);
    // Let React drop the print guard before the print dialog snapshots the page.
    setTimeout(() => window.print(), 50);
  }

  // Restore after mount, so the server's render and the first browser render match.
  useEffect(() => {
    const restore = setTimeout(() => {
      const saved = readSaved();
      if (saved) {
        if (Array.isArray(saved.ingredients)) setIngredients(saved.ingredients);
        const num = (v: unknown, set: (n: number) => void) => typeof v === "number" && Number.isFinite(v) && set(v);
        num(saved.originalYield, setOriginalYield);
        num(saved.targetYield, setTargetYield);
        num(saved.wastagePct, setWastagePct);
        num(saved.packagingPerPiece, setPackagingPerPiece);
        num(saved.labourCost, setLabourCost);
        num(saved.electricityCost, setElectricityCost);
        num(saved.otherCost, setOtherCost);
        num(saved.targetMargin, setTargetMargin);
        num(saved.actualSellingPrice, setActualSellingPrice);
        if (saved.result?.inputs && saved.result.sums) setResult(saved.result);
        if (saved.currencyCode && CURRENCY_MAP[saved.currencyCode]) {
          setCurrency(CURRENCY_MAP[saved.currencyCode]);
        } else if (defaultCurrency && CURRENCY_MAP[defaultCurrency]) {
          setCurrency(CURRENCY_MAP[defaultCurrency]);
        }
      } else if (defaultCurrency && defaultCurrency !== "INR" && CURRENCY_MAP[defaultCurrency]) {
        const targetCurr = CURRENCY_MAP[defaultCurrency];
        setCurrency(targetCurr);
        setIngredients(
          DEFAULTS.ingredients.map((i) => ({
            ...i,
            purchasePrice: convertAmount(i.purchasePrice, "INR", targetCurr.code),
          }))
        );
        setPackagingPerPiece(convertAmount(DEFAULTS.packagingPerPiece, "INR", targetCurr.code));
        setLabourCost(convertAmount(DEFAULTS.labourCost, "INR", targetCurr.code));
        setElectricityCost(convertAmount(DEFAULTS.electricityCost, "INR", targetCurr.code));
        setOtherCost(convertAmount(DEFAULTS.otherCost, "INR", targetCurr.code));
      }
      setRestored(true);
    }, 0);
    return () => clearTimeout(restore);
  }, [defaultCurrency]);

  useEffect(() => {
    if (!restored) return;
    const saved: Saved = {
      ingredients,
      originalYield,
      targetYield,
      wastagePct,
      packagingPerPiece,
      labourCost,
      electricityCost,
      otherCost,
      targetMargin,
      actualSellingPrice,
      result,
      currencyCode: currency.code,
    };
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(saved));
    } catch {
      // Private mode or storage full: the calculator still works, it just won't remember.
    }
  }, [
    restored,
    ingredients,
    originalYield,
    targetYield,
    wastagePct,
    packagingPerPiece,
    labourCost,
    electricityCost,
    otherCost,
    targetMargin,
    actualSellingPrice,
    result,
    currency,
  ]);

  const setIngredient = (id: string, patch: Partial<Ingredient>) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addIngredient = () =>
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", qtyUsed: 0, unit: "g", purchaseQty: 0, purchasePrice: 0 },
    ]);

  const removeIngredient = (id: string) => setIngredients((prev) => prev.filter((i) => i.id !== id));

  const inputs: Inputs = {
    ingredients,
    originalYield,
    targetYield,
    wastagePct,
    packagingPerPiece,
    labourCost,
    electricityCost,
    otherCost,
    targetMargin,
    actualSellingPrice,
  };
  // What's shown is always the last calculation, never the live inputs.
  const sums = result?.sums;
  const shown = result?.inputs;
  const changed = result !== null && JSON.stringify(result.inputs) !== JSON.stringify(inputs);
  // A free try's one calculation is spent: the recipe is read-only from here on.
  const locked = Boolean(limits?.calcUsed);
  /** All internal calculations are in the input currency (always INR for default ingredients).
   *  The `money` helper formats the value in the currently selected display currency. */
  const money = (value?: number) => (value === undefined ? "—" : formatMoney(round2(value), currency));
  const sym = currency.symbol;

  async function calculate() {
    if (limits) {
      if (limits.calcUsed) return limits.onLocked();
      setCalculating(true);
      const ok = await limits.claimCalc();
      setCalculating(false);
      if (!ok) return;
    }
    setResult({ inputs: structuredClone(inputs), sums: computeSums(inputs) });
  }

  function handleCurrencyChange(newCode: string) {
    const newCurrency = CURRENCY_MAP[newCode];
    if (!newCurrency || newCurrency.code === currency.code) return;

    const oldCode = currency.code;
    setCurrency(newCurrency);

    // Convert working inputs to the new currency
    setIngredients((prev) =>
      prev.map((ing) => ({
        ...ing,
        purchasePrice: convertAmount(ing.purchasePrice, oldCode, newCode),
      }))
    );
    setPackagingPerPiece((prev) => convertAmount(prev, oldCode, newCode));
    setLabourCost((prev) => convertAmount(prev, oldCode, newCode));
    setElectricityCost((prev) => convertAmount(prev, oldCode, newCode));
    setOtherCost((prev) => convertAmount(prev, oldCode, newCode));
    setActualSellingPrice((prev) => (prev > 0 ? convertAmount(prev, oldCode, newCode) : 0));

    // Convert last calculated result if any
    setResult((prevResult) => {
      if (!prevResult) return null;
      const convertedIngredients = prevResult.inputs.ingredients.map((ing) => ({
        ...ing,
        purchasePrice: convertAmount(ing.purchasePrice, oldCode, newCode),
      }));
      const convertedInputs: Inputs = {
        ...prevResult.inputs,
        ingredients: convertedIngredients,
        packagingPerPiece: convertAmount(prevResult.inputs.packagingPerPiece, oldCode, newCode),
        labourCost: convertAmount(prevResult.inputs.labourCost, oldCode, newCode),
        electricityCost: convertAmount(prevResult.inputs.electricityCost, oldCode, newCode),
        otherCost: convertAmount(prevResult.inputs.otherCost, oldCode, newCode),
        actualSellingPrice:
          prevResult.inputs.actualSellingPrice > 0
            ? convertAmount(prevResult.inputs.actualSellingPrice, oldCode, newCode)
            : 0,
      };
      return {
        inputs: convertedInputs,
        sums: computeSums(convertedInputs),
      };
    });
  }

  /**
   * Pro feature for paid users: scrollable / slider batch size effect.
   * Auto-updates all batch calculations and selling prices live in real-time.
   */
  function updateBatchSize(newYield: number) {
    const safeYield = Math.max(1, newYield);
    setTargetYield(safeYield);

    // Only live-update for paid members
    if (isPaid || !limits) {
      const liveInputs: Inputs = {
        ingredients,
        originalYield,
        targetYield: safeYield,
        wastagePct,
        packagingPerPiece,
        labourCost,
        electricityCost,
        otherCost,
        targetMargin,
        actualSellingPrice,
      };
      setResult({
        inputs: liveInputs,
        sums: computeSums(liveInputs),
      });
    }
  }

  function resetAll() {
    setResult(null);
    if (!window.confirm("Reset the calculator? Everything you've entered will be cleared.")) return;
    setIngredients(
      DEFAULTS.ingredients.map((i) => ({
        ...i,
        purchasePrice: convertAmount(i.purchasePrice, "INR", currency.code),
      }))
    );
    setOriginalYield(DEFAULTS.originalYield);
    setTargetYield(DEFAULTS.targetYield);
    setWastagePct(DEFAULTS.wastagePct);
    setPackagingPerPiece(convertAmount(DEFAULTS.packagingPerPiece, "INR", currency.code));
    setLabourCost(convertAmount(DEFAULTS.labourCost, "INR", currency.code));
    setElectricityCost(convertAmount(DEFAULTS.electricityCost, "INR", currency.code));
    setOtherCost(convertAmount(DEFAULTS.otherCost, "INR", currency.code));
    setTargetMargin(DEFAULTS.targetMargin);
    setActualSellingPrice(DEFAULTS.actualSellingPrice);
  }

  function exportCsv() {
    if (!result) return;
    const { inputs: r, sums: t } = result;
    const cc = currency.code;
    const rows: (string | number)[][] = [
      ["Ingredient", "Qty used", "Unit", "Purchase qty", `Price paid (${cc})`, `Cost used (${cc})`],
      ...r.ingredients.map((ing) => [
        ing.name || "Untitled",
        ing.qtyUsed,
        ing.unit,
        ing.purchaseQty,
        round2(ing.purchasePrice),
        round2(t.rowCosts[ing.id] ?? costUsed(ing)),
      ]),
      [],
      ["Total ingredient cost", "", "", "", "", round2(t.ingredientCost)],
      [`Wastage (${r.wastagePct}%)`, "", "", "", "", round2(t.wastageAmount)],
      ["Ingredient cost with wastage", "", "", "", "", round2(t.ingredientCostWithWastage)],
      ["Packaging cost", "", "", "", "", round2(t.packagingCost)],
      ["Labour cost", "", "", "", "", round2(r.labourCost)],
      ["Electricity / gas", "", "", "", "", round2(r.electricityCost)],
      ["Other expenses", "", "", "", "", round2(r.otherCost)],
      ["Total batch cost", "", "", "", "", round2(t.totalBatchCost)],
      [`Cost per piece (${r.targetYield} pieces)`, "", "", "", "", round2(t.costPerPiece)],
      [`Suggested selling price (${r.targetMargin}% margin)`, "", "", "", "", round2(t.suggestedSellingPrice)],
      [],
      ["Currency", cc],
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recipe-cost-sheet.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const printBlocked = Boolean(limits) && !printing;

  /** Scrolling over, or pressing ↑/↓ in, a number box changes it in some browsers. Not here. */
  function guardNumberInput(event: React.WheelEvent | React.KeyboardEvent) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "number") return;
    if (event.type === "wheel") {
      if (document.activeElement === target) target.blur();
    } else if ((event as React.KeyboardEvent).key === "ArrowUp" || (event as React.KeyboardEvent).key === "ArrowDown") {
      event.preventDefault();
    }
  }

  return (
    <section className="bg-cream" onWheelCapture={guardNumberInput} onKeyDownCapture={guardNumberInput}>
      {printBlocked && (
        <p className="hidden p-10 text-center text-[14pt] print:block">
          Printing during the free try works through the &ldquo;Print / Save as PDF&rdquo; button, once. Get the Churro AI
          pass for unlimited printing.
        </p>
      )}
      <div className={cn("mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:py-16", printBlocked && "print:hidden")}>
        {/* Currency selector */}
        <div className="mb-8 flex items-center justify-end gap-3 print:hidden">
          <label htmlFor="currency-select" className="text-muted text-[0.82rem] font-medium">
            Currency
          </label>
          <div className="relative">
            <select
              id="currency-select"
              value={currency.code}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className={cn(
                inputClass,
                "w-auto min-w-[10rem] appearance-none py-2 pr-9 pl-3.5 text-[0.85rem] font-medium",
              )}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-12 xl:gap-16">
          {/* Left column — read-only once a free try's one calculation is spent */}
          <fieldset disabled={locked} className="min-w-0 space-y-8">
            {locked && (
              <p className="border-line/70 text-ink flex items-center gap-2 rounded-2xl border bg-[#fffdf9] px-5 py-3.5 text-[0.86rem] print:hidden">
                <Lock className="text-muted size-4 shrink-0" />
                Your free try&rsquo;s one calculation is done, so the recipe is locked. Get the pass to change it and
                calculate again.
              </p>
            )}
            <Reveal>
              <Card title="1. Enter your ingredients" icon={Calculator}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="text-muted border-line/60 border-b text-[0.72rem] font-medium tracking-wider uppercase">
                        <th className="py-2.5 pr-3">Ingredient</th>
                        <th className="px-3 py-2.5">Qty used</th>
                        <th className="px-3 py-2.5">Unit</th>
                        <th className="px-3 py-2.5">Purchase qty</th>
                        <th className="px-3 py-2.5">Price paid ({sym})</th>
                        <th className="px-3 py-2.5 text-right">Cost used</th>
                        <th className="w-9" />
                      </tr>
                    </thead>
                    <tbody className="divide-line/40 divide-y">
                      {ingredients.map((ing) => (
                        <tr key={ing.id}>
                          <td className="py-2 pr-3">
                            <input
                              value={ing.name}
                              onChange={(e) => setIngredient(ing.id, { name: e.target.value })}
                              placeholder="e.g. Flour"
                              className={cn(inputClass, "min-w-[9rem] py-2")}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={ing.qtyUsed || ""}
                              onChange={(e) => setIngredient(ing.id, { qtyUsed: Number(e.target.value) })}
                              className={cn(inputClass, "w-20 py-2 text-center")}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={ing.unit}
                              onChange={(e) => setIngredient(ing.id, { unit: e.target.value })}
                              className={cn(inputClass, "w-[4.75rem] min-w-[4.75rem] px-2.5 py-2")}
                            >
                              {UNITS.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={ing.purchaseQty || ""}
                              onChange={(e) => setIngredient(ing.id, { purchaseQty: Number(e.target.value) })}
                              className={cn(inputClass, "w-20 py-2 text-center")}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={ing.purchasePrice || ""}
                              onChange={(e) => setIngredient(ing.id, { purchasePrice: Number(e.target.value) })}
                              className={cn(inputClass, "w-24 py-2 text-center")}
                            />
                          </td>
                          <td className="text-ink px-3 py-2 text-right font-medium whitespace-nowrap">
                            {sums && ing.id in sums.rowCosts ? money(sums.rowCosts[ing.id]) : "—"}
                          </td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              aria-label="Remove ingredient"
                              onClick={() => removeIngredient(ing.id)}
                              className="text-muted hover:bg-red-50 hover:text-red-600 rounded-lg p-1.5 transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-muted mt-1 text-[0.72rem]">
                  Qty used and purchase qty should share the same unit. Cost used is purchase price ×
                  (qty used ÷ purchase qty).
                </p>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="border-line hover:border-forest/40 text-forest mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-[0.85rem] font-medium transition-colors"
                >
                  <Plus className="size-4" />
                  Add ingredient
                </button>
              </Card>
            </Reveal>

            <div className="grid gap-8 sm:grid-cols-2">
              <Reveal delay={0.05}>
                <Card title="2. Yield & scaling" icon={Scale}>
                  <Field label="Original recipe yield" hint="How many pieces this recipe makes as written.">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={originalYield || ""}
                        onChange={(e) => setOriginalYield(Number(e.target.value))}
                        className={inputClass}
                      />
                      <span className="text-muted shrink-0 text-[0.8rem]">pieces</span>
                    </div>
                  </Field>
                  <Field label="Target production yield" hint="How many pieces this batch is being costed for.">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={targetYield || ""}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (isPaid || !limits) updateBatchSize(val);
                          else setTargetYield(val);
                        }}
                        className={inputClass}
                      />
                      <span className="text-muted shrink-0 text-[0.8rem]">pieces</span>
                    </div>
                  </Field>

                  {/* Pro feature for paid users: scrollable / slider batch size effect with live auto-updates */}
                  {(isPaid || !limits) && (
                    <div
                      className="border-forest/20 bg-forest/[0.04] rounded-xl border p-3.5 transition-colors"
                      onWheel={(e) => {
                        e.preventDefault();
                        const delta = e.deltaY < 0 ? 5 : -5;
                        updateBatchSize(targetYield + delta);
                      }}
                    >
                      <div className="flex items-center justify-between text-[0.78rem]">
                        <span className="text-forest flex items-center gap-1.5 font-semibold">
                          <Sparkles className="size-3.5" />
                          Live batch scaling
                        </span>
                        <span className="text-forest font-semibold tabular-nums">{targetYield} pieces</span>
                      </div>
                      <p className="text-muted mt-1 text-[0.72rem]">
                        Drag the slider or scroll mouse wheel to scale batch in real-time.
                      </p>
                      <input
                        type="range"
                        min={Math.max(1, Math.floor((originalYield || 10) * 0.2))}
                        max={Math.max(120, (originalYield || 10) * 5)}
                        step={1}
                        value={targetYield}
                        onChange={(e) => updateBatchSize(Number(e.target.value))}
                        className="accent-forest mt-2.5 h-1.5 w-full cursor-pointer"
                      />
                      <div className="text-muted mt-1.5 flex justify-between text-[0.68rem]">
                        <span>Small ({Math.max(1, Math.floor((originalYield || 10) * 0.2))})</span>
                        <button
                          type="button"
                          onClick={() => updateBatchSize(originalYield)}
                          className="text-forest hover:underline"
                        >
                          Original ({originalYield})
                        </button>
                        <span>Bulk ({Math.max(120, (originalYield || 10) * 5)})</span>
                      </div>
                    </div>
                  )}
                  <Field label="Wastage" hint="Optional: trimmings, spoilage, testing.">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={wastagePct || ""}
                        onChange={(e) => setWastagePct(Number(e.target.value))}
                        className={inputClass}
                      />
                      <span className="text-muted shrink-0 text-[0.8rem]">%</span>
                    </div>
                  </Field>
                  <div className="bg-forest/[0.06] rounded-xl px-4 py-3.5">
                    <p className="text-ink flex items-baseline justify-between text-[0.85rem] font-semibold">
                      Scaling factor
                      <span className="font-display text-[1.25rem]">{sums ? `${sums.scalingFactor.toFixed(2)}×` : "—"}</span>
                    </p>
                    <p className="text-muted mt-1 text-[0.72rem] leading-snug">
                      Multiply your original recipe&rsquo;s quantities by this to scale it up for reference.
                    </p>
                  </div>
                </Card>
              </Reveal>

              <Reveal delay={0.1}>
                <Card title="3. Costs per batch" icon={Percent}>
                  <Field label="Packaging cost" hint="Per piece.">
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0 text-[0.85rem]">{sym}</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={packagingPerPiece || ""}
                        onChange={(e) => setPackagingPerPiece(Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                  <Field label="Labour cost" hint="Flat, for the whole batch.">
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0 text-[0.85rem]">{sym}</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={labourCost || ""}
                        onChange={(e) => setLabourCost(Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                  <Field label="Electricity / gas" hint="Flat, for the whole batch.">
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0 text-[0.85rem]">{sym}</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={electricityCost || ""}
                        onChange={(e) => setElectricityCost(Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                  <Field label="Other expenses" hint="Anything else: delivery, misc.">
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0 text-[0.85rem]">{sym}</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={otherCost || ""}
                        onChange={(e) => setOtherCost(Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                </Card>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <Card title="4. Selling price & profit" icon={Scale}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Target gross profit margin">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={targetMargin || ""}
                        onChange={(e) => setTargetMargin(Number(e.target.value))}
                        className={inputClass}
                      />
                      <span className="text-muted shrink-0 text-[0.8rem]">%</span>
                    </div>
                  </Field>
                  <Field label="Actual selling price" hint="Optional. Leave blank to use the suggested price.">
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0 text-[0.85rem]">{sym}</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={actualSellingPrice || ""}
                        onChange={(e) => setActualSellingPrice(Number(e.target.value))}
                        placeholder={sums?.suggestedSellingPrice ? round2(sums.suggestedSellingPrice).toString() : "0"}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                </div>
                <div className="bg-forest/[0.06] mt-1 grid gap-4 rounded-xl px-5 py-4 sm:grid-cols-3">
                  <Stat label={`Revenue (${shown?.targetYield ?? 0} pieces)`} value={money(sums?.actualRevenue)} />
                  <Stat label="Gross profit" value={money(sums?.actualGrossProfit)} />
                  <Stat label="Gross margin" value={sums ? `${round2(sums.actualGrossMargin)}%` : "—"} />
                </div>
              </Card>
            </Reveal>
            <Reveal delay={0.2} className="print:hidden">
              <CalculateButton
                onClick={calculate}
                busy={calculating}
                again={result !== null}
                locked={locked}
                note={limits && !limits.calcUsed ? "Your free try includes one calculation." : undefined}
              />
            </Reveal>
          </fieldset>

          {/* Right column — sticky summary */}
          <aside className="mt-10 space-y-6 lg:sticky lg:top-28 lg:mt-0">
            <Reveal delay={0.05}>
              <div className="border-line/70 bg-cream-warm rounded-2xl border p-6 sm:p-7">
                <h2 className="text-ink text-[1.05rem] font-semibold">Cost summary</h2>
                <p className="text-muted mt-0.5 text-[0.72rem]">All values in {currency.code} ({currency.name})</p>
                {!result && (
                  <p className="text-muted mt-2 text-[0.82rem] leading-relaxed">
                    Fill in your recipe, then click <strong className="text-ink">Calculate</strong> to see your costs and
                    selling price.
                  </p>
                )}
                {changed && (
                  <p className="mt-2 rounded-lg bg-[var(--color-gold)]/15 px-3 py-2 text-[0.78rem] text-ink print:hidden">
                    You&rsquo;ve changed the recipe since this calculation. Click Calculate to update it.
                  </p>
                )}
                <div className="divide-line/40 mt-4 divide-y text-[0.85rem]">
                  <SummaryRow label="Total ingredient cost" value={money(sums?.ingredientCost)} />
                  <SummaryRow label={`Wastage (${shown?.wastagePct ?? wastagePct}%)`} value={money(sums?.wastageAmount)} />
                  <SummaryRow label="Ingredient cost with wastage" value={money(sums?.ingredientCostWithWastage)} />
                  <SummaryRow label="Packaging cost" value={money(sums?.packagingCost)} />
                  <SummaryRow label="Labour cost" value={money(shown?.labourCost)} />
                  <SummaryRow label="Electricity / gas" value={money(shown?.electricityCost)} />
                  <SummaryRow label="Other expenses" value={money(shown?.otherCost)} />
                </div>
                <div className="border-line/70 mt-2 flex items-center justify-between border-t pt-3.5">
                  <span className="text-ink text-[0.92rem] font-semibold">Total batch cost</span>
                  <span className="font-display text-ink text-[1.2rem] font-semibold">
                    {money(sums?.totalBatchCost)}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="bg-[var(--color-gold)]/15 rounded-xl px-4 py-3.5">
                    <p className="text-ink flex items-center gap-1 text-[0.78rem] font-semibold">Cost per piece</p>
                    <p className="text-muted text-[0.72rem]">{shown?.targetYield ?? targetYield} pieces</p>
                    <p className="font-display text-ink mt-1 text-[1.4rem] font-semibold">
                      {money(sums?.costPerPiece)}
                    </p>
                  </div>
                  <div className="bg-forest/10 border-forest/15 rounded-xl border px-4 py-3.5">
                    <p className="text-ink text-[0.78rem] font-semibold">Suggested selling price</p>
                    <p className="text-muted text-[0.72rem]">{shown?.targetMargin ?? targetMargin}% profit margin</p>
                    <p className="font-display text-forest mt-1 text-[1.4rem] font-semibold">
                      {money(sums?.suggestedSellingPrice)}
                    </p>
                  </div>
                </div>

                <div className="divide-line/40 mt-4 divide-y text-[0.85rem]">
                  <SummaryRow label="Profit per piece" value={money(sums?.profitPerPiece)} />
                  <SummaryRow label="Gross profit margin" value={shown ? `${shown.targetMargin}%` : "—"} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="print:hidden">
              <div className="border-line/70 bg-cream-warm rounded-2xl border p-6 sm:p-7">
                <h2 className="text-ink text-[1.05rem] font-semibold">Actions</h2>
                {limits && (
                  <p
                    className={cn(
                      "mt-2 flex items-center gap-1.5 text-[0.78rem]",
                      limits.exportUsed ? "text-muted" : "text-ink/70",
                    )}
                  >
                    {limits.exportUsed && <Lock className="size-3.5 shrink-0" />}
                    {limits.exportUsed
                      ? "Your free try's one export is used. Get the pass for unlimited exports."
                      : "Your free try includes one export: print, PDF or CSV."}
                  </p>
                )}
                {(!result || changed) && (
                  <p className="text-muted mt-2 text-[0.78rem]">
                    {result ? "Calculate again to export your latest numbers." : "Calculate first, then export."}
                  </p>
                )}
                <div className="mt-4 space-y-2.5">
                  <button
                    type="button"
                    disabled={exporting || !result || changed}
                    onClick={() => gated(printSheet)}
                    className="bg-forest text-cream hover:bg-forest-deep flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[0.85rem] font-medium transition-colors disabled:opacity-60"
                  >
                    {limits?.exportUsed ? <Lock className="size-4" /> : <Printer className="size-4" />}
                    Print / Save as PDF
                  </button>
                  <button
                    type="button"
                    disabled={exporting || !result || changed}
                    onClick={() => gated(exportCsv)}
                    className="border-forest/25 text-forest hover:bg-forest/5 flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-[0.85rem] font-medium transition-colors disabled:opacity-60"
                  >
                    {limits?.exportUsed ? <Lock className="size-4" /> : <Download className="size-4" />}
                    Export as CSV
                  </button>
                  <button
                    type="button"
                    onClick={resetAll}
                    disabled={locked}
                    className="text-muted hover:text-ink disabled:opacity-50 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[0.85rem] font-medium transition-colors"
                  >
                    <RotateCcw className="size-4" />
                    Reset all
                  </button>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CalculateButton({
  onClick,
  busy,
  again,
  locked,
  note,
}: {
  onClick: () => void;
  busy: boolean;
  again: boolean;
  locked: boolean;
  note?: string;
}) {
  return (
    <div className="space-y-2 text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={busy || locked}
        className="bg-forest text-cream hover:bg-forest-deep flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[1rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : locked ? <Lock className="size-4" /> : <Calculator className="size-4" />}
        {again ? "Calculate again" : "Calculate"}
      </button>
      {note && <p className="text-muted text-[0.78rem]">{note}</p>}
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: typeof Calculator; children: ReactNode }) {
  return (
    <div className="border-line/70 bg-cream-warm rounded-2xl border p-6 sm:p-7">
      <h2 className="text-ink flex items-center gap-2.5 text-[1.02rem] font-semibold">
        <Icon className="text-forest size-[1.1rem]" strokeWidth={1.6} aria-hidden="true" />
        {title}
      </h2>
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-ink block text-[0.82rem] font-medium">{label}</span>
      {children}
      {hint && <span className="text-muted block text-[0.72rem]">{hint}</span>}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted text-[0.72rem]">{label}</p>
      <p className="text-ink mt-0.5 text-[0.98rem] font-semibold">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-muted">{label}</span>
      <span className="text-ink font-medium">{value}</span>
    </div>
  );
}
