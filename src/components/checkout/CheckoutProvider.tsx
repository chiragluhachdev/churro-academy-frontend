"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import type { Course } from "@/types/course";

export type Viewer = "guest" | "admin";

interface CheckoutContextValue {
  viewer: Viewer;
  /** Runs the right action for whoever is looking: open checkout, or edit. */
  enroll: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function useCheckout() {
  const value = useContext(CheckoutContext);
  if (!value) throw new Error("useCheckout must be used inside <CheckoutProvider>.");
  return value;
}

interface CheckoutProviderProps {
  course: Course;
  viewer: Viewer;
  adminEditHref: string;
  /** The page was reached with ?enroll=1 (read server-side), e.g. from a marketing link. */
  autoOpen: boolean;
  children: ReactNode;
}

/**
 * One checkout modal per course page. The page shows an enroll button in both
 * the desktop card and the mobile bar — each in a container hidden at the other
 * breakpoint — so the modal lives here, outside both, and they share it.
 *
 * There's no account to check ownership against (checkout is guest-only), so
 * enrolling always just opens the modal for anyone but the admin.
 */
export function CheckoutProvider({ course, viewer, adminEditHref, autoOpen, children }: CheckoutProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Computed once, from the server-read ?enroll=1 — not reacted to via an
  // effect, so there's no extra render and nothing for the
  // react-hooks/set-state-in-effect rule to flag.
  const [open, setOpen] = useState(() => autoOpen && viewer === "guest");
  const urlTidied = useRef(false);

  const enroll = useCallback(() => {
    if (viewer === "admin") return router.push(adminEditHref);
    setOpen(true);
  }, [viewer, router, adminEditHref]);

  // Strip ?enroll=1 from the address bar, once, after the initial open above
  // has already been decided from it. No state to set here — just history.
  useEffect(() => {
    if (urlTidied.current || !autoOpen) return;
    urlTidied.current = true;
    router.replace(pathname, { scroll: false });
  }, [autoOpen, router, pathname]);

  return (
    <CheckoutContext.Provider value={{ viewer, enroll }}>
      {children}
      {viewer === "guest" && <CheckoutModal open={open} course={course} onClose={() => setOpen(false)} />}
    </CheckoutContext.Provider>
  );
}
