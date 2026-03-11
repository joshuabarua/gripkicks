"use client";

import { useState, useMemo } from "react";
import { Footprints } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import type { UserShoe } from "@/types/api";
import { editFormSchema, type EditFormData } from "@/schemas/shoe-schema";
import EditShoeDialog from "@/components/EditShoeDialog";
import ShoeStatsModal from "@/components/ShoeStatsModal";
import CloudBackground from "@/components/CloudBackground";
import { FullPageLoading, LoadingBar } from "@/components/ui/loading";
import { ShoeCardSkeleton, StatsStripSkeleton } from "@/components/ui/skeleton";
import {
  addShoeToStash,
  removeShoeFromStash as removeShoeFromStashService,
  toggleFavouriteInStash,
  updateShoeInStash,
} from "@/services/stash";
import { buildSpecialLabels } from "@/utils/specialLabels";
import { AddShoeDialog } from "@/components/stash/AddShoeDialog";
import { useStashData } from "@/hooks/useStashData";
import { StatsStrip } from "@/components/stash/StatsStrip";
import { BrandSections } from "@/components/stash/BrandSections";
import { useBrandGroups } from "@/hooks/useBrandGroups";
import { AdvancedFilters } from "@/components/stash/AdvancedFilters";
import { debounce } from "@/lib/debounce";
import { analyticsEvents, captureError, track } from "@/lib/analytics";
import { getEffectiveShoeStats } from "@/components/ShoeStatsModal/utils";

export default function ShoeSanctuaryPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const toast = useToast();
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
    "all" | "4+" | "3+" | "2+" | "1+"
  >("all");
  const [selectedPerformanceRating, setSelectedPerformanceRating] = useState<
    "all" | "4+" | "3+" | "2+" | "1+"
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
    fetchUserStash,
    invalidateCache,
    allShoes,
    popularityMap,
    totalShoesInDatabase,
    uniqueBrands,
  } = useStashData(session?.user?.id, {
    onError: (message) => toast.error(message),
  });

  const shoeRankings = useMemo(() => {
    const ranked = [...userShoes].sort((a, b) => {
      const aStats = getEffectiveShoeStats(
        {
          aggressiveness: a.shoe?.aggressiveness,
          climbingDiscipline: a.shoe?.climbingDiscipline,
          stiffness: a.shoe?.stiffness,
        },
        {
          comfortScore: a.comfortScore,
          performanceRating: a.performanceRating,
          durabilityRating: a.durabilityRating,
        },
      );
      const bStats = getEffectiveShoeStats(
        {
          aggressiveness: b.shoe?.aggressiveness,
          climbingDiscipline: b.shoe?.climbingDiscipline,
          stiffness: b.shoe?.stiffness,
        },
        {
          comfortScore: b.comfortScore,
          performanceRating: b.performanceRating,
          durabilityRating: b.durabilityRating,
        },
      );

      const comfortDiff = bStats.comfort - aStats.comfort;
      if (comfortDiff !== 0) return comfortDiff;

      const perfDiff = bStats.performance - aStats.performance;
      if (perfDiff !== 0) return perfDiff;

      return bStats.durability - aStats.durability;
    });

    const rankings = new Map<string, number>();
    ranked.forEach((shoe, index) => {
      rankings.set(shoe._id, index + 1);
    });

    return rankings;
  }, [userShoes]);

  // Calculate special shoe labels
  const specialLabels = useMemo(
    () => buildSpecialLabels(userShoes),
    [userShoes],
  );

  const brandGroups = useBrandGroups(userShoes);

  // Search for shoes with advanced filters
  const dialogSearchResults = useMemo(() => {
    const userShoeIds = new Set(userShoes.map((shoe) => shoe.shoeId));

    let results = allShoes.filter((shoe) => !userShoeIds.has(shoe._id));

    if (dialogSelectedBrand !== "all") {
      results = results.filter((shoe) => shoe.brand === dialogSelectedBrand);
    }

    if (dialogSelectedGender !== "all") {
      results = results.filter(
        (shoe) => (shoe.gender ?? "").toLowerCase() === dialogSelectedGender,
      );
    }

    if (dialogSearchQuery.trim().length > 0) {
      const normalizedQuery = dialogSearchQuery.toLowerCase();
      results = results.filter(
        (shoe) =>
          shoe.name.toLowerCase().includes(normalizedQuery) ||
          shoe.brand.toLowerCase().includes(normalizedQuery),
      );
    }

    return results;
  }, [
    allShoes,
    dialogSearchQuery,
    dialogSelectedBrand,
    dialogSelectedGender,
    userShoes,
  ]);

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

  // Reset all filters
  const resetFilters = () => {
    setSelectedBrand("all");
    setSelectedGender("all");
    setSelectedAggressiveness("all");
    setSelectedStiffness("all");
    setSelectedDiscipline("all");
    setSelectedVolume("all");
    setSelectedComfortRating("all");
    setSelectedPerformanceRating("all");
  };

  const addShoeToSanctuary = async (shoeId: string) => {
    const result = await addShoeToStash(shoeId);
    result.match(
      () => {
        invalidateCache();
        fetchUserStash();
        setIsAddDialogOpen(false);
        setDialogSearchQuery("");
        setDialogSelectedBrand("all");
        setDialogSelectedGender("all");
        toast.success("Shoe added to your sanctuary!");
        track(analyticsEvents.stashShoeAdded, { shoe_id: shoeId });
      },
      (error) => {
        console.error("Failed to add shoe:", error);
        toast.error("Failed to add shoe to sanctuary");
        captureError(error, { source: "stash_add", shoe_id: shoeId });
      },
    );
  };

  const removeShoeFromStash = async (shoeId: string) => {
    const result = await removeShoeFromStashService(shoeId);
    result.match(
      () => {
        invalidateCache();
        fetchUserStash();
        setIsStatsModalOpen(false);
        setSelectedShoe(null);
        toast.success("Shoe removed from your sanctuary");
        track(analyticsEvents.stashShoeRemoved, { shoe_id: shoeId });
      },
      (error) => {
        console.error("Failed to remove shoe:", error);
        toast.error("Failed to remove shoe from sanctuary");
        captureError(error, { source: "stash_remove", shoe_id: shoeId });
      },
    );
  };

  const updateShoeStats = async () => {
    if (!editingShoe) return;

    const validationResult = editFormSchema.safeParse(editForm);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      console.error("Validation errors:", errors);
      toast.error("Please check your input values");
      return;
    }

    const result = await updateShoeInStash(editingShoe._id, editForm);
    result.match(
      () => {
        invalidateCache();
        fetchUserStash();
        setEditingShoe(null);
        setSelectedShoe(null);
        toast.success("Shoe updated successfully!");
      },
      (error) => {
        console.error("Failed to update shoe:", error);
        toast.error("Failed to update shoe");
      },
    );
  };

  const selectedFullShoe = useMemo(() => {
    if (!selectedShoe) return undefined;
    const baseShoe = allShoes.find((s) => s._id === selectedShoe.shoeId);
    if (!baseShoe) return undefined;
    return {
      ...baseShoe,
      popularityCount: popularityMap.get(selectedShoe.shoeId),
      totalShoesInDatabase,
    };
  }, [selectedShoe, allShoes, popularityMap, totalShoesInDatabase]);

  if (sessionLoading) {
    return <FullPageLoading text="Loading Sanctuary" />;
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center text-white">
          <h1 className="text-title-md font-bold mb-4 font-so-cloudy uppercase">
            Shoe Sanctuary
          </h1>
          <p>Please log in to view your shoe sanctuary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-svh w-full bg-black overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: 'url("/imgs/clouds/clouds 4.png")',
            filter: "brightness(0.5)",
          }}
        />
      </div>

      <CloudBackground />

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 pointer-events-none" />

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
                <p className="font-mono text-xs text-orange-500 mb-fluid-sm tracking-[0.3em]">
                  [SANCTUARY]
                </p>
                <h1 className="font-so-cloudy uppercase text-fluid-6xl md:text-fluid-7xl text-white leading-none">
                  Shoe
                  <br />
                  <span className="text-orange-500">Sanctuary</span>
                </h1>
                <p className="font-sora text-neutral-500 text-sm md:text-fluid-base mt-fluid-sm max-w-md">
                  Your personal climbing shoe collection. Click any shoe to view
                  stats, edit, or manage.
                </p>
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
                brandCount={brandGroups.length}
              />
            )}

            {/* Show skeleton while loading initial data */}
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
              uniqueBrands={uniqueBrands}
              onReset={resetFilters}
              activeFiltersCount={activeFiltersCount}
            />

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-fluid-3xl">
                <div className="w-full max-w-4xl space-y-4">
                  <div className="text-center mb-6">
                    <LoadingBar size="lg" />
                    <span className="font-mono text-[10px] text-neutral-500 tracking-[0.2em] mt-4 block">
                      [LOADING_SANCTUARY]
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
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-fluid-md"
                >
                  <Footprints className="w-10 h-10 text-orange-500" />
                </motion.div>
                <h3 className="font-tanker text-fluid-3xl text-white mb-fluid-xs">
                  YOUR SANCTUARY AWAITS
                </h3>
                <p className="font-sora text-neutral-500 mb-fluid-md max-w-sm">
                  Start building your climbing shoe collection. Add your first
                  shoe to track stats and get recommendations.
                </p>
              </motion.div>
            )}

            {!isLoading && userShoes.length > 0 && (
              <BrandSections
                groups={brandGroups}
                specialLabels={specialLabels}
                onSelect={(shoe) => {
                  setSelectedShoe(shoe);
                  setIsStatsModalOpen(true);
                }}
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
              const result = await toggleFavouriteInStash(selectedShoe._id);
              result.match(
                () => {
                  const newFavStatus = !selectedShoe.isFavourite;
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
                  fetchUserStash();
                  toast.success(
                    newFavStatus
                      ? "Added to favorites!"
                      : "Removed from favorites",
                  );
                  track(analyticsEvents.stashFavouriteToggled, {
                    shoe_id: selectedShoe._id,
                    is_favourite: newFavStatus,
                  });
                },
                (error) => {
                  console.error("Failed to update favourite status:", error);
                  toast.error("Failed to update favourite status");
                  captureError(error, {
                    source: "stash_toggle_favourite",
                    shoe_id: selectedShoe._id,
                  });
                },
              );
            }
            : undefined
        }
        onEditShoe={
          selectedShoe
            ? () => {
              const defaultStats = getEffectiveShoeStats(
                {
                  aggressiveness: selectedShoe.shoe?.aggressiveness,
                  climbingDiscipline: selectedShoe.shoe?.climbingDiscipline,
                  stiffness: selectedShoe.shoe?.stiffness,
                },
                {
                  comfortScore: selectedShoe.comfortScore,
                  performanceRating: selectedShoe.performanceRating,
                  durabilityRating: selectedShoe.durabilityRating,
                },
              );
              setEditingShoe(selectedShoe);
              setEditForm({
                size: selectedShoe.size || undefined,
                purchaseDate: selectedShoe.purchaseDate || undefined,
                condition: selectedShoe.condition || undefined,
                notes: selectedShoe.notes || undefined,
                showNotes: false,
                comfortScore: defaultStats.comfort,
                performanceRating: defaultStats.performance,
                durabilityRating: defaultStats.durability,
              });
              setIsStatsModalOpen(false);
            }
            : undefined
        }
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
