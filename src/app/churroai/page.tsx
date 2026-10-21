import type { Metadata } from "next";

import { ChurroAiLanding } from "@/components/churroai/ChurroAiLanding";
import { whatsappNumber } from "@/data/site";
import { fetchSiteSettings } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { absolute: "Churro AI — Smart tools for bakers" },
  description:
    "Churro AI is a growing suite of tools for home bakers and bakery businesses, from Churro Academy. Start with the Recipe Cost Calculator: cost every batch and price it for the margin you want.",
  alternates: { canonical: "/churroai" },
  openGraph: {
    title: "Churro AI — Smart tools for bakers",
    description: "Cost every batch and price it for the margin you want. A new suite of tools from Churro Academy.",
    url: "/churroai",
    type: "website",
  },
};

export default async function ChurroAiPage() {
  const [site, session] = await Promise.all([fetchSiteSettings().catch(() => undefined), getSession()]);
  // Same rule as /calculator itself: open to visitors once unlocked in Settings, always open to the admin.
  const calculatorLive = Boolean(site?.calculatorEnabled) || Boolean(session?.user);
  const earlyAccessHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi! I'd like early access to Churro AI's Recipe Cost Calculator.",
  )}`;

  return <ChurroAiLanding calculatorLive={calculatorLive} earlyAccessHref={earlyAccessHref} academyUrl={SITE_URL} />;
}
