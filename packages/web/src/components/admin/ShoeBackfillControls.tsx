"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function ShoeBackfillControls() {
  const backfillVariantMetadata = useMutation(
    api.shoes.backfillVariantMetadata,
  );
  const backfillMissingRubberTechnology = useMutation(
    api.shoes.backfillMissingRubberTechnology,
  );
  const missingRubberTechnologyReport = useQuery(
    api.shoes.getMissingRubberTechnologyReport,
    {},
  );
  const [isBackfillingVariants, setIsBackfillingVariants] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);
  const [isBackfillingRubberTechnology, setIsBackfillingRubberTechnology] =
    useState(false);
  const [rubberBackfillResult, setRubberBackfillResult] = useState<
    string | null
  >(null);

  const handleBackfillVariants = async () => {
    try {
      setIsBackfillingVariants(true);
      setBackfillResult(null);
      const result = await backfillVariantMetadata({});
      setBackfillResult(`Backfilled ${result.updatedCount} shoes.`);
    } catch {
      setBackfillResult("Backfill failed. Please try again.");
    } finally {
      setIsBackfillingVariants(false);
    }
  };

  const handleBackfillRubberTechnology = async () => {
    try {
      setIsBackfillingRubberTechnology(true);
      setRubberBackfillResult(null);
      const result = await backfillMissingRubberTechnology({});

      if (result.skipped.length > 0) {
        setRubberBackfillResult(
          `Backfilled ${result.updatedCount} shoes. ${result.skipped.length} still need manual review.`,
        );
        return;
      }

      setRubberBackfillResult(
        `Backfilled ${result.updatedCount} shoes missing rubber technology.`,
      );
    } catch {
      setRubberBackfillResult(
        "Rubber technology backfill failed. Please try again.",
      );
    } finally {
      setIsBackfillingRubberTechnology(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end">
        <button
          onClick={handleBackfillVariants}
          disabled={isBackfillingVariants}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {isBackfillingVariants
            ? "Backfilling..."
            : "Backfill Variants"}
        </button>
        {backfillResult && (
          <div className="mt-1 text-xs text-white/60">
            {backfillResult}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end">
        <button
          onClick={handleBackfillRubberTechnology}
          disabled={
            isBackfillingRubberTechnology ||
            !missingRubberTechnologyReport?.length
          }
          className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {isBackfillingRubberTechnology
            ? "Backfilling Rubber..."
            : `Backfill Rubber (${missingRubberTechnologyReport?.length || 0})`}
        </button>
        {rubberBackfillResult && (
          <div className="mt-1 text-xs text-white/60 text-right max-w-xs">
            {rubberBackfillResult}
          </div>
        )}
      </div>
    </>
  );
}
