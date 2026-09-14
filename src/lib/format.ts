/** Renders whole rupees as e.g. "₹1,999" — no trailing decimals. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Same, but keeps paise — for a GST breakdown, where course prices (always
 * whole rupees) get divided out into a taxable value and tax, and rounding
 * those to whole rupees would make the line items stop summing to the total.
 */
export function formatPricePrecise(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Compact review counts: 1284 -> "1.3k". */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Minutes as "1h 20m" / "45m". 0 or less renders as "". */
export function formatMinutes(mins: number): string {
  if (mins <= 0) return "";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** e.g. "18 Aug 2026". Accepts an ISO string. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
