import type { MatchSignals } from "@/types/shoe";

export function describeMatchSignal(signals: MatchSignals | undefined, field: keyof MatchSignals): string | undefined {
  if (!signals) return undefined;
  if (field === "footShape") return signals.footShape === "listed" ? "Listed" : signals.footShape === "not-listed" ? "Not listed" : "Not recorded";
  if (field === "volume" && !signals.volume) return "Not recorded";
  if (field === "preferences" && !signals.preferences) return "Not learned";
  return undefined;
}
