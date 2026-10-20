"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Calculator,
  Download,
  Percent,
  Plus,
  Printer,
  RotateCcw,
  Scale,
  Trash2,
} from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { cn, formatPricePrecise } from "@/lib/format";

const inputClass =
  "w-full rounded-xl border border-line/60 bg-cream px-3.5 py-2.5 text-[0.86rem] text-ink transition-colors placeholder:text-muted/50 focus:border-forest/50 focus:outline-none";

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

function costUsed(ing: Ingredient): number {
  if (!ing.purchaseQty) return 0;
  return (ing.qtyUsed / ing.purchaseQty) * ing.purchasePrice;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function CostCalculator() {
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

  const setIngredient = (id: string, patch: Partial<Ingredient>) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addIngredient = () =>
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", qtyUsed: 0, unit: "g", purchaseQty: 0, purchasePrice: 0 },
    ]);

  const removeIngredient = (id: string) => setIngredients((prev) => prev.filter((i) => i.id !== id));

  const sums = useMemo(() => {
    const ingredientCost = ingredients.reduce((sum, ing) => sum + costUsed(ing), 0);
    const wastageAmount = ingredientCost * (wastagePct / 100);
    const ingredientCostWithWastage = ingredientCost + wastageAmount;
    const packagingCost = packagingPerPiece * targetYield;
    const totalBatchCost = ingredientCostWithWastage + packagingCost + labourCost + electricityCost + otherCost;
    const costPerPiece = targetYield > 0 ? totalBatchCost / targetYield : 0;
    const marginFraction = Math.min(targetMargin, 99) / 100;
    const suggestedSellingPrice = marginFraction < 1 ? costPerPiece / (1 - marginFraction) : 0;
    const profitPerPiece = suggestedSellingPrice - costPerPiece;
    const scalingFactor = originalYield > 0 ? targetYield / originalYield : 0;

    const effectivePrice = actualSellingPrice > 0 ? actualSellingPrice : suggestedSellingPrice;
    const actualRevenue = effectivePrice * targetYield;
    const actualGrossProfit = actualRevenue - totalBatchCost;
    const actualGrossMargin = actualRevenue > 0 ? (actualGrossProfit / actualRevenue) * 100 : 0;

    return {
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
  }, [
    ingredients,
    wastagePct,
    packagingPerPiece,
    targetYield,
    labourCost,
    electricityCost,
    otherCost,
    targetMargin,
    originalYield,
    actualSellingPrice,
  ]);

  function resetAll() {
    if (!window.confirm("Reset the calculator? Everything you've entered will be cleared.")) return;
    setIngredients(DEFAULTS.ingredients.map((i) => ({ ...i })));
    setOriginalYield(DEFAULTS.originalYield);
    setTargetYield(DEFAULTS.targetYield);
    setWastagePct(DEFAULTS.wastagePct);
    setPackagingPerPiece(DEFAULTS.packagingPerPiece);
    setLabourCost(DEFAULTS.labourCost);
    setElectricityCost(DEFAULTS.electricityCost);
    setOtherCost(DEFAULTS.otherCost);
    setTargetMargin(DEFAULTS.targetMargin);
    setActualSellingPrice(DEFAULTS.actualSellingPrice);
  }

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Ingredient", "Qty used", "Unit", "Purchase qty", "Price paid (INR)", "Cost used (INR)"],
      ...ingredients.map((ing) => [
        ing.name || "Untitled",
        ing.qtyUsed,
        ing.unit,
        ing.purchaseQty,
        round2(ing.purchasePrice),
        round2(costUsed(ing)),
      ]),
      [],
      ["Total ingredient cost", "", "", "", "", round2(sums.ingredientCost)],
      [`Wastage (${wastagePct}%)`, "", "", "", "", round2(sums.wastageAmount)],
      ["Ingredient cost with wastage", "", "", "", "", round2(sums.ingredientCostWithWastage)],
      ["Packaging cost", "", "", "", "", round2(sums.packagingCost)],
      ["Labour cost", "", "", "", "", round2(labourCost)],
      ["Electricity / gas", "", "", "", "", round2(electricityCost)],
      ["Other expenses", "", "", "", "", round2(otherCost)],
      ["Total batch cost", "", "", "", "", round2(sums.totalBatchCost)],
      [`Cost per piece (${targetYield} pieces)`, "", "", "", "", round2(sums.costPerPiece)],
      [`Suggested selling price (${targetMargin}% margin)`, "", "", "", "", round2(sums.suggestedSellingPrice)],
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

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:py-16">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-12 xl:gap-16">
          {/* Left column */}
          <div className="space-y-8">
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
                        <th className="px-3 py-2.5">Price paid (₹)</th>
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
                              value={ing.qtyUsed || ""}
                              onChange={(e) => setIngredient(ing.id, { qtyUsed: Number(e.target.value) })}
                              className={cn(inputClass, "w-20 py-2 text-center")}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={ing.unit}
                              onChange={(e) => setIngredient(ing.id, { unit: e.target.value })}
                              className={cn(inputClass, "w-20 py-2")}
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
                              value={ing.purchaseQty || ""}
                              onChange={(e) => setIngredient(ing.id, { purchaseQty: Number(e.target.value) })}
                              className={cn(inputClass, "w-20 py-2 text-center")}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              value={ing.purchasePrice || ""}
                              onChange={(e) => setIngredient(ing.id, { purchasePrice: Number(e.target.value) })}
                              className={cn(inputClass, "w-24 py-2 text-center")}
                            />
                          </td>
                          <td className="text-ink px-3 py-2 text-right font-medium whitespace-nowrap">
                            {formatPricePrecise(round2(costUsed(ing)))}
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
                  Qty used and purchase qty should share the same unit — cost used is purchase price ×
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
                        onChange={(e) => setTargetYield(Number(e.target.value))}
                        className={inputClass}
                      />
                      <span className="text-muted shrink-0 text-[0.8rem]">pieces</span>
                    </div>
                  </Field>
                  <Field label="Wastage" hint="Optional — trimmings, spoilage, testing.">
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
                      <span className="font-display text-[1.25rem]">{sums.scalingFactor.toFixed(2)}×</span>
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
                      <span className="text-muted shrink-0 text-[0.85rem]">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={packagingPerPiece || ""}
                        onChange={(e) => setPackagingPerPiece(Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                  <Field label="Labour cost" hint="Flat, for the whole batch.">
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0 text-[0.85rem]">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={labourCost || ""}
                        onChange={(e) => setLabourCost(Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                  <Field label="Electricity / gas" hint="Flat, for the whole batch.">
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0 text-[0.85rem]">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={electricityCost || ""}
                        onChange={(e) => setElectricityCost(Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                  <Field label="Other expenses" hint="Anything else — delivery, misc.">
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0 text-[0.85rem]">₹</span>
                      <input
                        type="number"
                        min={0}
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
                  <Field label="Actual selling price" hint="Optional — leave blank to use the suggested price.">
                    <div className="flex items-center gap-2">
                      <span className="text-muted shrink-0 text-[0.85rem]">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={actualSellingPrice || ""}
                        onChange={(e) => setActualSellingPrice(Number(e.target.value))}
                        placeholder={sums.suggestedSellingPrice ? round2(sums.suggestedSellingPrice).toString() : "0"}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                </div>
                <div className="bg-forest/[0.06] mt-1 grid gap-4 rounded-xl px-5 py-4 sm:grid-cols-3">
                  <Stat label={`Revenue (${targetYield || 0} pieces)`} value={formatPricePrecise(round2(sums.actualRevenue))} />
                  <Stat label="Gross profit" value={formatPricePrecise(round2(sums.actualGrossProfit))} />
                  <Stat label="Gross margin" value={`${round2(sums.actualGrossMargin)}%`} />
                </div>
              </Card>
            </Reveal>
          </div>

          {/* Right column — sticky summary */}
          <aside className="mt-10 space-y-6 lg:sticky lg:top-28 lg:mt-0">
            <Reveal delay={0.05}>
              <div className="border-line/70 bg-cream-warm rounded-2xl border p-6 sm:p-7">
                <h2 className="text-ink text-[1.05rem] font-semibold">Cost summary</h2>
                <div className="divide-line/40 mt-4 divide-y text-[0.85rem]">
                  <SummaryRow label="Total ingredient cost" value={formatPricePrecise(round2(sums.ingredientCost))} />
                  <SummaryRow label={`Wastage (${wastagePct}%)`} value={formatPricePrecise(round2(sums.wastageAmount))} />
                  <SummaryRow label="Ingredient cost with wastage" value={formatPricePrecise(round2(sums.ingredientCostWithWastage))} />
                  <SummaryRow label="Packaging cost" value={formatPricePrecise(round2(sums.packagingCost))} />
                  <SummaryRow label="Labour cost" value={formatPricePrecise(round2(labourCost))} />
                  <SummaryRow label="Electricity / gas" value={formatPricePrecise(round2(electricityCost))} />
                  <SummaryRow label="Other expenses" value={formatPricePrecise(round2(otherCost))} />
                </div>
                <div className="border-line/70 mt-2 flex items-center justify-between border-t pt-3.5">
                  <span className="text-ink text-[0.92rem] font-semibold">Total batch cost</span>
                  <span className="font-display text-ink text-[1.2rem] font-semibold">
                    {formatPricePrecise(round2(sums.totalBatchCost))}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="bg-[var(--color-gold)]/15 rounded-xl px-4 py-3.5">
                    <p className="text-ink flex items-center gap-1 text-[0.78rem] font-semibold">Cost per piece</p>
                    <p className="text-muted text-[0.72rem]">{targetYield || 0} pieces</p>
                    <p className="font-display text-ink mt-1 text-[1.4rem] font-semibold">
                      {formatPricePrecise(round2(sums.costPerPiece))}
                    </p>
                  </div>
                  <div className="bg-forest/10 border-forest/15 rounded-xl border px-4 py-3.5">
                    <p className="text-ink text-[0.78rem] font-semibold">Suggested selling price</p>
                    <p className="text-muted text-[0.72rem]">{targetMargin || 0}% profit margin</p>
                    <p className="font-display text-forest mt-1 text-[1.4rem] font-semibold">
                      {formatPricePrecise(round2(sums.suggestedSellingPrice))}
                    </p>
                  </div>
                </div>

                <div className="divide-line/40 mt-4 divide-y text-[0.85rem]">
                  <SummaryRow label="Profit per piece" value={formatPricePrecise(round2(sums.profitPerPiece))} />
                  <SummaryRow label="Gross profit margin" value={`${targetMargin || 0}%`} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="print:hidden">
              <div className="border-line/70 bg-cream-warm rounded-2xl border p-6 sm:p-7">
                <h2 className="text-ink text-[1.05rem] font-semibold">Actions</h2>
                <div className="mt-4 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-forest text-cream hover:bg-forest-deep flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[0.85rem] font-medium transition-colors"
                  >
                    <Printer className="size-4" />
                    Print / Save as PDF
                  </button>
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="border-forest/25 text-forest hover:bg-forest/5 flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-[0.85rem] font-medium transition-colors"
                  >
                    <Download className="size-4" />
                    Export as CSV
                  </button>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="text-muted hover:text-ink flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[0.85rem] font-medium transition-colors"
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
