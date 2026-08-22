import { Eyebrow } from "@/components/ui/Eyebrow";

export function DashboardHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <header>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="font-display text-ink mt-3 text-[1.9rem] leading-[1.15] font-medium tracking-[-0.015em] sm:text-[2.3rem]">
        {title}
      </h1>
      {lede && <p className="text-muted mt-3 max-w-2xl leading-[1.75]">{lede}</p>}
    </header>
  );
}
