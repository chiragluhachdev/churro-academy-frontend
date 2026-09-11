"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { cn } from "@/lib/format";
import { whatsappGreeting, whatsappNumber } from "@/data/site";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const OPENER: Message = {
  role: "assistant",
  content:
    "Hi! I'm the Churro Academy assistant. Ask me about courses, pricing or how it all works.",
};

const QUICK_REPLIES = [
  "What courses do you have?",
  "I'm a total beginner",
  "How much does it cost?",
  "What's your refund policy?",
];

export function ChatWidget() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([OPENER]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappGreeting)}`;

  async function send(text: string) {
    const question = text.trim();
    if (!question || thinking) return;

    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setDraft("");
    setThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The opener is ours, not part of the conversation the model needs.
        body: JSON.stringify({ messages: next.slice(1).slice(-12) }),
      });
      const data = await response.json();
      setMessages([
        ...next,
        {
          role: "assistant",
          // The route always returns a presentable `reply`, even on failure.
          content:
            data.reply ??
            "Sorry — something went wrong. Try the WhatsApp button below?",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "I couldn't reach the kitchen just then. Try WhatsApp below?",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <>
      {/* Launcher — bottom right, where the WhatsApp button used to sit. */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close chat" : "Chat with us"}
        aria-expanded={open}
        className="group fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center sm:right-8 sm:bottom-8"
      >
        {!open && (
          <span
            aria-hidden="true"
            className="bg-forest/25 absolute inset-0 rounded-full motion-safe:animate-ping"
            style={{ animationDuration: "3s" }}
          />
        )}
        <span className="bg-forest text-cream relative flex size-14 items-center justify-center rounded-full shadow-[0_14px_30px_-12px_rgba(41,75,50,0.8)] transition-transform duration-300 ease-[var(--ease-editorial)] group-hover:scale-105 group-active:scale-95">
          {open ? (
            <X className="size-6" strokeWidth={1.8} />
          ) : (
            <MessageCircle className="size-6" strokeWidth={1.7} />
          )}
          {!open && (
            <span
              aria-hidden="true"
              className="border-cream absolute top-0.5 right-0.5 size-3.5 rounded-full border-2 bg-emerald-400"
            />
          )}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Churro Academy assistant"
            initial={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.97 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="border-line/70 bg-cream fixed inset-x-4 bottom-24 z-50 flex h-[min(32rem,70vh)] origin-bottom-right flex-col overflow-hidden rounded-2xl border shadow-[0_28px_60px_-20px_rgba(41,75,50,0.45)] sm:inset-x-auto sm:right-8 sm:bottom-28 sm:w-[23rem]"
          >
            <header className="bg-forest-deep text-cream flex items-center gap-3 px-5 py-4">
              <Image
                src="/logo.png"
                alt=""
                width={512}
                height={512}
                className="size-9 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[0.92rem] leading-tight font-semibold">Churro Academy</p>
                <p className="text-cream/65 mt-0.5 flex items-center gap-1.5 text-[0.72rem]">
                  <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  Usually replies instantly
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-cream/70 hover:text-cream -mr-1 p-1 transition-colors"
              >
                <X className="size-5" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <p
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.85rem] leading-[1.6] whitespace-pre-wrap",
                      message.role === "user"
                        ? "bg-forest text-cream rounded-br-sm"
                        : "bg-sand text-ink rounded-bl-sm",
                    )}
                  >
                    {message.content}
                  </p>
                </div>
              ))}

              {thinking && (
                <div className="flex justify-start">
                  <p className="bg-sand text-muted flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="bg-muted/60 size-1.5 rounded-full motion-safe:animate-bounce"
                        style={{ animationDelay: `${dot * 0.15}s` }}
                      />
                    ))}
                    <span className="sr-only">Typing…</span>
                  </p>
                </div>
              )}

              {messages.length === 1 && !thinking && (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {QUICK_REPLIES.map((reply) => (
                    <li key={reply}>
                      <button
                        type="button"
                        onClick={() => void send(reply)}
                        className="border-line text-ink hover:border-forest/40 hover:bg-sand/60 rounded-full border px-3 py-1.5 text-[0.75rem] transition-colors"
                      >
                        {reply}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Escape hatch — always available, not just on failure. */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="border-line/70 bg-cream-warm/70 text-ink hover:bg-sand/70 flex items-center justify-center gap-2 border-t px-4 py-2.5 text-[0.78rem] font-medium transition-colors"
            >
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Didn&rsquo;t solve it? Chat on WhatsApp
            </a>

            <form
              onSubmit={handleSubmit}
              className="border-line/70 flex items-center gap-2 border-t px-3 py-3"
            >
              <label htmlFor="chat-input" className="sr-only">
                Your message
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about a course…"
                autoComplete="off"
                className="text-ink placeholder:text-muted/60 min-w-0 flex-1 bg-transparent px-2 py-2 text-[0.85rem] outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || thinking}
                aria-label="Send message"
                className="bg-forest text-cream flex size-9 shrink-0 items-center justify-center rounded-full transition-[opacity,transform] duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
