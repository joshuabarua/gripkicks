"use client";

import { useFootProfileStore } from "@/stores/footProfileStore";

interface SoleMateSignalsProps {
  shoeId: string;
}

export function SoleMateSignals({ shoeId }: SoleMateSignalsProps) {
  const { profile: footProfile } = useFootProfileStore();
  
  // In a real implementation, we would query the specific shoe outliers based on the foot profile
  // const signals = useQuery(api.shoes.getOutliers, { 
  //   shoeId: shoeId as Id<"shoes">, 
  //   footShape: footProfile?.shape as any, 
  //   footVolume: footProfile?.volume as any 
  // });

  // Placeholder static data to match the design spec for demonstration
  const placeholderSignals = [
    {
      id: 1,
      type: "heel_gap",
      title: "The \"Heel Gap\" Outlier",
      description: `8/10 Sole Mates with ${footProfile?.volume || "Low"} Volume feet reported a slight gap in the heel cup.`,
      colorClass: "border-orange-500 bg-orange-500/5 text-orange-400",
    },
    {
      id: 2,
      type: "sizing",
      title: "Sizing Insight",
      description: `${footProfile?.shape || "Roman"} foot shapes typically downsize 1.5 sizes, while Egyptians prefer 1 size down.`,
      colorClass: "border-cyan-500 bg-cyan-500/5 text-cyan-400",
    },
  ];

  if (!footProfile?.shape) {
    return null; // Don't show signals if no profile
  }

  return (
    <div className="mt-6">
      <h4 className="text-[11px] uppercase tracking-[0.1em] text-neutral-500 mb-4">
        Sole Mate Signals
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {placeholderSignals.map((signal) => (
          <div
            key={signal.id}
            className={`border-l-2 pl-4 py-1 ${signal.colorClass}`}
          >
            <p className="m-0 mb-1 text-[13px] text-white font-semibold">
              {signal.title}
            </p>
            <p className="m-0 text-xs text-neutral-400 leading-relaxed">
              {signal.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
