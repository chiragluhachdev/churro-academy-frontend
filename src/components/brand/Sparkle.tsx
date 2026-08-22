/**
 * Four-point star with concave sides — matches the sparkle baked into the hero
 * panel artwork. Lucide's `Sparkle` reads as a plus sign at small sizes.
 */
export function Sparkle4({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 1.5c.55 5.36 4.64 9.45 10 10-5.36.55-9.45 4.64-10 10-.55-5.36-4.64-9.45-10-10 5.36-.55 9.45-4.64 10-10Z" />
    </svg>
  );
}
