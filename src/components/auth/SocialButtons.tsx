/**
 * Provider buttons. Phase 4 is frontend-only, so these are disabled rather than
 * pretending to start an OAuth flow — wire them to NextAuth's signIn() later.
 */
export function SocialButtons() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        { label: "Google", mark: <GoogleMark /> },
        { label: "Apple", mark: <AppleMark /> },
      ].map(({ label, mark }) => (
        <button
          key={label}
          type="button"
          disabled
          title="Social sign-in is not connected yet"
          className="border-line text-ink inline-flex items-center justify-center gap-2.5 rounded-xl border bg-white/60 px-3 py-3 text-[0.84rem] font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-55"
        >
          {mark}
          Continue with {label}
        </button>
      ))}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3Z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.8 6.1l3.8 3C6.5 6.7 9 4.8 12 4.8Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      <path d="M16.4 12.7c0-2.6 2.1-3.9 2.2-4-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3 0 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.2 3.1-2.5.7-1 1-2 1-2-.1 0-2.2-.8-2.2-3.7ZM14 4.9c.7-.9 1.2-2.1 1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.2 0 2.4-.6 3.1-1.5Z" />
    </svg>
  );
}
