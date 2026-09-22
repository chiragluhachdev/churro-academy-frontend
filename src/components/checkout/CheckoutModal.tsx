"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { confirmPaymentAction, startCheckoutAction, type RazorpayPaymentResult } from "@/app/actions/checkout";
import type { CheckoutOrder } from "@/lib/api";
import { cn, formatPrice, formatPricePrecise } from "@/lib/format";
import { openRazorpayCheckout } from "@/lib/razorpay";
import type { Course } from "@/types/course";

type Stage = "details" | "review" | "paying" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,19}$/;

const METHODS = [
  { id: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "card", label: "Card", hint: "Credit or debit", icon: CreditCard },
  { id: "netbanking", label: "Net banking", hint: "All major banks", icon: Building2 },
] as const;

interface CheckoutModalProps {
  open: boolean;
  course: Course;
  onClose: () => void;
}

/**
 * The dialog resets to a blank details form every time it opens. Rather than
 * an effect that resets state on a prop change (which the react-compiler
 * lint rules flag, for good reason — it's an extra render), the dialog's
 * contents are only rendered while `open` is true and are keyed by
 * `session`, a counter bumped during render when `open` flips true. That
 * makes each open a genuinely fresh mount, state starting at its real
 * initial values.
 */
export function CheckoutModal({ open, course, onClose }: CheckoutModalProps) {
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
          <CheckoutDialog key={session} course={course} onClose={onClose} reduceMotion={Boolean(reduceMotion)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CheckoutDialog({
  course,
  onClose,
  reduceMotion,
}: {
  course: Course;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("details");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [submittingDetails, setSubmittingDetails] = useState(false);

  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("upi");
  const [agreed, setAgreed] = useState(false);
  // Guards against a second click firing a second confirm before the first returns.
  const paying = useRef(false);

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: typeof fieldErrors = {};
    if (name.trim().length < 2) errors.name = "Enter your name.";
    if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
    if (!PHONE_RE.test(phone.trim())) errors.phone = "Enter a WhatsApp number we can reach you on.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmittingDetails(true);
    setError(null);
    const result = await startCheckoutAction(course.id, { name: name.trim(), email: email.trim(), phone: phone.trim() });
    setSubmittingDetails(false);
    if (result.ok) {
      setOrder(result.data);
      setStage("review");
    } else {
      setError(result.error);
    }
  }

  async function finishPayment(orderId: string, razorpay?: RazorpayPaymentResult) {
    const result = await confirmPaymentAction(orderId, razorpay);
    // Set before the stage flip: a still-open Razorpay widget's `ondismiss`
    // checks this flag, and must see "no longer mid-payment" the instant it fires.
    paying.current = false;
    if (result.ok) {
      setStage("success");
    } else {
      setError(result.error);
      setStage("review");
    }
  }

  async function pay() {
    if (!order || paying.current || !agreed) return;
    paying.current = true;
    setStage("paying");
    setError(null);

    if (order.testMode) {
      void finishPayment(order.id);
      return;
    }

    // Live Razorpay: open its widget. Everything past this point happens in
    // its own callbacks — card/UPI details are entered there, never here.
    try {
      await openRazorpayCheckout(
        {
          key: order.razorpayKeyId,
          amount: Math.round(order.amount * 100),
          currency: order.currency,
          name: order.seller.companyName,
          description: order.course.title,
          order_id: order.providerOrderId,
          prefill: { name: order.buyer.name, email: order.buyer.email, contact: order.buyer.phone },
          theme: { color: "#294B32" },
          handler: (response) => void finishPayment(order.id, response),
          modal: {
            // Fires on a user-closed widget — success already moved on and
            // cleared `paying.current` by the time this could ever see it true.
            ondismiss: () => {
              if (paying.current) {
                paying.current = false;
                setStage("review");
              }
            },
          },
        },
        (failure) => setError(failure.error?.description || "Payment failed. You can try again."),
      );
    } catch (err) {
      paying.current = false;
      setError(err instanceof Error ? err.message : "Couldn't open the payment window. Please try again.");
      setStage("review");
    }
  }

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

  const locked = stage === "paying";
  const price = course.discountPrice ?? course.price;

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
              {stage === "success" ? "Payment successful" : "Enroll"}
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
          {stage === "details" && (
            <form onSubmit={submitDetails} noValidate className="space-y-5 px-6 py-5">
              <div className="flex gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                  <Image src={course.thumbnail} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-ink leading-snug font-semibold">{course.title}</p>
                  <p className="mt-1">
                    <span className="text-forest font-display text-[1.15rem] font-semibold">{formatPrice(price)}</span>
                    {course.discountPrice != null && (
                      <span className="text-muted ml-2 text-[0.8rem] line-through">{formatPrice(course.price)}</span>
                    )}
                  </p>
                </div>
              </div>

              <p className="text-muted rounded-xl bg-[var(--color-gold)]/15 px-3.5 py-2.5 text-[0.78rem] leading-snug">
                After payment, our team sends the course videos and materials to your WhatsApp number directly — usually within 24 hours.
              </p>

              <FormField label="Your name" error={fieldErrors.name} icon={UserIcon}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Full name"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Email" error={fieldErrors.email} icon={Mail}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </FormField>
              <FormField label="WhatsApp number" error={fieldErrors.phone} icon={Phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </FormField>

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[0.82rem] text-red-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingDetails}
                className="bg-forest text-cream hover:bg-forest-deep inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-medium transition-colors disabled:opacity-70"
              >
                {submittingDetails ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Please wait…
                  </>
                ) : (
                  "Continue to payment"
                )}
              </button>
            </form>
          )}

          {stage === "error" && (
            <div className="px-6 py-12 text-center">
              <AlertCircle className="mx-auto size-10 text-red-500" strokeWidth={1.5} />
              <p className="text-ink mt-4 font-medium">{error}</p>
              <div className="mt-6 flex justify-center gap-3">
                <button type="button" onClick={onClose} className="text-ink hover:bg-forest/5 rounded-full px-5 py-2.5 text-[0.9rem] font-medium">
                  Close
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
                {order.course.title} is confirmed. {order.seller.companyName} will send your course videos and
                materials to <span className="text-ink font-medium">{order.buyer.phone}</span> on WhatsApp shortly.
              </p>
              <div className="mt-7 flex flex-col items-center gap-3">
                <a
                  href={`/invoice/${order.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="border-forest/30 text-forest hover:bg-forest/5 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[0.9rem] font-medium transition-colors"
                >
                  View invoice
                  <ExternalLink className="size-3.5" />
                </a>
                <button type="button" onClick={onClose} className="text-muted hover:text-ink text-[0.85rem]">
                  Close
                </button>
              </div>
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
                  <p className="text-forest mt-1.5 inline-flex items-center gap-1 text-[0.78rem] font-medium">
                    <MessageCircle className="size-3.5" />
                    Delivered via WhatsApp
                  </p>
                </div>
              </div>

              <dl className="border-line/70 space-y-2.5 rounded-2xl border p-4 text-[0.88rem]">
                <div className="flex justify-between">
                  <dt className="text-muted">Taxable value</dt>
                  <dd className="text-ink">{formatPricePrecise(order.gst.taxableValue)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">GST ({order.gst.gstRate}%, included)</dt>
                  <dd className="text-ink">{formatPricePrecise(order.gst.gstAmount)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Discount already applied</dt>
                    <dd className="text-forest">− {formatPrice(order.discount)}</dd>
                  </div>
                )}
                <div className="border-line/70 flex items-baseline justify-between border-t pt-3">
                  <dt className="text-ink font-semibold">Total</dt>
                  <dd className="font-display text-ink text-[1.5rem] font-semibold">{formatPrice(order.amount)}</dd>
                </div>
              </dl>

              <div>
                <p className="text-ink text-[0.85rem] font-medium">Billed to</p>
                <p className="text-muted mt-1 text-[0.85rem]">
                  {order.buyer.name} · {order.buyer.email} · {order.buyer.phone}
                </p>
              </div>

              {order.testMode ? (
                // Dummy mode never opens a real payment widget, so this is
                // just a preference — kept for the reviewer/demo experience.
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
              ) : (
                // Real checkout: Razorpay's own widget shows the method
                // picker (UPI, card, net banking…) — showing a second one
                // here first would just make the buyer choose twice.
                <p className="border-line/70 text-muted flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[0.8rem]">
                  <Smartphone className="text-forest size-4 shrink-0" strokeWidth={1.6} />
                  You&rsquo;ll choose UPI, card or net banking in the next step.
                </p>
              )}

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

const inputClass =
  "w-full rounded-xl border border-line/60 bg-cream px-4 py-2.5 text-[0.92rem] text-ink transition-colors placeholder:text-muted/60 focus:border-forest/50 focus:outline-none";

function FormField({
  label,
  error,
  icon: Icon,
  children,
}: {
  label: string;
  error?: string;
  icon: typeof UserIcon;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-ink flex items-center gap-1.5 text-[0.82rem] font-medium">
        <Icon className="size-3.5" />
        {label}
      </span>
      {children}
      {error && <span className="block text-[0.75rem] text-red-600">{error}</span>}
    </label>
  );
}
