"use client";

import Image from "next/image";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useRequireAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import type { UserShoe } from "@/types/api";
import dynamic from "next/dynamic";

const CloudBackground = dynamic(() => import("@/components/CloudBackground"), {
  ssr: false,
  loading: () => null,
});
import { useLoading } from "@/contexts/LoadingContext";
import { SanctuaryGridSkeleton, StatsStripSkeleton } from "@/components/ui/skeleton";
import { buildSpecialLabels } from "@/utils/specialLabels";
import { AddShoeDialog } from "@/components/stash/AddShoeDialog";
import { useStashData } from "@/hooks/useStashData";
import { StatsStrip } from "@/components/stash/StatsStrip";
import CloudShoe from "@/components/CloudShoe";
import { useBrandGroups } from "@/hooks/useBrandGroups";
import { DataContributionNudge } from "@/components/DataContributionNudge";
import { debounce } from "@/lib/debounce";
import { riseDelay } from "@/lib/motion";
import { analyticsEvents, captureError, track } from "@/lib/analytics";
import { fetchApi } from "@/lib/api-client";

export default function ShoeSanctuaryPage() {
  const { data: session, isPending: sessionLoading } = useRequireAuth();
  const toast = useToast();
  const { showLoader, hideLoader } = useLoading();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedShoeId, setExpandedShoeId] = useState<string | null>(null);
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [dialogSelectedBrand, setDialogSelectedBrand] = useState<string>("all");
  const [dialogSelectedGender, setDialogSelectedGender] = useState<
    "all" | "men" | "women" | "kids" | "unisex"
  >("all");
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
    uniqueBrands,
    userData,
    catalogHasMore,
    catalogIsLoadingMore,
    catalogIsSearching,
    loadMoreCatalog,
  } = useStashData({
    catalog: {
      enabled: isAddDialogOpen,
      searchTerm: dialogSearchQuery,
      brand: dialogSelectedBrand,
      gender: dialogSelectedGender,
    },
  });

  const isPageLoading = !session?.user || isLoading;

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

  const brandGroups = useBrandGroups(userShoes);

  const flatShoes = useMemo(
    () => brandGroups.flatMap((group) => group.models.flatMap((model) => model.variants)),
    [brandGroups],
  );

  // Catalog is filtered server-side; only exclude shoes already in the stash
  const dialogSearchResults = useMemo(() => {
    const userShoeIds = new Set(userShoes.map((shoe) => shoe.shoeId));
    return allShoes.filter((shoe) => !userShoeIds.has(shoe._id));
  }, [allShoes, userShoes]);

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

  const rateShoe = useCallback(
    (shoe: UserShoe, field: 'comfortScore' | 'performanceRating' | 'durabilityRating', value: number) => {
      void updateUserShoeStats({
        userShoeId: shoe._id as Id<"userShoes">,
        ...(field === 'comfortScore' ? { comfortScore: value } : {}),
        ...(field === 'performanceRating' ? { performanceRating: value } : {}),
        ...(field === 'durabilityRating' ? { durabilityRating: value } : {}),
      }).catch(() => toast.error("Failed to save rating"));
    },
    [updateUserShoeStats, toast],
  );

  const updateShoeDetails = useCallback(
    (shoe: UserShoe, fields: { size?: string; condition?: string }) => {
      void updateUserShoeStats({
        userShoeId: shoe._id as Id<"userShoes">,
        ...(fields.size !== undefined ? { size: fields.size } : {}),
        ...(fields.condition !== undefined ? { condition: fields.condition } : {}),
      }).catch(() => toast.error("Failed to save shoe details"));
    },
    [updateUserShoeStats, toast],
  );

  const addShoeToSanctuary = async (shoeId: string) => {
    if (!userData) {
      toast.error("Failed to add shoe to sanctuary");
      return;
    }
    try {
      const userShoeId = await addToStash({
        userId: userData._id,
        shoeId: shoeId as Id<"shoes">,
      });
      setExpandedShoeId(String(userShoeId));
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

  const removeShoeFromStash = useCallback(async (userShoeId: string) => {
    try {
      await deleteUserShoe({ userShoeId: userShoeId as Id<"userShoes"> });
      toast.success("Shoe removed from your sanctuary");
      track(analyticsEvents.stashShoeRemoved, { shoe_id: userShoeId });
    } catch (error) {
      toast.error("Failed to remove shoe from sanctuary");
      captureError(error, { source: "stash_remove", shoe_id: userShoeId });
    }
  }, [deleteUserShoe, toast]);

  const toggleShoeFavourite = useCallback(async (shoe: UserShoe) => {
    try {
      await toggleFavourite({ userShoeId: shoe._id as Id<"userShoes"> });
      const newFavStatus = !shoe.isFavourite;
      void fetchApi("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify({ favoriteShoeId: newFavStatus ? shoe.shoeId : null }),
      });
      setUserShoes((prev) => prev.map((item) => (item._id === shoe._id ? { ...item, isFavourite: newFavStatus } : item)));
      toast.success(newFavStatus ? "Added to favorites!" : "Removed from favorites");
      track(analyticsEvents.stashFavouriteToggled, { shoe_id: shoe._id, is_favourite: newFavStatus });
    } catch (error) {
      toast.error("Failed to update favourite status");
      captureError(error, { source: "stash_toggle_favourite", shoe_id: shoe._id });
    }
  }, [toggleFavourite, setUserShoes, toast]);

  const confirmRemoveShoe = useCallback((shoe: UserShoe) => {
    if (confirm("Are you sure you want to remove this shoe from your sanctuary?")) {
      removeShoeFromStash(shoe._id);
    }
  }, [removeShoeFromStash]);

  useEffect(() => {
    if (sessionLoading) {
      showLoader("stash-session");
    } else {
      hideLoader("stash-session");
    }
    return () => hideLoader("stash-session");
  }, [sessionLoading, showLoader, hideLoader]);

  return (
    <div className="relative min-h-svh w-full bg-brand-base overflow-x-hidden">
      {backgroundFxReady && (
        <>
          <div
            className="sanctuary-cloud-backdrop fixed inset-[-4vw] pointer-events-none z-0"
            aria-hidden="true"
          >
            <div className="absolute inset-0 lab-fade">
              <Image
                src="/imgs/clouds/clouds 4.png"
                alt=""
                fill
                sizes="110vw"
                quality={72}
                className="object-cover"
              />
            </div>
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

      <div className="fixed inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/65 pointer-events-none z-0" />

      <div className="relative z-20">
        <section className="px-fluid-lg md:px-fluid-xl pt-fluid-lg pb-fluid-md">
          <div className="max-w-7xl mx-auto">
            <div
              className="lab-rise flex flex-wrap items-end justify-between gap-fluid-md"
            >
              <h1 className="font-so-cloudy uppercase text-fluid-5xl md:text-fluid-6xl text-white leading-none">
                Shoe Sanctuary
              </h1>

              <div className="flex flex-wrap items-center justify-end gap-fluid-md">
                {isPageLoading ? (
                  <StatsStripSkeleton />
                ) : (
                  userShoes.length > 0 && (
                    <StatsStrip
                      totalShoes={userShoes.length}
                      favouriteCount={
                        Array.isArray(userShoes)
                          ? userShoes.filter((s) => s.isFavourite).length
                          : 0
                      }
                      brandCount={stashBrands.length}
                    />
                  )
                )}

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
                  isSearching={catalogIsSearching}
                  onLoadMore={() => loadMoreCatalog(40)}
                />
              </div>
            </div>

            {!isPageLoading && userShoes.length > 0 && (
              <div className="lab-rise" style={riseDelay(1)}>
                <DataContributionNudge
                  stashCount={userShoes.length}
                  ratedCount={ratedShoeCount}
                />
              </div>
            )}
          </div>
        </section>

        <section className="px-fluid-lg md:px-fluid-xl pb-fluid-3xl">
          <div className="max-w-7xl mx-auto space-y-fluid-lg">
            {isPageLoading && <SanctuaryGridSkeleton />}

            {!isPageLoading && userShoes.length === 0 && (
              <div
                className="lab-rise flex flex-col items-center justify-center py-fluid-3xl text-center"
                style={riseDelay(3)}
              >
                <h3 className="lab-title text-fluid-xl text-white mb-fluid-xs">
                  NO SHOES YET
                </h3>
                <p className="font-mono text-brand-putty mb-fluid-md max-w-sm">
                  Add your first shoe to get started.
                </p>
              </div>
            )}

            {!isPageLoading && userShoes.length > 0 && (
              <div className="lab-rise grid items-start gap-fluid-lg sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={riseDelay(3)}>
                {flatShoes.map(({ item: shoe, variantLabel }) => (
                  <CloudShoe
                    key={shoe._id}
                    shoe={shoe}
                    variantLabel={variantLabel}
                    specialLabel={specialLabels[shoe._id]}
                    expanded={expandedShoeId === shoe._id}
                    onToggleExpand={() => setExpandedShoeId(expandedShoeId === shoe._id ? null : shoe._id)}
                    onToggleFavourite={() => toggleShoeFavourite(shoe)}
                    onRemove={() => confirmRemoveShoe(shoe)}
                    onRate={(field, value) => rateShoe(shoe, field, value)}
                    onUpdateDetails={(fields) => updateShoeDetails(shoe, fields)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

    </div>
  );
}
