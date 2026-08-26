import { NextResponse } from "next/server";

import { ApiError, api } from "@/lib/api";
import { getSession } from "@/lib/session";

/**
 * Proxies profile updates to the Express API. Going through the server keeps
 * the backend access token inside the httpOnly session cookie — it is never
 * handed to the browser.
 */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  try {
    const data = await api<{ user: unknown; token: string }>("/auth/me", {
      method: "PATCH",
      body: await request.json(),
      token: session.accessToken,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not save changes." }, { status: 500 });
  }
}
