import { cn } from "@/lib/format";

interface ProgressBarProps {
  /** 0–100. */
  value: number;
  className?: string;
  label?: string;
}

export function ProgressBar({ value, className, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <span
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${clamped}% complete`}
      className={cn("bg-line/80 block h-1.5 overflow-hidden rounded-full", className)}
    >
      <span
        className="bg-forest block h-full rounded-full transition-[width] duration-700 ease-[var(--ease-editorial)]"
        style={{ width: `${clamped}%` }}
      />
    </span>
  );
}
