"use client";

import { useState } from "react";

import { CostCalculator } from "@/components/calculator/CostCalculator";
import { Paywall } from "@/components/churroai/Paywall";
import { TrialBanner } from "@/components/churroai/TrialBanner";
import { passLength, type AiConfig, type AiMember } from "@/lib/churroaiShared";

/** The calculator during a free try: countdown on top, the pass one click away. */
export function TrialWorkspace({ config, member }: { config: AiConfig; member: AiMember }) {
  const [showPass, setShowPass] = useState(false);

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <TrialBanner endsAt={member.trialEndsAt!} config={config} onUpgrade={() => setShowPass((v) => !v)} />
      </div>
      {showPass && (
        <div className="px-5 pt-8 sm:px-8 print:hidden">
          <Paywall
            config={config}
            member={member}
            heading="Keep the calculator"
            lede={`Get the pass now and carry on without a break, with unlimited use for a full ${passLength(config.passDays)}.`}
          />
        </div>
      )}
      <CostCalculator />
    </>
  );
}
