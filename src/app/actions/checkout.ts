"use server";

import { revalidatePath } from "next/cache";

import { ApiError, api, type CheckoutOrder } from "@/lib/api";
import { getSession } from "@/lib/session";

type Result<T> = { ok: true; data: T } | { ok: false; error: string; code?: "auth" | "admin" | "owned" };

/**
 * Checkout runs through the server so the backend token never reaches the
 * browser. The browser only ever sends a course id and an order id — never a
 * price; every amount comes back from the backend.
 */
export async function startCheckoutAction(courseId: string): Promise<Result<CheckoutOrder>> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to enroll.", code: "auth" };
  if (session.user.role !== "student") {
    return { ok: false, error: "Admin accounts can't enroll. Sign in with a student account to buy.", code: "admin" };
  }
  try {
    const { order } = await api<{ order: CheckoutOrder }>("/orders", {
      method: "POST",
      token: session.accessToken,
      body: { courseId },
    });
    return { ok: true, data: order };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message, code: error.status === 409 && /own/i.test(error.message) ? "owned" : undefined };
    }
    return { ok: false, error: "Couldn't start checkout. Please try again." };
  }
}

export async function confirmPaymentAction(orderId: string): Promise<Result<{ href: string }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Your session ended. Sign in again.", code: "auth" };
  if (session.user.role !== "student") return { ok: false, error: "Admin accounts can't enroll.", code: "admin" };

  try {
    const { slug } = await api<{ ok: boolean; slug?: string }>(`/orders/${orderId}/confirm`, {
      method: "POST",
      token: session.accessToken,
      // The dummy provider needs nothing. Razorpay will pass its payment id
      // and signature here, which the backend verifies.
      body: {},
    });
    const base = `/${session.user.username}/dashboard`;
    revalidatePath(base, "layout");
    return { ok: true, data: { href: slug ? `${base}/courses/${slug}` : `${base}/courses` } };
  } catch (error) {
    return { ok: false, error: error instanceof ApiError ? error.message : "Payment couldn't be confirmed. You have not been charged." };
  }
}
