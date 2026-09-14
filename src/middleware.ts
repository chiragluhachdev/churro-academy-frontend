import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Cheap edge gate: bounce anonymous visitors away from the admin area before
 * it renders. It only checks that a session cookie exists — role is enforced
 * in the layout, which can read the database.
 */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = SESSION_COOKIES.some((name) => request.cookies.has(name));

  const isProtected = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isProtected && !signedIn) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
