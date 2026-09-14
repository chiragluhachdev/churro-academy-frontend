"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { confirmPaymentAction, startCheckoutAction } from "@/app/actions/checkout";
import type { CheckoutOrder } from "@/lib/api";
import { cn, formatPrice } from "@/lib/format";

type Stage = "loading" | "review" | "paying" | "success" | "error";

const METHODS = [
  { id: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "card", label: "Card", hint: "Credit or debit", icon: CreditCard },
  { id: "netbanking", label: "Net banking", hint: "All major banks", icon: Building2 },
] as const;

interface CheckoutModalProps {
  open: boolean;
  courseId: string;
  onClose: () => void;
}

/**
 * The dialog fetches a fresh order and resets its form every time it opens.
 * Rather than an effect that resets state on a prop change (which the
 * react-compiler lint rules flag, for good reason — it's an extra render),
 * the dialog's contents are only rendered while `open` is true and are keyed
 * by `session`, a counter bumped during render when `open` flips true. That
 * makes each open a genuinely fresh mount: state starts at its real initial
 * values and the one data-fetching effect below runs once, on that mount.
 */
export function CheckoutModal({ open, courseId, onClose }: CheckoutModalProps) {
  const reduceMotion = useReducedMotion();
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((n) => n + 1);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <CheckoutDialog key={session} courseId={courseId} onClose={onClose} reduceMotion={Boolean(reduceMotion)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CheckoutDialog({
  courseId,
  onClose,
  reduceMotion,
}: {
  courseId: string;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("upi");
  const [agreed, setAgreed] = useState(false);
  const [href, setHref] = useState<string>("");
  // Guards against a second click firing a second confirm before the first returns.
  const paying = useRef(false);

  const load = useCallback(async () => {
    const result = await startCheckoutAction(courseId);
    if (result.ok) {
      setOrder(result.data);
      setStage("review");
    } else {
      setError(result.error);
      setStage("error");
    }
  }, [courseId]);

  // Runs once, when this dialog instance mounts (a fresh open): fetches the
  // order to check out. The lint rule below is written for effects that
  // needlessly mirror a prop into state; this is a plain fetch-on-mount,
  // which has no non-effect equivalent here without pulling in a data
  // library, so it's intentionally exempted.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // Lock page scroll, focus the dialog, Escape closes (never mid-payment).
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && stage !== "paying") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [stage, onClose]);

  async function pay() {
    if (!order || paying.current || !agreed) return;
    paying.current = true;
    setStage("paying");
    setError(null);
    const result = await confirmPaymentAction(order.id);
    if (result.ok) {
      setHref(result.data.href);
      setStage("success");
      router.refresh();
    } else {
      paying.current = false;
      setError(result.error);
      setStage("review");
    }
  }

  function retry() {
    setStage("loading");
    setError(null);
    void load();
  }

  const locked = stage === "paying";

  return (
    <>
      <button
        type="button"
        aria-label="Close checkout"
        onClick={() => !locked && onClose()}
        className="bg-ink/50 absolute inset-0 backdrop-blur-sm"
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        tabIndex={-1}
        initial={reduceMotion ? undefined : { y: 40, opacity: 0 }}
        animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
        exit={reduceMotion ? undefined : { y: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-cream relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl shadow-2xl outline-none sm:max-w-[30rem] sm:rounded-3xl"
      >
      <header className="border-line/70 flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Lock className="text-forest size-4" />
          <h2 id="checkout-title" className="text-ink text-[1rem] font-semibold">
            {stage === "success" ? "Payment successful" : "Secure checkout"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={locked}
          aria-label="Close"
          className="text-muted hover:text-ink rounded-full p-1.5 transition-colors disabled:opacity-40"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {stage === "loading" && (
          <div className="flex flex-col items-center gap-3 px-6 py-16">
            <Loader2 className="text-forest size-7 animate-spin" />
            <p className="text-muted text-[0.9rem]">Preparing your order…</p>
          </div>
        )}

        {stage === "error" && (
          <div className="px-6 py-12 text-center">
            <AlertCircle className="mx-auto size-10 text-red-500" strokeWidth={1.5} />
            <p className="text-ink mt-4 font-medium">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" onClick={onClose} className="text-ink hover:bg-forest/5 rounded-full px-5 py-2.5 text-[0.9rem] font-medium">
                Close
              </button>
              <button type="button" onClick={retry} className="bg-forest text-cream hover:bg-forest-deep rounded-full px-5 py-2.5 text-[0.9rem] font-medium">
                Try again
              </button>
            </div>
          </div>
        )}

        {stage === "success" && order && (
          <div className="px-6 py-10 text-center">
            <motion.div
              initial={reduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
              animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="bg-forest/10 mx-auto flex size-16 items-center justify-center rounded-full"
            >
              <CheckCircle2 className="text-forest size-9" strokeWidth={1.6} />
            </motion.div>
            <p className="font-display text-ink mt-5 text-[1.6rem] font-medium">You&rsquo;re enrolled!</p>
            <p className="text-muted mx-auto mt-2 max-w-xs text-[0.9rem] leading-[1.6]">
              {order.course.title} is now in your dashboard. A receipt for {formatPrice(order.amount)} goes to {order.buyer.email}.
            </p>
            <button
              type="button"
              onClick={() => router.push(href)}
              className="bg-forest text-cream hover:bg-forest-deep mt-7 inline-flex rounded-full px-7 py-3 text-[0.95rem] font-medium transition-colors"
            >
              Start learning
            </button>
          </div>
        )}

        {(stage === "review" || stage === "paying") && order && (
          <div className="space-y-6 px-6 py-5">
            {order.testMode && (
              <p className="bg-gold/15 text-ink flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-[0.78rem] leading-snug">
                <AlertCircle className="text-gold mt-0.5 size-4 shrink-0" />
                Test mode — no real money is charged. Live payments switch on with Razorpay.
              </p>
            )}

            <div className="flex gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                <Image src={order.course.thumbnail} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-ink font-semibold leading-snug">{order.course.title}</p>
                <p className="text-muted mt-1 text-[0.8rem]">
                  {order.course.level} · {order.course.lessons} lessons{order.course.duration ? ` · ${order.course.duration}` : ""}
                </p>
                <p className="text-forest mt-1.5 text-[0.78rem] font-medium">Lifetime access</p>
              </div>
            </div>

            <dl className="border-line/70 space-y-2.5 rounded-2xl border p-4 text-[0.88rem]">
              <div className="flex justify-between">
                <dt className="text-muted">Course price</dt>
                <dd className="text-ink">{formatPrice(order.listPrice)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount</dt>
                  <dd className="text-forest">− {formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Taxes</dt>
                <dd className="text-ink">Included</dd>
              </div>
              <div className="border-line/70 flex items-baseline justify-between border-t pt-3">
                <dt className="text-ink font-semibold">Total</dt>
                <dd className="font-display text-ink text-[1.5rem] font-semibold">{formatPrice(order.amount)}</dd>
              </div>
            </dl>

            <div>
              <p className="text-ink text-[0.85rem] font-medium">Billed to</p>
              <p className="text-muted mt-1 text-[0.85rem]">
                {order.buyer.name} · {order.buyer.email}
              </p>
            </div>

            <fieldset>
              <legend className="text-ink text-[0.85rem] font-medium">Payment method</legend>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {METHODS.map(({ id, label, hint, icon: Icon }) => (
                  <label
                    key={id}
                    className={cn(
                      "flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors",
                      method === id ? "border-forest bg-forest/5" : "border-line/70 hover:border-forest/40",
                      locked && "pointer-events-none opacity-60",
                    )}
                  >
                    <input type="radio" name="method" value={id} checked={method === id} onChange={() => setMethod(id)} className="sr-only" />
                    <Icon className={cn("size-5", method === id ? "text-forest" : "text-muted")} strokeWidth={1.6} />
                    <span className="text-ink text-[0.8rem] font-medium">{label}</span>
                    <span className="text-muted text-[0.65rem] leading-tight">{hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {order.course.includedItems.length > 0 && (
              <ul className="space-y-1.5">
                {order.course.includedItems.slice(0, 4).map((item) => (
                  <li key={item} className="text-muted flex items-center gap-2 text-[0.8rem]">
                    <Check className="text-forest size-3.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            <label className="text-muted flex cursor-pointer items-start gap-2.5 text-[0.8rem] leading-snug select-none">
              <input type="checkbox" checked={agreed} disabled={locked} onChange={(e) => setAgreed(e.target.checked)} className="accent-forest mt-0.5 size-4 shrink-0" />
              <span>
                I agree to the <a href="/terms" target="_blank" className="text-forest underline">Terms</a> and{" "}
                <a href="/refunds" target="_blank" className="text-forest underline">Refund Policy</a>.
              </span>
            </label>

            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[0.82rem] text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {(stage === "review" || stage === "paying") && order && (
        <footer className="border-line/70 bg-cream-warm/60 border-t px-6 py-4">
          <button
            type="button"
            onClick={() => void pay()}
            disabled={!agreed || locked}
            className="bg-forest text-cream hover:bg-forest-deep inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55"
          >
            {locked ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing payment…
              </>
            ) : (
              <>
                <Lock className="size-4" />
                Confirm payment · {formatPrice(order.amount)}
              </>
            )}
          </button>
          <p className="text-muted mt-2.5 flex items-center justify-center gap-1.5 text-[0.7rem]">
            <ShieldCheck className="size-3.5" />
            Encrypted and processed securely
          </p>
        </footer>
      )}
      </motion.div>
    </>
  );
}
