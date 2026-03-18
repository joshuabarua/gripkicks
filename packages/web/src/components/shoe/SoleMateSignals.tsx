"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useFootProfileStore } from "@/stores/footProfileStore";

interface SoleMateSignalsProps {
  shoeId: string;
  soleMateCount?: number;
}

export function SoleMateSignals({ shoeId, soleMateCount = 0 }: SoleMateSignalsProps) {
  const { profile: footProfile } = useFootProfileStore();

  const outliers = useQuery(
    api.stash.getOutliersForShoe,
    footProfile?.shape && footProfile?.volume
      ? {
          shoeId: shoeId as Id<"shoes">,
          footShape: footProfile.shape,
          footVolume: footProfile.volume,
        }
      : "skip",
  );

  if (!footProfile?.shape || (soleMateCount === 0 && (!outliers || outliers.length === 0))) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">
          Sole Mate Signals
        </h4>
        {soleMateCount > 0 && (
          <span className="text-[10px] text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded-full">
            {soleMateCount} with your profile
          </span>
        )}
      </div>

      {outliers && outliers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {outliers.map((signal) => (
            <div
              key={signal._id}
              className="border-l-2 border-cyan-500 bg-cyan-500/5 pl-3 py-1"
            >
              <p className="text-[13px] text-white font-semibold mb-0.5">{signal.signalType}</p>
              <p className="text-xs text-neutral-400 leading-relaxed">{signal.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-600">
          No signals yet — more data needed from your profile group.
        </p>
      )}
    </div>
  );
}
