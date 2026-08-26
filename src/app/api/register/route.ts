import { NextResponse } from "next/server";

import { ApiError, api } from "@/lib/api";

/** Proxies account creation to the Express API. */
export async function POST(request: Request) {
  try {
    const data = await api<{ user: { username: string } }>("/auth/register", {
      method: "POST",
      body: await request.json(),
    });
    return NextResponse.json({ ok: true, username: data.user.username }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Could not reach the server. Is the backend running?" },
      { status: 502 },
    );
  }
}
