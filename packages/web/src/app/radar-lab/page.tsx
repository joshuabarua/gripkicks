"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import ShoeImage from "@/components/ShoeImage";
import {
  buildPublicRadarEntry,
  radarQuadrants,
  type PublicRadarEntry,
  type RadarQuadrantKey,
} from "@/utils/publicRadar";
import { motion } from "framer-motion";
import Link from "next/link";

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
        <div className="text-center space-y-4">
          <motion.div
            className="w-10 h-10 border-l-2 border-t-2 border-orange-500/40 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">Loading the field</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 md:px-12 lg:px-16 pt-28 pb-16 max-w-[1600px] mx-auto space-y-12">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8"
        >
          <div>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Community Radar</p>
            <h1 className="font-tanker text-6xl sm:text-7xl lg:text-8xl leading-[0.9] mb-4">
              THE<br /><span className="text-orange-500">FIELD</span>
            </h1>
            <p className="font-sora text-neutral-400 max-w-md leading-relaxed">
              No account needed. This is where the community lands — the most-stashed shoes plotted by how they actually climb. Not matched to your feet. Just the data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="space-y-1">
              <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">Filter by brand</p>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 text-white font-sora text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-orange-500/40 min-w-[160px]"
              >
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand === "all" ? "All brands" : brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 mt-5 sm:mt-0">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-2.5 text-center">
                <p className="font-tanker text-2xl text-orange-500">{radarEntries.length}</p>
                <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-white/30">Shoes</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-2.5 text-center">
                <p className="font-tanker text-2xl text-white">{leadEntry?.popularityCount ?? 0}</p>
                <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-white/30">Top stashes</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Differentiator strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-6 items-center border-t border-b border-neutral-800/60 py-4"
        >
          <p className="font-sora text-xs text-neutral-500">
            <span className="text-white">The Field</span> — community popularity, no foot profile
          </p>
          <span className="text-neutral-800 hidden sm:block">·</span>
          <p className="font-sora text-xs text-neutral-500">
            Want personalised matches?{" "}
            <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 transition-colors">
              Sign in for your Radar →
            </Link>
          </p>
        </motion.div>

        {/* Radar canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden w-full"
          style={{ aspectRatio: "16 / 9", minHeight: "560px" }}
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/20">More Versatile</span>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/20">More Aggressive</span>
          </div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <span style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }} className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/20">More Comfortable</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <span style={{ writingMode: "vertical-lr" }} className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/20">More Performance</span>
          </div>

          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-800/60" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-800/60" />
          </div>

          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-0">
            {(Object.keys(radarQuadrants) as RadarQuadrantKey[]).map((key, index) => {
              const quadrant = radarQuadrants[key];
              const borderClasses = index === 0 ? "border-r border-b" : index === 1 ? "border-b" : index === 2 ? "border-r" : "";
              return (
                <div key={key} className={`${quadrant.bgColor} ${quadrant.borderColor} ${borderClasses} p-4 flex flex-col justify-between`}>
                  <span className={`font-sora text-[9px] uppercase tracking-[0.2em] ${quadrant.accentClass} opacity-60`}>{quadrant.name}</span>
                  <span className="font-tanker text-2xl text-white/10">{quadrantCounts[key]}</span>
                </div>
              );
            })}
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />

          {radarEntries.map((entry, index) => (
            <div
              key={entry.shoe._id}
              className="absolute z-30 group"
              style={{
                left: `${entry.x * 100}%`,
                top: `${entry.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="relative">
                <div className="w-11 h-11 sm:w-13 sm:h-13 bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden shadow-lg group-hover:border-orange-500/40 transition-colors">
                  <ShoeImage
                    brand={entry.shoe.brand}
                    shoeName={entry.shoe.name}
                    className="p-0.5"
                    transformation={[{ height: 52, width: 52, crop: "at_max", format: "png" }]}
                    {...(entry.shoe.imageUrl ? { imageUrl: entry.shoe.imageUrl } : {})}
                  />
                </div>
                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-orange-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 h-4 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-orange-400">{entry.popularityCount}</span>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="font-sora text-[10px] text-white">{entry.shoe.name}</p>
                  <p className="font-sora text-[9px] text-neutral-500">{entry.shoe.brand}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Ranked list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">Community ranking</p>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/20">{radarEntries.length} shoes</p>
          </div>

          <div className="space-y-2">
            {radarEntries.map((entry, index) => {
              const quadrant = radarQuadrants[entry.quadrantKey];
              const isTop = index === 0;
              return (
                <motion.div
                  key={entry.shoe._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 1) }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${isTop
                    ? "bg-orange-500/5 border-orange-500/20"
                    : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                    }`}
                >
                  <span className={`font-tanker text-xl w-8 flex-shrink-0 ${isTop ? "text-orange-500" : "text-white/20"}`}>
                    {index + 1}
                  </span>

                  <div className="w-12 h-12 bg-neutral-900 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-800">
                    <ShoeImage
                      brand={entry.shoe.brand}
                      shoeName={entry.shoe.name}
                      className="p-0.5"
                      transformation={[{ height: 48, width: 48, crop: "at_max", format: "png" }]}
                      {...(entry.shoe.imageUrl ? { imageUrl: entry.shoe.imageUrl } : {})}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-tanker text-lg leading-none ${isTop ? "text-white" : "text-neutral-200"}`}>
                        {entry.shoe.name}
                      </h3>
                      {isTop && (
                        <span className="font-sora text-[9px] uppercase tracking-[0.2em] text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                          Most stashed
                        </span>
                      )}
                    </div>
                    <p className="font-sora text-xs text-neutral-500 mt-0.5">{entry.shoe.brand}</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <span className={`font-sora text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg border ${quadrant.bgColor} ${quadrant.borderColor} ${quadrant.accentClass}`}>
                      {quadrant.name}
                    </span>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="font-tanker text-xl text-white">{entry.popularityCount}</p>
                    <p className="font-sora text-[9px] uppercase tracking-[0.15em] text-white/30">in stashes</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {!radarEntries.length && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-12 text-center">
            <p className="font-tanker text-2xl text-white mb-2">NO DATA YET</p>
            <p className="font-sora text-sm text-neutral-500">Try a different brand filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
