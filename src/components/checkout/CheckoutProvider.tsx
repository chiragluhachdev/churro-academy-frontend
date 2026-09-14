"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { CheckoutModal } from "@/components/checkout/CheckoutModal";

export type Viewer = "guest" | "student" | "admin";

interface CheckoutContextValue {
  viewer: Viewer;
  owned: boolean;
  playerHref: string;
  adminEditHref: string;
  /** Runs the right action for whoever is looking: log in, pay, or open. */
  enroll: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function useCheckout() {
  const value = useContext(CheckoutContext);
  if (!value) throw new Error("useCheckout must be used inside <CheckoutProvider>.");
  return value;
}

interface CheckoutProviderProps {
  courseId: string;
  viewer: Viewer;
  owned: boolean;
  playerHref: string;
  adminEditHref: string;
  /** The page was reached with ?enroll=1 (read server-side, so no Suspense boundary is needed). */
  autoOpen: boolean;
  children: ReactNode;
}

/**
 * One checkout modal per course page. The page shows an enroll button in both
 * the desktop card and the mobile bar — each in a container hidden at the other
 * breakpoint — so the modal lives here, outside both, and they share it.
 */
export function CheckoutProvider({ courseId, viewer, owned, playerHref, adminEditHref, autoOpen, children }: CheckoutProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Computed once, from the server-read ?enroll=1 — not reacted to via an
  // effect, so there's no extra render and nothing for the
  // react-hooks/set-state-in-effect rule to flag.
  const [open, setOpen] = useState(() => autoOpen && viewer === "student" && !owned);
  const urlTidied = useRef(false);

  const enroll = useCallback(() => {
    if (owned) return router.push(playerHref);
    if (viewer === "admin") return router.push(adminEditHref);
    if (viewer === "guest") {
      // Come back to this page with the checkout already open.
      router.push(`/login?next=${encodeURIComponent(`${pathname}?enroll=1`)}`);
      return;
    }
    setOpen(true);
  }, [owned, viewer, router, pathname, playerHref, adminEditHref]);

  // Strip ?enroll=1 from the address bar, once, after the initial open above
  // has already been decided from it. No state to set here — just history.
  useEffect(() => {
    if (urlTidied.current || !autoOpen) return;
    urlTidied.current = true;
    router.replace(pathname, { scroll: false });
  }, [autoOpen, router, pathname]);

  return (
    <CheckoutContext.Provider value={{ viewer, owned, playerHref, adminEditHref, enroll }}>
      {children}
      {viewer === "student" && !owned && (
        <CheckoutModal open={open} courseId={courseId} onClose={() => setOpen(false)} />
      )}
    </CheckoutContext.Provider>
  );
}
