"use client";

import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface PrivacySettings {
  showVerifiedTrades: boolean;
  showHoldings: boolean;
  showPortfolioValue: boolean;
  showTheses: boolean;
  allowFollow: boolean;
  allowComments: boolean;
  showJourney: boolean;
}

const LABELS: Record<keyof PrivacySettings, string> = {
  showVerifiedTrades: "Show verified trades publicly",
  showHoldings: "Show holdings publicly",
  showPortfolioValue: "Show portfolio value publicly",
  showTheses: "Show investment theses publicly",
  allowFollow: "Allow people to follow me",
  allowComments: "Allow comments on my posts",
  showJourney: "Show investment journey",
};

export function PrivacyToggles({ initial }: { initial: PrivacySettings }) {
  const [settings, setSettings] = useState(initial);

  const update = async (key: keyof PrivacySettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await fetch("/api/settings/privacy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
  };

  return (
    <div className="divide-y divide-line rounded-xl border border-line">
      {(Object.keys(LABELS) as (keyof PrivacySettings)[]).map((key) => (
        <div key={key} className="flex items-center justify-between p-4">
          <span className="text-[13.5px] text-ink-soft">{LABELS[key]}</span>
          <Switch.Root
            checked={settings[key]}
            onCheckedChange={(v) => update(key, v)}
            className={cn(
              "relative h-6 w-11 rounded-full bg-line-strong transition-colors data-[state=checked]:bg-ink",
            )}
          >
            <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
          </Switch.Root>
        </div>
      ))}
    </div>
  );
}
