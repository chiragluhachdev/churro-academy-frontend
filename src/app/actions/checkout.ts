"use server";

import { ApiError, api, type CheckoutOrder } from "@/lib/api";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export interface BuyerDetails {
  name: string;
  email: string;
  phone: string;
}

/**
 * Checkout is guest-only — there's no account to check a token against. The
 * browser only ever sends a course id and its own details; every price comes
 * back from the backend, never from the browser.
 */
export async function startCheckoutAction(courseId: string, buyer: BuyerDetails): Promise<Result<CheckoutOrder>> {
  try {
    const { order } = await api<{ order: CheckoutOrder }>("/orders", {
      method: "POST",
      body: { courseId, name: buyer.name, email: buyer.email, phone: buyer.phone },
    });
    return { ok: true, data: order };
  } catch (error) {
    return { ok: false, error: error instanceof ApiError ? error.message : "Couldn't start checkout. Please try again." };
  }
}

export async function confirmPaymentAction(orderId: string): Promise<Result<{ orderId: string }>> {
  try {
    const { orderId: id } = await api<{ ok: boolean; orderId: string }>(`/orders/${orderId}/confirm`, {
      method: "POST",
      // The dummy provider needs nothing. Razorpay will pass its payment id
      // and signature here, which the backend verifies.
      body: {},
    });
    return { ok: true, data: { orderId: id } };
  } catch (error) {
    return { ok: false, error: error instanceof ApiError ? error.message : "Payment couldn't be confirmed. You have not been charged." };
  }
}
