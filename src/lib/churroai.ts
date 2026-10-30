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
 * The visitor's currency and rate, or null in India / when unknown.
 * Detects USA and international visitors via Vercel IP country or accept-language headers.
 */
export async function fetchPriceEstimate(): Promise<PriceEstimate | null> {
  const h = await headers();
  const vercelCountry = (h.get("x-vercel-ip-country") ?? process.env.PRICE_ESTIMATE_COUNTRY ?? "").toUpperCase();
  const acceptLang = h.get("accept-language") ?? "";
  
  // If explicitly India or empty without US language preference, keep as India (INR)
  let country = vercelCountry;
  if (!country && /en-US/i.test(acceptLang)) {
    country = "US";
  }

  if (country === "IN" || !country) return null;

  const currency = CURRENCY_BY_COUNTRY[country] ?? "USD";
  const fallbackRates: Record<string, number> = {
    USD: 1 / 83.5,
    EUR: 0.92 / 83.5,
    GBP: 0.79 / 83.5,
    CAD: 1.36 / 83.5,
    AUD: 1.52 / 83.5,
  };

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR", {
      next: { revalidate: 12 * 60 * 60 },
      signal: AbortSignal.timeout(3000),
    });
    const data = (await res.json()) as { rates?: Record<string, number> };
    const rate = data.rates?.[currency];
    return typeof rate === "number" && rate > 0
      ? { currency, rate }
      : { currency, rate: fallbackRates[currency] ?? 1 / 83.5 };
  } catch {
    return { currency, rate: fallbackRates[currency] ?? 1 / 83.5 };
  }
}

/** The config plus the visitor's price estimate, for pages that show prices. */
export async function fetchAiConfigForVisitor(): Promise<AiConfig> {
  const [config, estimate] = await Promise.all([fetchAiConfig(), fetchPriceEstimate()]);
  return { ...config, estimate };
}
