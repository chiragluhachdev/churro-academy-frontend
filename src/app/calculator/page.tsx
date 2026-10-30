import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { CostCalculator } from "@/components/calculator/CostCalculator";
import { AppShell } from "@/components/churroai/AppShell";
import { MembershipBar } from "@/components/churroai/MembershipBar";
import { Paywall } from "@/components/churroai/Paywall";
import { StartTrial } from "@/components/churroai/StartTrial";
import { TrialWorkspace } from "@/components/churroai/TrialWorkspace";
import { fetchAiConfigForVisitor, fetchAiMember } from "@/lib/churroai";
import { passLength } from "@/lib/churroaiShared";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { absolute: "Recipe Cost Calculator · Churro AI" },
  robots: { index: false, follow: false },
};

function Title() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-8 pb-6 sm:px-8 print:hidden">
      <h1 className="font-display text-ink text-[1.8rem] leading-tight font-medium tracking-[-0.015em] sm:text-[2.2rem]">
        Recipe Cost Calculator
      </h1>
      <p className="text-muted mt-1.5 text-[0.92rem]">Cost a batch, then price it for the margin you want.</p>
    </div>
  );
}

/**
 * The gate: signed out → sign in; tool switched off → coming soon; then the
 * member's own access decides — pass or running try gets the tool, an unused
 * try gets the start screen, and a used one gets the paywall. The admin can
 * always preview the tool from their own session.
 */
export default async function ChurroAiCalculatorPage() {
  const [config, member, session] = await Promise.all([fetchAiConfigForVisitor(), fetchAiMember(), getSession()]);
  const isAdmin = Boolean(session?.user);

  if (isAdmin) {
    return (
      <AppShell member={member} adminPreview>
        <Title />
        <CostCalculator isPaid defaultCurrency={config.estimate?.currency ?? "INR"} />
      </AppShell>
    );
  }
  if (!member) redirect("/signin?next=/calculator");

  if (!config.calculatorEnabled) {
    return (
      <AppShell member={member}>
        <div className="mx-auto max-w-md px-5 py-28 text-center">
          <span className="bg-pill text-forest mx-auto flex size-12 items-center justify-center rounded-2xl">
            <Clock className="size-5" />
          </span>
          <h1 className="font-display text-ink mt-5 text-[1.8rem] font-medium">Opening soon</h1>
          <p className="text-muted mt-3 text-[0.95rem]">
            The Recipe Calculator isn&rsquo;t open yet. Your free try will be waiting when it is.
          </p>
          <Link href="/" className="text-forest mt-6 inline-flex items-center gap-1.5 text-[0.9rem] font-medium">
            <ArrowLeft className="size-4" />
            Back to Churro AI
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell member={member}>
      {member.access === "pass" && (
        <>
          <Title />
          <MembershipBar config={config} member={member} />
          <CostCalculator isPaid defaultCurrency={config.estimate?.currency ?? "INR"} />
        </>
      )}
      {member.access === "trial" && (
        <>
          <Title />
          <TrialWorkspace config={config} member={member} />
        </>
      )}
      {member.access === "trial_available" && (
        <div className="px-5 py-16 sm:px-8 sm:py-24">
          <StartTrial config={config} member={member} />
        </div>
      )}
      {member.access === "locked" && (
        <div className="px-5 py-16 sm:px-8 sm:py-24">
          <Paywall
            config={config}
            member={member}
            heading="Your free try is over"
            lede={`Get the pass to keep costing recipes and pricing your bakes, with unlimited use for a full ${passLength(config.passDays)}.`}
          />
        </div>
      )}
    </AppShell>
  );
}
