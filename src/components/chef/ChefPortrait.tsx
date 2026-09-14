import Image from "next/image";

import chefSimonePortrait from "@/assets/chef-simone.jpg";

interface ChefPortraitProps {
  /** Admin-uploaded portrait. Falls back to the bundled studio photo. */
  url?: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Intrinsic size for remote images; ignored for the bundled photo. */
  width?: number;
  height?: number;
}

/**
 * A bundled import and a remote URL need different next/image props: only the
 * import can use placeholder="blur" and infer its dimensions. Passing either to
 * a remote URL throws, so the choice lives here rather than at every call site.
 */
export function ChefPortrait({ url, alt, sizes, className, width = 800, height = 800 }: ChefPortraitProps) {
  if (url) {
    return <Image src={url} alt={alt} width={width} height={height} sizes={sizes} className={className} />;
  }
  return (
    <Image
      src={chefSimonePortrait}
      alt={alt}
      placeholder="blur"
      sizes={sizes}
      className={className}
    />
  );
}
