import type { Metadata } from "next";

import { ChurroAiLanding } from "@/components/churroai/ChurroAiLanding";
import { whatsappNumber } from "@/data/site";
import { fetchAiConfig, fetchAiMember } from "@/lib/churroai";
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
  const [config, member, session] = await Promise.all([
    fetchAiConfig(),
    fetchAiMember().catch(() => null),
    getSession(),
  ]);
  const isAdmin = Boolean(session?.user);
  const hasAccess = isAdmin || member?.access === "pass" || member?.access === "trial";

  return (
    <ChurroAiLanding
      cta={{
        // Switched on in Admin → Churro AI; the admin can always get in to preview it.
        live: config.calculatorEnabled || isAdmin,
        label: hasAccess ? "Open Recipe Calculator" : "Try it free",
        earlyAccessHref: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          "Hi! I'd like early access to Churro AI's Recipe Cost Calculator.",
        )}`,
      }}
      pricing={{
        passName: config.passName,
        passPrice: config.passPrice,
        passDays: config.passDays,
        trialMinutes: config.trialMinutes,
      }}
      signedIn={Boolean(member)}
      academyUrl={SITE_URL}
    />
  );
}
