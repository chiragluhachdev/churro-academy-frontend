import type { Metadata } from "next";

import { ChurroAiLanding } from "@/components/churroai/ChurroAiLanding";
import { whatsappNumber } from "@/data/site";
import { fetchAiConfigForVisitor, fetchAiMember } from "@/lib/churroai";
import { getSession } from "@/lib/session";

// The site is Churro AI for now. The old academy home is kept in app/_academy/HomePage.tsx.
export const metadata: Metadata = {
  title: { absolute: "Churro AI | Smart tools for bakers" },
  description:
    "Churro AI is a growing suite of tools for home bakers and bakery businesses, from Churro Academy. Start with the Recipe Cost Calculator: cost every batch and price it for the margin you want.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Churro AI | Smart tools for bakers",
    description: "Cost every batch and price it for the margin you want. A new suite of tools from Churro Academy.",
    url: "/",
    type: "website",
  },
};

export default async function HomePage() {
  const [config, member, session] = await Promise.all([
    fetchAiConfigForVisitor(),
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
        contactHref: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi! I have a question about Churro AI.")}`,
      }}
      pricing={{
        passName: config.passName,
        passPrice: config.passPrice,
        passDays: config.passDays,
        trialMinutes: config.trialMinutes,
        autoRenewEnabled: config.autoRenewEnabled,
        estimate: config.estimate,
      }}
      signedIn={Boolean(member)}
    />
  );
}
