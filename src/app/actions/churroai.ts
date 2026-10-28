"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, api } from "@/lib/api";
import { AI_SESSION_COOKIE, getAiToken } from "@/lib/churroai";
import type { AiMember, AiPassOrder } from "@/lib/churroaiShared";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const errorText = (error: unknown, fallback: string) => (error instanceof ApiError ? error.message : fallback);

export async function requestOtpAction(email: string): Promise<Result<{ email: string }>> {
  try {
    const data = await api<{ email: string }>("/ai/auth/request-otp", { method: "POST", body: { email } });
    return { ok: true, data: { email: data.email } };
  } catch (error) {
    return { ok: false, error: errorText(error, "Couldn't send a code. Please try again.") };
  }
}

/** Verifies the code and starts the session. The token goes into an httpOnly cookie and never reaches the browser's JS. */
export async function verifyOtpAction(email: string, code: string): Promise<Result<AiMember>> {
  try {
    const { token, member } = await api<{ token: string; member: AiMember }>("/ai/auth/verify-otp", {
      method: "POST",
      body: { email, code },
    });
    (await cookies()).set(AI_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return { ok: true, data: member };
  } catch (error) {
    return { ok: false, error: errorText(error, "Couldn't verify that code. Please try again.") };
  }
}

export async function signOutAction(): Promise<void> {
  (await cookies()).delete(AI_SESSION_COOKIE);
  redirect("/");
}

async function asMember<T>(call: (token: string) => Promise<T>, fallback: string): Promise<Result<T>> {
  const token = await getAiToken();
  if (!token) return { ok: false, error: "Please sign in to Churro AI." };
  try {
    return { ok: true, data: await call(token) };
  } catch (error) {
    return { ok: false, error: errorText(error, fallback) };
  }
}

export async function startTrialAction(): Promise<Result<AiMember>> {
  return asMember(
    (token) => api<{ member: AiMember }>("/ai/trial/start", { method: "POST", token }).then((r) => r.member),
    "Couldn't start your free try. Please try again.",
  );
}

export async function startPassOrderAction(buyer: { name: string; email: string }): Promise<Result<AiPassOrder>> {
  return asMember(
    (token) => api<{ order: AiPassOrder }>("/ai/orders", { method: "POST", token, body: buyer }).then((r) => r.order),
    "Couldn't start checkout. Please try again.",
  );
}

export interface RazorpayResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export async function confirmPassAction(orderId: string, razorpay?: RazorpayResult): Promise<Result<AiMember>> {
  return asMember(
    (token) =>
      api<{ member: AiMember }>(`/ai/orders/${orderId}/confirm`, { method: "POST", token, body: razorpay ?? {} }).then(
        (r) => r.member,
      ),
    "Payment couldn't be confirmed. If money left your account, message us and we'll sort it out.",
  );
}
