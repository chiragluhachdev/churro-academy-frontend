"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Routes that supply their own shell instead of the marketing chrome. */
const APP_ROUTES = ["/login", "/signup", "/dashboard"];

/**
 * Hides the marketing navbar and footer on the auth screens and the student
 * dashboard, which are laid out as product surfaces rather than pages of the
 * public site.
 */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAppRoute = APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAppRoute) return null;
  return <>{children}</>;
}
