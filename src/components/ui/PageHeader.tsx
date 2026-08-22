import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  lede?: string;
}

/**
 * Standard opening block for interior pages. The top padding clears the fixed
 * navbar, which sits outside the document flow.
 */
export function PageHeader({ eyebrow, title, lede }: PageHeaderProps) {
  return (
    <section className="bg-cream-warm border-line/60 border-b">
      <div className="mx-auto max-w-[1400px] px-5 pt-28 pb-9 sm:px-8 sm:pt-32 sm:pb-12 lg:pt-40 lg:pb-20">
        <Reveal className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-display text-ink mt-4 text-[2.1rem] leading-[1.08] font-medium tracking-[-0.015em] text-balance sm:mt-5 sm:text-[3.2rem]">
            {title}
          </h1>
          {lede && (
            <p className="text-muted mt-4 max-w-2xl text-[0.95rem] leading-[1.75] sm:mt-6 sm:text-[1.05rem]">{lede}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
