'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react';
import ShoeImage from '@/components/ShoeImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  buildPublicRadarEntry,
  calculatePublicMatchScore,
  radarQuadrants,
  type PublicRadarEntry,
  type RadarQuadrantKey,
} from '@/utils/publicRadar';

const sortOptions = [
  { key: 'community', label: 'Community rank' },
  { key: 'comfort', label: 'Comfort' },
  { key: 'performance', label: 'Performance' },
  { key: 'durability', label: 'Durability' },
] as const;

type SortMetric = (typeof sortOptions)[number]['key'];

export default function CragRadar() {
  const shoes = useQuery(api.shoes.listAll);
  const popularity = useQuery(api.popularity.getAllShoesPopularity);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMetric, setSortMetric] = useState<SortMetric>('community');

  const isLoading = shoes === undefined || popularity === undefined;

  const uniqueBrands = useMemo(() => {
    return ['all', ...new Set((shoes ?? []).map((shoe) => shoe.brand))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [shoes]);

  const popularityMap = useMemo(() => {
    return new Map((popularity ?? []).map((item) => [item.shoeId, item.count]));
  }, [popularity]);

  const radarEntries = useMemo(() => {
    if (!shoes || !popularity) return [] as PublicRadarEntry[];

    const query = searchQuery.trim().toLowerCase();
    const filteredShoes = shoes.filter((shoe) => {
      const matchesBrand = selectedBrand === 'all' || shoe.brand === selectedBrand;
      const matchesQuery =
        !query || shoe.name.toLowerCase().includes(query) || shoe.brand.toLowerCase().includes(query);
      return matchesBrand && matchesQuery;
    });

    const rankedEntries = filteredShoes
      .map((shoe) => {
        const count = popularityMap.get(shoe._id) ?? 0;
        return buildPublicRadarEntry(shoe, count, calculatePublicMatchScore(shoe, count), 'Community rank');
      })
      .sort((a, b) => {
        switch (sortMetric) {
          case 'comfort':
            return b.metrics.comfort - a.metrics.comfort;
          case 'performance':
            return b.metrics.performance - a.metrics.performance;
          case 'durability':
            return b.metrics.durability - a.metrics.durability;
          default:
            return b.score - a.score;
        }
      });

    return rankedEntries.slice(0, 50);
  }, [popularity, popularityMap, searchQuery, selectedBrand, shoes, sortMetric]);

  const leadEntry = radarEntries[0];

  const quadrantCounts = useMemo(() => {
    return radarEntries.reduce(
      (counts, entry) => {
        counts[entry.quadrantKey] += 1;
        return counts;
      },
      {
        'daily-drivers': 0,
        'versatile-performers': 0,
        'aggressive-comfort': 0,
        competition: 0,
      } as Record<RadarQuadrantKey, number>,
    );
  }, [radarEntries]);

  const handleReset = () => {
    setSelectedBrand('all');
    setSearchQuery('');
    setSortMetric('community');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="font-sora text-neutral-500 text-sm">Loading Crag...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 mb-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">Crag</p>
            <h2 className="font-tanker text-5xl md:text-6xl text-white leading-none">
              COMMUNITY
              <br />
              <span className="text-orange-500">RANKING</span>
            </h2>
            <p className="font-sora text-sm md:text-base text-neutral-400 max-w-xl">
              Browse the community’s favorite shoes with brand filters, ranking metrics, and a grid that plots every result by fit and performance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            <div className="rounded-2xl border border-neutral-800 bg-black/30 px-4 py-3 text-center">
              <p className="font-tanker text-2xl text-orange-500">{radarEntries.length}</p>
              <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-white/30">Shoes</p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-black/30 px-4 py-3 text-center">
              <p className="font-tanker text-2xl text-white">{leadEntry?.score?.toFixed(0) ?? '0'}</p>
              <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-white/30">Top score</p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-black/30 px-4 py-3 text-center">
              <p className="font-tanker text-2xl text-white">{uniqueBrands.length - 1}</p>
              <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-white/30">Brands</p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-black/30 px-4 py-3 text-center">
              <p className="font-tanker text-2xl text-white">{sortOptions.find((option) => option.key === sortMetric)?.label}</p>
              <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-white/30">Sorted by</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 mb-8"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search brands or shoes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 pl-12 pr-4 font-sora text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </label>

          <label className="space-y-1">
            <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-white/30">Brand</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 font-sora text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === 'all' ? 'All brands' : brand}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-white/30">Ranking metric</span>
            <select
              value={sortMetric}
              onChange={(e) => setSortMetric(e.target.value as SortMetric)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 font-sora text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleReset}
              variant="outline"
              className="w-full border-neutral-700 text-neutral-300 hover:border-orange-500/30 hover:text-white"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative mb-8 w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950"
        style={{ aspectRatio: '16 / 9', minHeight: '560px' }}
      >
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 pointer-events-none">
          <span className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/20">More Versatile</span>
        </div>
        <div className="absolute left-1/2 bottom-4 z-20 -translate-x-1/2 pointer-events-none">
          <span className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/20">More Aggressive</span>
        </div>
        <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2 pointer-events-none">
          <span style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }} className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/20">More Comfortable</span>
        </div>
        <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2 pointer-events-none">
          <span style={{ writingMode: 'vertical-lr' }} className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/20">More Performance</span>
        </div>

        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-800/60" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-800/60" />
        </div>

        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-0">
          {(Object.keys(radarQuadrants) as RadarQuadrantKey[]).map((key, index) => {
            const quadrant = radarQuadrants[key];
            const borderClasses =
              index === 0 ? 'border-r border-b' : index === 1 ? 'border-b' : index === 2 ? 'border-r' : '';
            return (
              <div key={key} className={`${quadrant.bgColor} ${quadrant.borderColor} ${borderClasses} flex items-center justify-center p-3`}>
                <div className="text-center">
                  <p className={`font-sora text-[9px] uppercase tracking-[0.2em] ${quadrant.accentClass} opacity-60`}>{quadrant.name}</p>
                  <p className="font-tanker text-2xl text-white/10">{quadrantCounts[key]}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute left-1/2 top-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />

        {radarEntries.map((entry, index) => (
          <motion.div
            key={entry.shoe._id}
            className="group absolute z-30"
            style={{ left: `${entry.x * 100}%`, top: `${entry.y * 100}%`, transform: 'translate(-50%, -50%)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="relative">
              <div className="h-12 w-12 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-lg transition-colors hover:border-orange-500/40 sm:h-14 sm:w-14">
                <ShoeImage
                  brand={entry.shoe.brand}
                  shoeName={entry.shoe.name}
                  className="p-0.5"
                  transformation={[{ height: 56, width: 56, crop: 'at_max', format: 'png' }]}
                  {...(entry.shoe.imageUrl ? { imageUrl: entry.shoe.imageUrl } : {})}
                />
              </div>
              <div className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[9px] font-bold text-black">
                {index + 1}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 min-w-6 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 px-1.5">
                <span className="text-[8px] font-bold text-orange-400">{Math.round(entry.score)}</span>
              </div>
              <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                <p className="font-sora text-[10px] text-white">{entry.shoe.name}</p>
                <p className="font-sora text-[9px] text-neutral-500">{entry.shoe.brand}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">Community ranking</p>
          <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/20">{radarEntries.length} shoes</p>
        </div>

        <div className="space-y-2">
          {radarEntries.length > 0 ? (
            radarEntries.map((entry, index) => {
              const quadrant = radarQuadrants[entry.quadrantKey];
              return (
                <motion.div
                  key={entry.shoe._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 1) }}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 transition-colors hover:border-neutral-700"
                >
                  <span className="w-8 flex-shrink-0 font-tanker text-xl text-white/20">{index + 1}</span>

                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                    <ShoeImage
                      brand={entry.shoe.brand}
                      shoeName={entry.shoe.name}
                      className="p-0.5"
                      transformation={[{ height: 48, width: 48, crop: 'at_max', format: 'png' }]}
                      {...(entry.shoe.imageUrl ? { imageUrl: entry.shoe.imageUrl } : {})}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-tanker text-lg leading-none text-white">{entry.shoe.name}</h3>
                      {index === 0 && (
                        <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-sora text-[9px] uppercase tracking-[0.2em] text-orange-500">
                          Top rank
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-sora text-xs text-neutral-500">{entry.shoe.brand}</p>
                  </div>

                  <div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
                    <span className={`rounded-lg border px-2.5 py-1 font-sora text-[10px] uppercase tracking-[0.15em] ${quadrant.bgColor} ${quadrant.borderColor} ${quadrant.accentClass}`}>
                      {quadrant.name}
                    </span>
                    <span className="rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1 font-sora text-[10px] uppercase tracking-[0.15em] text-neutral-300">
                      {entry.popularityCount} stashes
                    </span>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="font-tanker text-xl text-white">{Math.round(entry.score)}</p>
                    <p className="font-sora text-[9px] uppercase tracking-[0.15em] text-white/30">community</p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-12 text-center">
              <p className="font-tanker text-2xl text-white mb-2">NO DATA YET</p>
              <p className="font-sora text-sm text-neutral-500">Try a different brand or search filter.</p>
            </div>
          )}
        </div>
      </div>

      {leadEntry && (
        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">Top community pick</p>
              <h3 className="font-tanker text-2xl text-white">{leadEntry.shoe.name}</h3>
              <p className="font-sora text-sm text-neutral-500">{leadEntry.shoe.brand}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${radarQuadrants[leadEntry.quadrantKey].bgColor} ${radarQuadrants[leadEntry.quadrantKey].borderColor} border ${radarQuadrants[leadEntry.quadrantKey].accentClass} font-sora`}>
                {radarQuadrants[leadEntry.quadrantKey].name}
              </Badge>
              <Link
                href="/matcher"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-orange-500/40 hover:text-white"
              >
                Open matcher <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
