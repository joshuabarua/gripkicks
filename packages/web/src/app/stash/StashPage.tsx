"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import type { UserShoe } from "@/types/api";
import { editFormSchema, type EditFormData } from "@/schemas/shoe-schema";
import EditShoeDialog from "@/components/EditShoeDialog";
import ShoeStatsModal from "@/components/ShoeStatsModal";
import dynamic from "next/dynamic";

const CloudBackground = dynamic(() => import("@/components/CloudBackground"), {
  ssr: false,
  loading: () => null,
});
import { LoadingBar } from "@/components/ui/loading";
import { useLoading } from "@/contexts/LoadingContext";
import { ShoeCardSkeleton, StatsStripSkeleton } from "@/components/ui/skeleton";
import { buildSpecialLabels } from "@/utils/specialLabels";
import { AddShoeDialog } from "@/components/stash/AddShoeDialog";
import { useStashData } from "@/hooks/useStashData";
import { StatsStrip } from "@/components/stash/StatsStrip";
import { BrandSections } from "@/components/stash/BrandSections";
import { useBrandGroups } from "@/hooks/useBrandGroups";
import { AdvancedFilters } from "@/components/stash/AdvancedFilters";
import { DataContributionNudge } from "@/components/DataContributionNudge";
import { debounce } from "@/lib/debounce";
import { analyticsEvents, captureError, track } from "@/lib/analytics";
import { fetchApi } from "@/lib/api-client";
import { getEffectiveShoeStats } from "@/components/ShoeStatsModal/utils";

export default function ShoeSanctuaryPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const toast = useToast();
  const { showLoader, hideLoader } = useLoading();
  const [selectedShoe, setSelectedShoe] = useState<UserShoe | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [dialogSelectedBrand, setDialogSelectedBrand] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<
    "all" | "men" | "women" | "kids" | "unisex"
  >("all");
  const [dialogSelectedGender, setDialogSelectedGender] = useState<
    "all" | "men" | "women" | "kids" | "unisex"
  >("all");
  const [selectedAggressiveness, setSelectedAggressiveness] =
    useState<string>("all");
  const [selectedStiffness, setSelectedStiffness] = useState<string>("all");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [selectedVolume, setSelectedVolume] = useState<string>("all");
  const [selectedComfortRating, setSelectedComfortRating] = useState<
    "all" | "8+" | "6+" | "4+" | "2+"
  >("all");
  const [selectedPerformanceRating, setSelectedPerformanceRating] = useState<
    "all" | "8+" | "6+" | "4+" | "2+"
  >("all");
  const [editingShoe, setEditingShoe] = useState<UserShoe | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    size: undefined,
    purchaseDate: undefined,
    condition: undefined,
    notes: undefined,
    showNotes: false,
    comfortScore: undefined,
    performanceRating: undefined,
    durabilityRating: undefined,
    fitLongevity: undefined,
    sizingDeviation: undefined,
  });

  // Debounced search function (300ms delay)
  const debouncedSetDialogSearchQuery = useMemo(
    () => debounce((value: string) => setDialogSearchQuery(value), 300),
    [],
  );

  const {
    userShoes,
    setUserShoes,
    isLoading,
    allShoes,
    popularityMap,
    totalShoesInDatabase,
    uniqueBrands,
    userData,
    catalogHasMore,
    catalogIsLoadingMore,
    loadMoreCatalog,
  } = useStashData({
    catalog: {
      enabled: isAddDialogOpen,
      searchTerm: dialogSearchQuery,
      brand: dialogSelectedBrand,
      gender: dialogSelectedGender,
    },
  });

  const addToStash = useMutation(api.stash.addToStash);
  const deleteUserShoe = useMutation(api.stash.deleteUserShoe);
  const updateUserShoeStats = useMutation(api.stash.updateUserShoeStats);
  const toggleFavourite = useMutation(api.stash.toggleFavourite);

  const [backgroundFxReady, setBackgroundFxReady] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(() => setBackgroundFxReady(true));
      return () => window.cancelIdleCallback(idleId);
    }
    const timerId = window.setTimeout(() => setBackgroundFxReady(true), 200);
    return () => window.clearTimeout(timerId);
  }, []);

  const shoeRankings = useMemo(() => {
    const withStats = userShoes.map((shoe) => {
      const characteristics = {
        ...(shoe.shoe?.aggressiveness ? { aggressiveness: shoe.shoe.aggressiveness } : {}),
        ...(shoe.shoe?.climbingDiscipline ? { climbingDiscipline: shoe.shoe.climbingDiscipline } : {}),
        ...(shoe.shoe?.stiffness ? { stiffness: shoe.shoe.stiffness } : {}),
        ...(shoe.shoe?.defaultScores && shoe.shoe.enrichment?.reviewStatus === "approved"
          ? { defaultScores: shoe.shoe.defaultScores }
          : {}),
      };
      const stats = getEffectiveShoeStats(characteristics, {
        ...(shoe.comfortScore !== undefined ? { comfortScore: shoe.comfortScore } : {}),
        ...(shoe.performanceRating !== undefined ? { performanceRating: shoe.performanceRating } : {}),
        ...(shoe.durabilityRating !== undefined ? { durabilityRating: shoe.durabilityRating } : {}),
      });
      return { id: shoe._id, stats };
    });

    withStats.sort((a, b) =>
      b.stats.comfort - a.stats.comfort ||
      b.stats.performance - a.stats.performance ||
      b.stats.durability - a.stats.durability,
    );

    const rankings = new Map<string, number>();
    withStats.forEach((entry, index) => {
      rankings.set(entry.id, index + 1);
    });

    return rankings;
  }, [userShoes]);

  // Calculate special shoe labels
  const specialLabels = useMemo(
    () => buildSpecialLabels(userShoes),
    [userShoes],
  );

  const stashBrands = useMemo(() => {
    const brands = new Set<string>();
    for (const shoe of userShoes) {
      const brand = shoe.shoe?.brand ?? shoe.shoeDetails?.brand;
      if (brand) brands.add(brand);
    }
    return Array.from(brands).sort((a, b) => a.localeCompare(b));
  }, [userShoes]);

  const filteredShoes = useMemo(() => {
    return userShoes.filter((shoe) => {
      if (selectedBrand !== "all") {
        const brand = shoe.shoe?.brand ?? shoe.shoeDetails?.brand;
        if (brand !== selectedBrand) return false;
      }
      if (selectedGender !== "all") {
        const gender = shoe.shoe?.gender ?? shoe.shoeDetails?.gender;
        if (gender !== selectedGender) return false;
      }
      if (
        selectedAggressiveness !== "all" &&
        shoe.shoe?.aggressiveness !== selectedAggressiveness
      ) {
        return false;
      }
      if (
        selectedStiffness !== "all" &&
        shoe.shoe?.stiffness !== selectedStiffness
      ) {
        return false;
      }
      if (
        selectedDiscipline !== "all" &&
        shoe.shoe?.climbingDiscipline !== selectedDiscipline
      ) {
        return false;
      }
      if (selectedVolume !== "all" && shoe.shoe?.volume !== selectedVolume) {
        return false;
      }
      if (selectedComfortRating !== "all") {
        const minScore = Number.parseInt(selectedComfortRating, 10);
        if (shoe.comfortScore === undefined || shoe.comfortScore < minScore) {
          return false;
        }
      }
      if (selectedPerformanceRating !== "all") {
        const minScore = Number.parseInt(selectedPerformanceRating, 10);
        if (
          shoe.performanceRating === undefined ||
          shoe.performanceRating < minScore
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    userShoes,
    selectedBrand,
    selectedGender,
    selectedAggressiveness,
    selectedStiffness,
    selectedDiscipline,
    selectedVolume,
    selectedComfortRating,
    selectedPerformanceRating,
  ]);

  const brandGroups = useBrandGroups(filteredShoes);

  // Catalog is filtered server-side; only exclude shoes already in the stash
  const dialogSearchResults = useMemo(() => {
    const userShoeIds = new Set(userShoes.map((shoe) => shoe.shoeId));
    return allShoes.filter((shoe) => !userShoeIds.has(shoe._id));
  }, [allShoes, userShoes]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedBrand !== "all") count++;
    if (selectedGender !== "all") count++;
    if (selectedAggressiveness !== "all") count++;
    if (selectedStiffness !== "all") count++;
    if (selectedDiscipline !== "all") count++;
    if (selectedVolume !== "all") count++;
    if (selectedComfortRating !== "all") count++;
    if (selectedPerformanceRating !== "all") count++;
    return count;
  }, [
    selectedBrand,
    selectedGender,
    selectedAggressiveness,
    selectedStiffness,
    selectedDiscipline,
    selectedVolume,
    selectedComfortRating,
    selectedPerformanceRating,
  ]);

  const ratedShoeCount = useMemo(
    () =>
      userShoes.filter(
        (shoe) =>
          shoe.comfortScore !== undefined ||
          shoe.performanceRating !== undefined ||
          shoe.durabilityRating !== undefined,
      ).length,
    [userShoes],
  );

  const resetFilters = useCallback(() => {
    setSelectedBrand("all");
    setSelectedGender("all");
    setSelectedAggressiveness("all");
    setSelectedStiffness("all");
    setSelectedDiscipline("all");
    setSelectedVolume("all");
    setSelectedComfortRating("all");
    setSelectedPerformanceRating("all");
  }, []);

  const handleSelectShoe = useCallback((shoe: UserShoe) => {
    setSelectedShoe(shoe);
    setIsStatsModalOpen(true);
  }, []);

  const openShoeEditor = useCallback((shoe: UserShoe) => {
    setEditingShoe(shoe);
    setEditForm({
      size: shoe.size || undefined,
      purchaseDate: shoe.purchaseDate || undefined,
      condition: shoe.condition || undefined,
      notes: shoe.notes || undefined,
      showNotes: false,
      comfortScore: shoe.comfortScore,
      performanceRating: shoe.performanceRating,
      durabilityRating: shoe.durabilityRating,
      fitLongevity: shoe.fitLongevity || undefined,
      sizingDeviation: shoe.sizingDeviation,
    });
    setIsStatsModalOpen(false);
  }, []);

  const addShoeToSanctuary = async (shoeId: string) => {
    if (!userData) {
      toast.error("Failed to add shoe to sanctuary");
      return;
    }
    try {
      await addToStash({
        userId: userData._id,
        shoeId: shoeId as Id<"shoes">,
      });
      setIsAddDialogOpen(false);
      setDialogSearchQuery("");
      setDialogSelectedBrand("all");
      setDialogSelectedGender("all");
      toast.success("Shoe added to your sanctuary!");
      track(analyticsEvents.stashShoeAdded, { shoe_id: shoeId });
    } catch (error) {
      toast.error("Failed to add shoe to sanctuary");
      captureError(error, { source: "stash_add", shoe_id: shoeId });
    }
  };

  const removeShoeFromStash = async (userShoeId: string) => {
    try {
      await deleteUserShoe({ userShoeId: userShoeId as Id<"userShoes"> });
      setIsStatsModalOpen(false);
      setSelectedShoe(null);
      toast.success("Shoe removed from your sanctuary");
      track(analyticsEvents.stashShoeRemoved, { shoe_id: userShoeId });
    } catch (error) {
      toast.error("Failed to remove shoe from sanctuary");
      captureError(error, { source: "stash_remove", shoe_id: userShoeId });
    }
  };

  const updateShoeStats = async () => {
    if (!editingShoe) return;

    const validationResult = editFormSchema.safeParse(editForm);
    if (!validationResult.success) {
      toast.error("Please check your input values");
      return;
    }

    const data = validationResult.data;
    try {
      await updateUserShoeStats({
        userShoeId: editingShoe._id as Id<"userShoes">,
        ...(data.size !== undefined ? { size: data.size } : {}),
        ...(data.purchaseDate !== undefined
          ? { purchaseDate: data.purchaseDate }
          : {}),
        ...(data.condition !== undefined ? { condition: data.condition } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.comfortScore !== undefined
          ? { comfortScore: data.comfortScore }
          : {}),
        ...(data.performanceRating !== undefined
          ? { performanceRating: data.performanceRating }
          : {}),
        ...(data.durabilityRating !== undefined
          ? { durabilityRating: data.durabilityRating }
          : {}),
        ...(data.fitLongevity !== undefined
          ? { fitLongevity: data.fitLongevity }
          : {}),
        ...(data.sizingDeviation !== undefined
          ? { sizingDeviation: data.sizingDeviation }
          : {}),
      });
      setEditingShoe(null);
      setSelectedShoe(null);
      toast.success("Shoe updated successfully!");
    } catch (error) {
      toast.error("Failed to update shoe");
      captureError(error, { source: "stash_update", shoe_id: editingShoe._id });
    }
  };

  const selectedBaseShoe = useQuery(
    api.shoes.getById,
    selectedShoe ? { id: selectedShoe.shoeId as Id<"shoes"> } : "skip",
  );

  const selectedFullShoe = useMemo(() => {
    if (!selectedShoe || !selectedBaseShoe) return undefined;
    const popularityCount = popularityMap.get(selectedShoe.shoeId);
    return {
      ...selectedBaseShoe,
      ...(popularityCount !== undefined ? { popularityCount } : {}),
      totalShoesInDatabase,
    };
  }, [selectedShoe, selectedBaseShoe, popularityMap, totalShoesInDatabase]);

  useEffect(() => {
    if (sessionLoading) {
      showLoader("stash-session");
    } else {
      hideLoader("stash-session");
    }
  }, [sessionLoading, showLoader, hideLoader]);

  if (!session?.user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center text-white">
          <h1 className="text-title-md font-bold mb-4 font-so-cloudy uppercase">
            Shoe Sanctuary
          </h1>
          <p className="mb-6">Please log in to view your shoe sanctuary</p>
          <Link
            href="/auth/login?callbackUrl=%2Fstash"
            className="inline-flex items-center justify-center rounded-lg bg-brand-red px-6 py-3 font-ball-pill text-lg text-black transition-colors duration-500 hover:bg-brand-red/80"
          >
            LOG IN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-svh w-full bg-black overflow-x-hidden">
      {backgroundFxReady && (
        <>
          <div
            className="sanctuary-cloud-backdrop fixed -inset-[4vw] pointer-events-none z-0"
            aria-hidden="true"
          >
            <Image
              src="/imgs/clouds/clouds 4.png"
              alt=""
              fill
              sizes="110vw"
              quality={72}
              className="object-cover"
            />
          </div>

          <CloudBackground />
          <style jsx>{`
            .sanctuary-cloud-backdrop {
              animation: sanctuary-cloud-drift 44s ease-in-out infinite alternate;
              transform: translate3d(-1.5%, -1%, 0) scale(1.06);
              will-change: transform;
            }

            @keyframes sanctuary-cloud-drift {
              to {
                transform: translate3d(1.5%, 1%, 0) scale(1.1);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .sanctuary-cloud-backdrop {
                animation: none;
              }
            }
          `}</style>
        </>
      )}

      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85 pointer-events-none z-0" />

      <div className="relative z-20">
        <section className="px-fluid-lg md:px-fluid-xl pt-fluid-xl pb-fluid-lg">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-fluid-lg"
            >
              <div>
                <h1 className="font-so-cloudy uppercase text-fluid-6xl md:text-fluid-7xl text-white leading-none">
                  Shoe
                  <br />
                  Sanctuary
                </h1>
              </div>

              <AddShoeDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                searchQuery={dialogSearchQuery}
                onSearchChange={debouncedSetDialogSearchQuery}
                selectedBrand={dialogSelectedBrand}
                onBrandChange={setDialogSelectedBrand}
                selectedGender={dialogSelectedGender}
                onGenderChange={setDialogSelectedGender}
                uniqueBrands={uniqueBrands}
                searchResults={dialogSearchResults}
                onSelectShoe={addShoeToSanctuary}
                hasMore={catalogHasMore}
                isLoadingMore={catalogIsLoadingMore}
                onLoadMore={() => loadMoreCatalog(40)}
              />
            </motion.div>

            {userShoes.length > 0 && (
              <StatsStrip
                totalShoes={userShoes.length}
                favouriteCount={
                  Array.isArray(userShoes)
                    ? userShoes.filter((s) => s.isFavourite).length
                    : 0
                }
                brandCount={stashBrands.length}
              />
            )}

            <DataContributionNudge
              stashCount={userShoes.length}
              ratedCount={ratedShoeCount}
            />

            {isLoading && userShoes.length === 0 && <StatsStripSkeleton />}
          </div>
        </section>

        <section className="px-fluid-lg md:px-fluid-xl pb-fluid-3xl">
          <div className="max-w-7xl mx-auto space-y-fluid-lg">
            {/* Advanced Filters */}
            <AdvancedFilters
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              selectedGender={selectedGender}
              onGenderChange={setSelectedGender}
              selectedAggressiveness={selectedAggressiveness}
              onAggressivenessChange={setSelectedAggressiveness}
              selectedStiffness={selectedStiffness}
              onStiffnessChange={setSelectedStiffness}
              selectedDiscipline={selectedDiscipline}
              onDisciplineChange={setSelectedDiscipline}
              selectedVolume={selectedVolume}
              onVolumeChange={setSelectedVolume}
              selectedComfortRating={selectedComfortRating}
              onComfortRatingChange={setSelectedComfortRating}
              selectedPerformanceRating={selectedPerformanceRating}
              onPerformanceRatingChange={setSelectedPerformanceRating}
              uniqueBrands={stashBrands}
              onReset={resetFilters}
              activeFiltersCount={activeFiltersCount}
            />

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-fluid-3xl">
                <div className="w-full max-w-4xl space-y-4">
                  <div className="text-center mb-6">
                    <LoadingBar size="lg" />
                    <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-600 mt-4 block">
                      Loading your collection
                    </span>
                  </div>
                  {/* Show skeleton cards while loading */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ShoeCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            )}

            {!isLoading && userShoes.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-fluid-3xl text-center"
              >
                <h3 className="font-ball-pill text-fluid-3xl text-white mb-fluid-xs">
                  NO SHOES YET
                </h3>
                <p className="font-sora text-neutral-500 mb-fluid-md max-w-sm">
                  Add your first shoe to get started.
                </p>
              </motion.div>
            )}

            {!isLoading && userShoes.length > 0 && filteredShoes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-fluid-3xl text-center">
                <p className="font-sora text-neutral-500 max-w-sm">
                  No shoes match the selected filters.
                </p>
              </div>
            )}

            {!isLoading && filteredShoes.length > 0 && (
              <BrandSections
                groups={brandGroups}
                specialLabels={specialLabels}
                onSelect={handleSelectShoe}
                onEdit={openShoeEditor}
              />
            )}
          </div>
        </section>
      </div>

      <ShoeStatsModal
        shoe={selectedShoe}
        fullShoe={selectedFullShoe}
        isOpen={isStatsModalOpen}
        onClose={() => {
          setIsStatsModalOpen(false);
          setSelectedShoe(null);
        }}
        userShoes={userShoes}
        rank={selectedShoe ? shoeRankings.get(selectedShoe._id) : undefined}
        onToggleFavourite={
          selectedShoe
            ? async () => {
              try {
                await toggleFavourite({
                  userShoeId: selectedShoe._id as Id<"userShoes">,
                });
                const newFavStatus = !selectedShoe.isFavourite;
                void fetchApi("/api/v1/profile", {
                  method: "PUT",
                  body: JSON.stringify({
                    favoriteShoeId: newFavStatus
                      ? selectedShoe.shoeId
                      : null,
                  }),
                });
                setSelectedShoe((prev) =>
                  prev ? { ...prev, isFavourite: newFavStatus } : null,
                );
                setUserShoes((prev) =>
                  prev.map((shoe) =>
                    shoe._id === selectedShoe._id
                      ? { ...shoe, isFavourite: newFavStatus }
                      : shoe,
                  ),
                );
                toast.success(
                  newFavStatus
                    ? "Added to favorites!"
                    : "Removed from favorites",
                );
                track(analyticsEvents.stashFavouriteToggled, {
                  shoe_id: selectedShoe._id,
                  is_favourite: newFavStatus,
                });
              } catch (error) {
                toast.error("Failed to update favourite status");
                captureError(error, {
                  source: "stash_toggle_favourite",
                  shoe_id: selectedShoe._id,
                });
              }
            }
            : undefined
        }
        onEditShoe={selectedShoe ? () => openShoeEditor(selectedShoe) : undefined}
        onRemoveShoe={
          selectedShoe
            ? () => {
              if (
                confirm(
                  "Are you sure you want to remove this shoe from your sanctuary?",
                )
              ) {
                removeShoeFromStash(selectedShoe._id);
              }
            }
            : undefined
        }
      />

      <EditShoeDialog
        editingShoe={editingShoe}
        editForm={editForm}
        setEditForm={setEditForm}
        setEditingShoe={setEditingShoe}
        updateShoeStats={updateShoeStats}
        removeShoe={
          editingShoe
            ? () => {
              if (
                confirm(
                  "Are you sure you want to remove this shoe from your sanctuary?",
                )
              ) {
                removeShoeFromStash(editingShoe._id);
                setEditingShoe(null);
              }
            }
            : undefined
        }
      />
    </div>
  );
}
