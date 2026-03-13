"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ShoeImage from "@/components/ShoeImage";
import {
  buildPublicRadarEntry,
  radarQuadrants,
  type PublicRadarEntry,
  type RadarQuadrantKey,
} from "@/utils/publicRadar";
import { Heart, Shield, Target, Zap } from "lucide-react";

const quadrantIcons: Record<RadarQuadrantKey, ReactNode> = {
  "daily-drivers": <Heart className="w-4 h-4" />,
  "versatile-performers": <Zap className="w-4 h-4" />,
  "aggressive-comfort": <Shield className="w-4 h-4" />,
  competition: <Target className="w-4 h-4" />,
};

export default function RadarLabPage() {
  const shoes = useQuery(api.shoes.listAll);
  const popularity = useQuery(api.popularity.getAllShoesPopularity);
  const [selectedBrand, setSelectedBrand] = useState("all");

  const isLoading = shoes === undefined || popularity === undefined;

  const uniqueBrands = useMemo(() => {
    return ["all", ...new Set((shoes ?? []).map((shoe) => shoe.brand))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [shoes]);

  const radarEntries = useMemo(() => {
    if (!shoes || !popularity) {
      return [] as PublicRadarEntry[];
    }

    const filteredByBrand =
      selectedBrand === "all"
        ? shoes
        : shoes.filter((shoe) => shoe.brand === selectedBrand);

    const topPopularIds = [...popularity]
      .filter((item) => selectedBrand === "all" || filteredByBrand.some((shoe) => shoe._id === item.shoeId))
      .slice(0, 50);

    return topPopularIds
      .map((item) => {
        const shoe = filteredByBrand.find((candidate) => candidate._id === item.shoeId);
        if (!shoe) {
          return null;
        }
        return buildPublicRadarEntry(shoe, item.count, item.count, "Popularity");
      })
      .filter((entry): entry is PublicRadarEntry => entry !== null)
      .sort((a, b) => b.popularityCount - a.popularityCount);
  }, [popularity, selectedBrand, shoes]);

  const leadEntry = radarEntries[0];
  const leadQuadrant = leadEntry ? radarQuadrants[leadEntry.quadrantKey] : null;

  const quadrantCounts = useMemo(() => {
    return radarEntries.reduce(
      (counts, entry) => {
        counts[entry.quadrantKey] += 1;
        return counts;
      },
      {
        "daily-drivers": 0,
        "versatile-performers": 0,
        "aggressive-comfort": 0,
        competition: 0,
      } as Record<RadarQuadrantKey, number>,
    );
  }, [radarEntries]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-neutral-500">Loading radar lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-[1500px] mx-auto space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-500">[PUBLIC_RADAR_LAB]</p>
          <h1 className="text-4xl sm:text-5xl font-bold">Radar Lab</h1>
          <p className="max-w-3xl text-neutral-400 text-sm sm:text-base">
            Public QA page for testing radar density. This page plots popular shoes without login, foot profile, or match scoring so you can inspect where models cluster on the radar.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-1.5 w-fit">
                Top 50 popular shoes
              </Badge>

              <div className="flex items-center gap-3">
                <label htmlFor="brand-filter" className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                  Brand
                </label>
                <select
                  id="brand-filter"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                >
                  {uniqueBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand === "all" ? "All brands" : brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-1.5">
                Showing {radarEntries.length} shoes
              </Badge>
              <Badge variant="secondary" className="bg-neutral-900 text-neutral-300 border border-neutral-800">
                Popularity-led placement
              </Badge>
              {selectedBrand !== "all" && (
                <Badge variant="secondary" className="bg-neutral-900 text-neutral-300 border border-neutral-800">
                  {selectedBrand}
                </Badge>
              )}
            </div>

            {leadEntry && leadQuadrant && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${leadQuadrant.bgColor} ${leadQuadrant.borderColor} border ${leadQuadrant.accentClass}`}>
                    {leadQuadrant.name}
                  </Badge>
                  <Badge variant="secondary" className="bg-neutral-900 border border-neutral-800 text-neutral-300">
                    {leadEntry.descriptors.horizontalLabel}
                  </Badge>
                  <Badge variant="secondary" className="bg-neutral-900 border border-neutral-800 text-neutral-300">
                    {leadEntry.descriptors.verticalLabel}
                  </Badge>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {leadEntry.shoe.brand} {leadEntry.shoe.name}
                  </h2>
                  <p className="text-sm text-neutral-400 mt-2 max-w-2xl">
                    Lead shoe by popularity count after brand filtering.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 mb-4">Radar language</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {(Object.keys(radarQuadrants) as RadarQuadrantKey[]).map((key) => {
                const quadrant = radarQuadrants[key];
                return (
                  <div key={key} className={`rounded-2xl border p-4 ${quadrant.borderColor} ${quadrant.bgColor}`}>
                    <div className={`flex items-center gap-2 mb-2 ${quadrant.accentClass}`}>
                      {quadrantIcons[key]}
                      <span className="text-sm font-medium text-white">{quadrant.name}</span>
                    </div>
                    <p className="text-sm text-neutral-400">{quadrant.description}</p>
                  </div>
                );
              })}
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-black/30 p-4 space-y-2 text-sm text-neutral-400">
              <p><span className="text-white font-medium">Position</span> stays independent of login and foot profile on this page.</p>
              <p><span className="text-white font-medium">Top 50 popular</span> ranks by stash popularity count, then plots those shoes on the radar.</p>
              <p><span className="text-white font-medium">Match score</span> is reserved for the authenticated shoe matcher, not this public test page.</p>
            </div>
          </div>
        </div>

        <div className="relative bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden w-full" style={{ aspectRatio: "16 / 10", minHeight: "620px" }}>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-xs text-neutral-500 pointer-events-none uppercase tracking-wider">
            More Versatile
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-xs text-neutral-500 pointer-events-none uppercase tracking-wider">
            More Aggressive
          </div>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-xs text-neutral-500 pointer-events-none">
            <span style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }} className="uppercase tracking-wider">More Comfortable</span>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-xs text-neutral-500 pointer-events-none">
            <span style={{ writingMode: "vertical-lr" }} className="uppercase tracking-wider">More Performance</span>
          </div>

          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-800" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-800" />
          </div>

          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-0">
            {(Object.keys(radarQuadrants) as RadarQuadrantKey[]).map((key, index) => {
              const quadrant = radarQuadrants[key];
              const borderClasses = index === 0 ? "border-r border-b" : index === 1 ? "border-b" : index === 2 ? "border-r" : "";
              return (
                <div key={key} className={`${quadrant.bgColor} ${quadrant.borderColor} ${borderClasses} p-3 flex items-center justify-center`}>
                  <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 bg-neutral-900/80 border border-neutral-700/80 ${quadrant.accentClass}`}>
                    {quadrantCounts[key]}
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-2 h-2 bg-orange-500 rounded-full" />

          {radarEntries.map((entry, index) => (
            <div
              key={entry.shoe._id}
              className="absolute z-30"
              style={{
                left: `${entry.x * 100}%`,
                top: `${entry.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden shadow-lg">
                  <ShoeImage
                    brand={entry.shoe.brand}
                    shoeName={entry.shoe.name}
                    imageUrl={entry.shoe.imageUrl ?? undefined}
                    className="p-0.5"
                    transformation={[{ height: 56, width: 56, crop: "at_max", format: "png" }]}
                  />
                </div>
                <div className="absolute -top-1 -left-1 min-w-5 h-5 rounded-full bg-orange-500 text-black text-[10px] font-bold flex items-center justify-center px-1.5">
                  {index + 1}
                </div>
                <div className="absolute -bottom-1 -right-1 min-w-8 h-5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center px-1.5">
                  <span className="text-[8px] font-bold text-orange-400">{entry.popularityCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {radarEntries.map((entry, index) => {
            const quadrant = radarQuadrants[entry.quadrantKey];
            return (
              <Card key={entry.shoe._id} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0">
                      <ShoeImage
                        brand={entry.shoe.brand}
                        shoeName={entry.shoe.name}
                        imageUrl={entry.shoe.imageUrl ?? undefined}
                        className="p-1"
                        transformation={[{ height: 80, width: 80, crop: "at_max", format: "png" }]}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Rank #{index + 1}</p>
                          <h3 className="text-lg font-bold text-white truncate">{entry.shoe.name}</h3>
                          <p className="text-neutral-400 text-sm">{entry.shoe.brand}</p>
                        </div>
                        <Badge className={`${quadrant.bgColor} ${quadrant.borderColor} border ${quadrant.accentClass}`}>
                          {quadrant.name}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-neutral-950 border border-neutral-800 text-neutral-300">
                          Popularity {entry.popularityCount}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-neutral-950 border border-neutral-800 text-neutral-300">
                          {entry.descriptors.horizontalLabel}
                        </Badge>
                        <Badge variant="secondary" className="bg-neutral-950 border border-neutral-800 text-neutral-300">
                          {entry.descriptors.verticalLabel}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {entry.topTraits.map((trait) => (
                          <Badge key={trait.key} variant="secondary" className="bg-orange-500/10 text-orange-300 border border-orange-500/20">
                            {trait.label} {trait.value.toFixed(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!radarEntries.length && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-8 text-center">
            <p className="text-white text-sm">No shoes match the current public radar filters.</p>
            <p className="text-neutral-500 text-xs mt-2">Try a different brand or switch radar mode.</p>
          </div>
        )}
      </div>
    </div>
  );
}
