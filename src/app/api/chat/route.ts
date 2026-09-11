import { NextResponse } from "next/server";

import { ApiError, api } from "@/lib/api";

/**
 * Proxies the chat widget to the Express API so API_URL stays server-side.
 *
 * Upstream errors are never passed through verbatim — a visitor should not see
 * "Not found." because a backend is undeployed. Every failure becomes the same
 * friendly line pointing at the WhatsApp fallback, with the real cause logged.
 */
export async function POST(request: Request) {
  try {
    const data = await api<{ reply: string; source: "llm" | "local" }>("/chat", {
      method: "POST",
      body: await request.json(),
    });
    return NextResponse.json(data);
  } catch (error) {
    const detail =
      error instanceof ApiError ? `${error.status} ${error.message}` : String(error);
    console.error("[chat] upstream failed:", detail);

    return NextResponse.json(
      {
        reply:
          "Sorry — I can't reach the kitchen right now. Tap the WhatsApp button below and the team will help you straight away.",
        source: "local" as const,
      },
      { status: 200 },
    );
  }
}
