import { LogOut } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/format";

/**
 * Sign-out runs as a server action so the session cookie is cleared server-side
 * — no client-side token juggling.
 */
export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn(
          "text-muted hover:text-forest flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[0.85rem] transition-colors",
          className,
        )}
      >
        <LogOut className="size-4" strokeWidth={1.6} aria-hidden="true" />
        Sign out
      </button>
    </form>
  );
}
