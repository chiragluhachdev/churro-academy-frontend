/** Churro AI types and pure helpers — safe in client components (no server-only imports). */

export interface AiConfig {
  calculatorEnabled: boolean;
  passName: string;
  /** Whole rupees, GST inclusive. */
  passPrice: number;
  passDays: number;
  freeTries: number;
  trialMinutes: number;
}

export type AiAccess = "pass" | "trial" | "trial_available" | "locked";

export interface AiMember {
  id: string;
  /** The sign-in identity. */
  email: string;
  /** Only on early members, who signed in by phone before email sign-in. */
  phone: string;
  name: string;
  access: AiAccess;
  freeTriesUsed: number;
  freeTriesLeft: number;
  trialEndsAt?: string;
  passExpiresAt?: string;
  lastLoginAt?: string;
  joinedAt?: string;
}

/** A pass purchase in progress, as the paywall needs it. */
export interface AiPassOrder {
  id: string;
  status: string;
  provider: "dummy" | "razorpay";
  testMode: boolean;
  amount: number;
  currency: string;
  passName: string;
  passDays: number;
  gst: { gstAmount: number; taxableValue: number; gstRate: number };
  /** Razorpay's own order id and publishable key — empty in test mode. */
  providerOrderId: string;
  razorpayKeyId: string;
  buyer: { name: string; email: string; phone: string };
  seller: { companyName: string };
}

export const AI_DEFAULT_CONFIG: AiConfig = {
  calculatorEnabled: false,
  passName: "Churro AI Pass",
  passPrice: 999,
  passDays: 365,
  freeTries: 1,
  trialMinutes: 60,
};

/** 365 → "year", 730 → "2 years", 30 → "30 days" — reads as "₹999 / year". */
export function passLength(days: number): string {
  if (days % 365 === 0) return days === 365 ? "year" : `${days / 365} years`;
  return `${days} days`;
}

/** "9876543210" → "+91 98765 43210". */
export function formatPhone(phone: string): string {
  return phone.length === 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : phone;
}

export function formatTrialLength(minutes: number): string {
  if (minutes % 60 === 0) return minutes === 60 ? "1 hour" : `${minutes / 60} hours`;
  return `${minutes} minutes`;
}
