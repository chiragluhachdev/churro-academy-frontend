"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Honours "Reduce motion" globally: transforms are skipped, fades still play.
 * Components must not branch on useReducedMotion() while rendering — the server
 * can't know the preference, so the markup would differ, React keeps the
 * server's `opacity: 0` and the content never appears.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
