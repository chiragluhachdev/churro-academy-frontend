import { cn } from "@/lib/format";

/** The small letter-spaced label that opens every section. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-muted text-[0.7rem] font-medium tracking-[0.22em] uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
