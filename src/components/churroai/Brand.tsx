import Image from "next/image";

export function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/logo.png" alt="" width={512} height={512} className="size-8 rounded-full object-cover" />
      <span className="font-display text-ink text-[1.2rem] font-medium tracking-[-0.01em]">Churro</span>
      <span className="bg-forest text-cream -ml-1 rounded-md px-1.5 py-0.5 text-[0.66rem] font-semibold tracking-[0.08em]">
        AI
      </span>
    </span>
  );
}
