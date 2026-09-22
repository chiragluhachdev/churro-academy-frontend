"use client";

/**
 * Thin wrapper around Razorpay's checkout.js — the widget itself, not our own
 * payment form. We only ever collect a course id and the buyer's own details;
 * card/UPI/netbanking details are entered inside Razorpay's own iframe and
 * never touch this app.
 */

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpayFailureResponse {
  error: { code: string; description: string; reason?: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loadPromise: Promise<void> | null = null;

/** Injects checkout.js once and resolves once `window.Razorpay` exists. */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in a browser."));
  if (window.Razorpay) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Couldn't load the payment widget.")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Couldn't load the payment widget. Check your connection and try again."));
    document.head.appendChild(script);
  }).catch((error) => {
    // A failed load shouldn't be cached — the next attempt should retry.
    loadPromise = null;
    throw error;
  });

  return loadPromise;
}

/**
 * `onFailure` fires while Razorpay's widget is still open (it shows its own
 * retry UI and doesn't close itself) — use it to remember why, not to close
 * anything. `options.modal.ondismiss` is the single source of truth for when
 * the widget actually closes, success or not.
 */
export async function openRazorpayCheckout(
  options: RazorpayOptions,
  onFailure?: (response: RazorpayFailureResponse) => void,
): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Payment widget failed to load.");
  const instance = new window.Razorpay(options);
  if (onFailure) instance.on("payment.failed", onFailure);
  instance.open();
}
