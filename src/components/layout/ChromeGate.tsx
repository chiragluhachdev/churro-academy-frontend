"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The site is Churro AI for now: the home page, sign-in and calculator draw
 * their own header and footer, and the academy pages (courses, blog, chef…)
 * redirect home — see next.config.ts. Only the policy pages Razorpay needs
 * still borrow a shared frame, so that's the only place this renders.
 */
const FRAMED_ROUTES = ["/terms", "/privacy", "/refunds", "/contact"];

export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const framed = FRAMED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!framed) return null;
  return <>{children}</>;
}
