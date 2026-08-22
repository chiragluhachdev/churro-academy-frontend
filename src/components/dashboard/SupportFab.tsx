import { MessageCircle } from "lucide-react";

/**
 * Floating support button on phones. Points at a real mailbox rather than
 * opening a chat widget that does not exist yet.
 */
export function SupportFab() {
  return (
    <a
      href="mailto:hello@churroacademy.com?subject=Question%20about%20my%20course"
      aria-label="Ask us a question"
      className="bg-forest text-cream fixed right-5 bottom-24 z-40 flex size-14 items-center justify-center rounded-full shadow-[0_12px_28px_-10px_rgba(41,75,50,0.7)] transition-transform duration-300 hover:scale-105 lg:hidden"
    >
      <MessageCircle className="size-6" strokeWidth={1.7} aria-hidden="true" />
    </a>
  );
}
