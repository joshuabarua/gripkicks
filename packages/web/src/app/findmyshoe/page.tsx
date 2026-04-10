"use client";

import { useState, useMemo } from "react";
import { useSession } from "@/lib/auth";
import {
  useFindMyShoe,
  type AggregatedRating,
  type SoleMateClimberMatch,
} from "@/hooks/useFindMyShoe";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Star,
  Users,
  TrendingUp,
  Footprints,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { FullPageLoading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

const categories = [
  { key: "all", label: "Overall" },
  { key: "comfort", label: "Comfort" },
  { key: "performance", label: "Performance" },
  { key: "durability", label: "Durability" },
] as const;

type Category = (typeof categories)[number]["key"];

export default function SoleMatePage() {
  const { data: session } = useSession();
  const {
    recommendations,
    soleMateMatches,
    isLoading,
    hasProfile,
    hasShoes,
    pagination,
  } = useFindMyShoe(20);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const filteredRatings = useMemo(() => {
    let filtered = recommendations;

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.shoe.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory !== "all") {
      filtered = [...filtered].sort((a, b) => {
        switch (selectedCategory) {
          case "comfort":
            return b.avgComfortScore - a.avgComfortScore;
          case "performance":
            return b.avgPerformanceRating - a.avgPerformanceRating;
          case "durability":
            return b.avgDurabilityRating - a.avgDurabilityRating;
          default:
            return b.matchScore - a.matchScore;
        }
      });
    }

    return filtered;
  }, [recommendations, searchQuery, selectedCategory]);

  const filteredSoleMateMatches = useMemo(() => {
    if (searchQuery) {
      return soleMateMatches
        .map((match) => ({
          ...match,
          shoes: match.shoes.filter(
            (r) =>
              r.shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.shoe.brand.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((match) => match.shoes.length > 0);
    }
    return soleMateMatches;
  }, [soleMateMatches, searchQuery]);

  const spotlightShoeIds = useMemo(() => {
    return new Set(
      filteredSoleMateMatches.flatMap((match) =>
        match.shoes.map((shoe) => shoe.shoe._id),
      ),
    );
  }, [filteredSoleMateMatches]);

  if (isLoading) {
    return <FullPageLoading text="Finding Matches" />;
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Footprints className="w-8 h-8 text-brand-red" />
          </div>
          <h1 className="font-tanker text-4xl mb-2">SOLE MATE</h1>
          <p className="font-sora text-neutral-500 mb-6">
            Please log in to find your perfect match
          </p>
          <Link
            href="/auth/login?callbackUrl=%2Ffindmyshoe"
            className="inline-flex items-center justify-center rounded-2xl bg-brand-red px-8 py-3 font-tanker text-lg text-black transition-colors hover:bg-brand-red/80"
          >
            LOG IN
          </Link>
        </div>
      </main>
    );
  }

  if (!hasProfile) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Footprints className="w-8 h-8 text-brand-red" />
          </div>
          <h1 className="font-tanker text-4xl mb-2">COMPLETE YOUR PROFILE</h1>
          <p className="font-sora text-neutral-500 mb-8">
            Set up your foot profile so we can find what fits you best
          </p>
          <Link href="/footscan">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-brand-red hover:bg-brand-red/80 text-black font-tanker text-lg py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              GO TO FOOT LAB <ArrowUpRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3">Sole Mate</p>
            <h1 className="font-tanker text-6xl md:text-8xl mb-4">
              FIND YOUR
              <br />
              <span className="text-brand-red">MATCH</span>
            </h1>
            <p className="font-sora text-lg text-neutral-400 max-w-2xl mx-auto">
              Discover your perfect climbing shoe based on community insights
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search shoes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20 font-sora"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-5 py-3 rounded-xl font-sora text-sm whitespace-nowrap transition-all ${selectedCategory === cat.key
                      ? "bg-brand-red text-black font-medium"
                      : "bg-neutral-800 border border-neutral-700 text-neutral-400 hover:border-brand-red/30"
                      }`}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {filteredSoleMateMatches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-brand-red/10 to-brand-red/5 border border-brand-red/20 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AnimatedIcon animation="pulse" trigger="scroll">
                    <div className="w-10 h-10 bg-brand-red/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-brand-red" />
                    </div>
                  </AnimatedIcon>
                  <div>
                    <h2 className="font-tanker text-xl text-white">
                      SOLE MATE SPOTLIGHT
                    </h2>
                    <p className="font-sora text-xs text-neutral-400">
                      Exact foot matches with different shoes rated above 8.5
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredSoleMateMatches.map((match) => (
                    <SoleMateMatchCard
                      key={match.user._id}
                      match={match}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <AnimatedIcon animation="float" trigger="scroll">
                  <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-brand-red" />
                  </div>
                </AnimatedIcon>
                <h2 className="font-tanker text-2xl text-white">
                  ALL RECOMMENDATIONS
                  {pagination.totalCount > 0 && (
                    <span className="font-sora text-sm text-neutral-500 ml-2">
                      ({pagination.totalCount})
                    </span>
                  )}
                </h2>
              </div>
            </div>

            {filteredRatings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Footprints className="w-8 h-8 text-neutral-600" />
                </div>
                <h3 className="font-tanker text-2xl text-white mb-2">
                  NO RECOMMENDATIONS YET
                </h3>
                <p className="font-sora text-neutral-500 mb-6 max-w-sm mx-auto">
                  {!hasShoes
                    ? "Add some shoes to your collection and rate them to get personalized recommendations."
                    : "We need more data from the community to generate recommendations. Check back soon!"}
                </p>
                {!hasShoes && (
                  <Link href="/stash">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-brand-red hover:bg-brand-red/80 text-black font-tanker px-6 py-3 rounded-2xl transition-colors"
                    >
                      ADD SHOES TO SANCTUARY
                    </motion.button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredRatings
                    .filter((r) => !spotlightShoeIds.has(r.shoe._id))
                    .map((rating, index) => (
                      <motion.div
                        key={rating.shoe._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ShoeCard rating={rating} />
                      </motion.div>
                    ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-neutral-800">
                    <Button
                      variant="outline"
                      onClick={pagination.prevPage}
                      disabled={pagination.currentPage === 1}
                      className="border-neutral-700 text-neutral-400 hover:text-white hover:border-brand-red/30"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      <span className="font-sora text-sm text-neutral-500">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      onClick={pagination.nextPage}
                      disabled={!pagination.hasMore}
                      className="border-neutral-700 text-neutral-400 hover:text-white hover:border-brand-red/30"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function SoleMateMatchCard({
  match,
}: {
  match: SoleMateClimberMatch;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-neutral-800">
          {match.user.image ? (
            <Image
              src={match.user.image}
              alt={match.user.name || "Climber"}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <Users className="h-5 w-5 text-brand-red" />
          )}
        </div>
        <div>
          <h3 className="font-sora font-semibold text-white">
            {match.user.name || "Climber"}
          </h3>
          <p className="font-sora text-[10px] uppercase tracking-[0.15em] text-neutral-500">
            {match.shoes.length} shoes above 8.5
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {match.shoes.map((rating) => (
          <ShoeCard
            key={`${match.user._id}-${rating.shoe._id}`}
            rating={rating}
            isSpotlight
          />
        ))}
      </div>
    </div>
  );
}

function ShoeCard({
  rating,
  isSpotlight = false,
}: {
  rating: AggregatedRating;
  isSpotlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 ${isSpotlight
        ? "bg-neutral-900/80 rounded-2xl border border-neutral-800"
        : "bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-brand-red/20 transition-all group cursor-pointer"
        }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${isSpotlight
            ? "bg-neutral-800"
            : "bg-neutral-800 group-hover:bg-neutral-700 transition-colors"
            }`}
        >
          {rating.shoe.imageUrl ? (
            <Image
              src={rating.shoe.imageUrl}
              alt={rating.shoe.name}
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
          ) : (
            <Footprints
              className={`w-7 h-7 ${isSpotlight
                ? "text-brand-red"
                : "text-neutral-600 group-hover:text-brand-red transition-colors"
                }`}
            />
          )}
        </div>
        <div>
          <h3
            className={`font-sora font-semibold text-white ${!isSpotlight && "group-hover:text-brand-red transition-colors"
              }`}
          >
            {rating.shoe.name}
          </h3>
          <p className="font-sora text-[10px] uppercase tracking-[0.15em] text-neutral-500">
            {rating.shoe.brand}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`font-sora text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${isSpotlight
                ? "bg-brand-red/20 text-brand-red"
                : "bg-neutral-800 text-neutral-400"
                }`}
            >
              <Star
                className={`w-3 h-3 ${isSpotlight ? "fill-brand-red" : ""}`}
              />
              {rating.matchScore}% MATCH
            </span>
            <span className="font-sora text-[10px] uppercase tracking-[0.1em] text-neutral-600">
              {rating.totalRatings} reviews
            </span>
          </div>
        </div>
      </div>
      <div className="text-right hidden md:block">
        <p className="font-sora text-[10px] uppercase tracking-[0.15em] text-neutral-600 mb-1">
          AVG RATINGS
        </p>
        <div className="flex gap-3">
          <div>
            <span className="font-tanker text-lg text-white">
              {rating.avgComfortScore.toFixed(1)}
            </span>
            <span className="font-sora text-[10px] uppercase tracking-[0.1em] text-neutral-600 ml-1">
              C
            </span>
          </div>
          <div>
            <span className="font-tanker text-lg text-white">
              {rating.avgPerformanceRating.toFixed(1)}
            </span>
            <span className="font-sora text-[10px] uppercase tracking-[0.1em] text-neutral-600 ml-1">
              P
            </span>
          </div>
          <div>
            <span className="font-tanker text-lg text-white">
              {rating.avgDurabilityRating.toFixed(1)}
            </span>
            <span className="font-sora text-[10px] uppercase tracking-[0.1em] text-neutral-600 ml-1">
              D
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
