import { cookies, headers } from "next/headers";

import { ApiError, api } from "@/lib/api";
import { AI_DEFAULT_CONFIG, type AiConfig, type AiMember, type PriceEstimate } from "@/lib/churroaiShared";

/**
 * Churro AI's own session — an httpOnly cookie holding the backend's member
 * token, set and cleared only by server actions. Entirely separate from the
 * admin's NextAuth session. Server-only: client components use churroaiShared.
 */
export const AI_SESSION_COOKIE = "churroai_session";
export const AI_CACHE_TAG = "ai";

export async function fetchAiConfig(): Promise<AiConfig> {
  try {
    const { config } = await api<{ config: AiConfig }>("/ai/config", { revalidate: 60, tags: [AI_CACHE_TAG] });
    return config;
  } catch {
    return AI_DEFAULT_CONFIG;
  }
}

export async function getAiToken(): Promise<string | null> {
  return (await cookies()).get(AI_SESSION_COOKIE)?.value ?? null;
}

/** The signed-in member, or null when signed out or the session has lapsed. */
export async function fetchAiMember(): Promise<AiMember | null> {
  const token = await getAiToken();
  if (!token) return null;
  try {
    const { member } = await api<{ member: AiMember }>("/ai/me", { token });
    return member;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/** Country (ISO code, as Vercel reports it) → currency, for the price estimate. Anything unlisted shows ₹ only. */
const EURO = ["AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK"];
const CURRENCY_BY_COUNTRY: Record<string, string> = {
  ...Object.fromEntries(EURO.map((c) => [c, "EUR"])),
  US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", NZ: "NZD", SG: "SGD", AE: "AED", SA: "SAR", QA: "QAR",
  KW: "KWD", OM: "OMR", BH: "BHD", MY: "MYR", TH: "THB", ID: "IDR", PH: "PHP", JP: "JPY", KR: "KRW",
  CN: "CNY", HK: "HKD", TW: "TWD", NP: "NPR", LK: "LKR", BD: "BDT", PK: "PKR", ZA: "ZAR", NG: "NGN",
  KE: "KES", EG: "EGP", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK", HU: "HUF",
  RO: "RON", TR: "TRY", IL: "ILS", BR: "BRL", MX: "MXN", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN",
  MU: "MUR", MV: "MVR", FJ: "FJD",
};

/**
 * The visitor's currency and today's rate, or null in India / when unknown.
 * Purely a display estimate — Razorpay always charges ₹, and the buyer's
 * bank or Razorpay's own conversion sets the final amount. PRICE_ESTIMATE_COUNTRY
 * fakes a country locally (e.g. "US"), since there's no Vercel header there.
 */
export async function fetchPriceEstimate(): Promise<PriceEstimate | null> {
  const country = ((await headers()).get("x-vercel-ip-country") ?? process.env.PRICE_ESTIMATE_COUNTRY ?? "").toUpperCase();
  const currency = CURRENCY_BY_COUNTRY[country];
  if (!currency) return null;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR", {
      next: { revalidate: 12 * 60 * 60 },
      signal: AbortSignal.timeout(3000),
    });
    const data = (await res.json()) as { rates?: Record<string, number> };
    const rate = data.rates?.[currency];
    return typeof rate === "number" && rate > 0 ? { currency, rate } : null;
  } catch {
    return null;
  }
}

/** The config plus the visitor's price estimate, for pages that show prices. */
export async function fetchAiConfigForVisitor(): Promise<AiConfig> {
  const [config, estimate] = await Promise.all([fetchAiConfig(), fetchPriceEstimate()]);
  return { ...config, estimate };
}
