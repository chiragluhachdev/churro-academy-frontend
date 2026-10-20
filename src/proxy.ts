import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Cheap gate, run before every request: bounces anonymous visitors away from
 * the admin area, and — when the admin has flipped maintenance mode on —
 * swaps every public page for the "we'll be back soon" one. Role (for the
 * admin gate) and the maintenance flag itself both live in the database, so
 * this talks to the backend directly rather than relying on shared modules,
 * per Next's own guidance for proxy files.
 */
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

const API_URL = process.env.API_URL ?? "http://localhost:4000";

/** Always reachable, maintenance or not — otherwise the admin could never sign back in to turn it off. */
const MAINTENANCE_EXEMPT_PREFIXES = ["/admin", "/login", "/api/auth", "/maintenance"];

async function isMaintenanceOn(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/content/site`, {
      next: { revalidate: 20 },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return false;
    const { site } = (await res.json()) as { site?: { maintenanceEnabled?: boolean } };
    return Boolean(site?.maintenanceEnabled);
  } catch {
    // A slow or unreachable backend must never lock real visitors out of the site.
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = SESSION_COOKIES.some((name) => request.cookies.has(name));

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminRoute && !signedIn) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // A signed-in admin always sees the real site, so they can check it over
  // before turning maintenance mode back off.
  const exempt = signedIn || MAINTENANCE_EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!exempt && (await isMaintenanceOn())) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
