'use client';

import { useState, useMemo } from 'react';
import { Footprints } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth';
import { useToast } from "@/components/ui/toast";
import type { UserShoe } from "@/types/api";
import { editFormSchema, type EditFormData } from '@/schemas/shoe-schema';
import EditShoeDialog from '@/components/EditShoeDialog';
import ShoeStatsModal from '@/components/ShoeStatsModal';
import CloudBackground from '@/components/CloudBackground';
import { FullPageLoading, LoadingBar } from '@/components/ui/loading';
import { addShoeToStash, removeShoeFromStash as removeShoeFromStashService, toggleFavouriteInStash, updateShoeInStash } from '@/services/stash';
import { buildSpecialLabels } from '@/utils/specialLabels';
import { AddShoeDialog } from '@/components/stash/AddShoeDialog';
import { useStashData } from '@/hooks/useStashData';
import { StatsStrip } from '@/components/stash/StatsStrip';
import { BrandSections } from '@/components/stash/BrandSections';
import { useBrandGroups } from '@/hooks/useBrandGroups';

export default function ShoeSanctuaryPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const toast = useToast();
  const [selectedShoe, setSelectedShoe] = useState<UserShoe | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
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
    onError: (message) => toast.addToast(message, 'error'),
  });

  // Calculate shoe rankings based on comfort score
  const shoeRankings = useMemo(() => {
    const ranked = [...userShoes].sort((a, b) => {
      // Sort by comfort score (descending), then performance, then durability
      const comfortDiff = (b.comfortScore || 0) - (a.comfortScore || 0);
      if (comfortDiff !== 0) return comfortDiff;

      const perfDiff = (b.performanceRating || 0) - (a.performanceRating || 0);
      if (perfDiff !== 0) return perfDiff;

      return (b.durabilityRating || 0) - (a.durabilityRating || 0);
    });

    const rankings = new Map<string, number>();
    ranked.forEach((shoe, index) => {
      rankings.set(shoe._id, index + 1);
    });

    return rankings;
  }, [userShoes]);

  // Calculate special shoe labels
  const specialLabels = useMemo(() => buildSpecialLabels(userShoes), [userShoes]);

  const brandGroups = useBrandGroups(userShoes);

  // Search for shoes
  const searchResults = useMemo(() => {
    let results: typeof allShoes = allShoes;

    // Filter by brand if selected
    if (selectedBrand !== 'all') {
      results = results.filter(shoe => shoe.brand === selectedBrand);
    }

    // Filter by search query
    if (searchQuery.length > 2) {
      results = results.filter(shoe =>
        shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shoe.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return results;
  }, [searchQuery, allShoes, selectedBrand]);

  const addShoeToSanctuary = async (shoeId: string) => {
    const result = await addShoeToStash(shoeId);
    result.match(
      () => {
        invalidateCache();
        fetchUserStash();
        setIsAddDialogOpen(false);
        setSearchQuery('');
        toast.addToast('Shoe added to your sanctuary!', 'success');
      },
      (error) => {
        console.error('Failed to add shoe:', error);
        toast.addToast('Failed to add shoe to sanctuary', 'error');
      }
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
        toast.addToast('Shoe removed from your sanctuary', 'success');
      },
      (error) => {
        console.error('Failed to remove shoe:', error);
        toast.addToast('Failed to remove shoe from sanctuary', 'error');
      }
    );
  };

  const updateShoeStats = async () => {
    if (!editingShoe) return;

    const validationResult = editFormSchema.safeParse(editForm);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      console.error('Validation errors:', errors);
      toast.addToast('Please check your input values', 'error');
      return;
    }

    const result = await updateShoeInStash(editingShoe._id, editForm);
    result.match(
      () => {
        invalidateCache();
        fetchUserStash();
        setEditingShoe(null);
        setSelectedShoe(null);
        toast.addToast('Shoe updated successfully!', 'success');
      },
      (error) => {
        console.error('Failed to update shoe:', error);
        toast.addToast('Failed to update shoe', 'error');
      }
    );
  };


  const selectedFullShoe = useMemo(() => {
    if (!selectedShoe) return undefined;
    const baseShoe = allShoes.find(s => s._id === selectedShoe.shoeId);
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
          <h1 className="text-title-md font-bold mb-4 font-so-cloudy uppercase">Shoe Sanctuary</h1>
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
          style={{ backgroundImage: 'url("/imgs/clouds/clouds 4.png")', filter: 'brightness(0.5)' }}
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
                <p className="font-mono text-xs text-orange-500 mb-fluid-sm tracking-[0.3em]">[SANCTUARY]</p>
                <h1 className="font-so-cloudy uppercase text-fluid-6xl md:text-fluid-7xl text-white leading-none">
                  Shoe<br />
                  <span className="text-orange-500">Sanctuary</span>
                </h1>
                <p className="font-sora text-neutral-500 text-sm md:text-fluid-base mt-fluid-sm max-w-md">
                  Your personal climbing shoe collection. Click any shoe to view stats, edit, or manage.
                </p>
              </div>

              <AddShoeDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedBrand={selectedBrand}
                onBrandChange={setSelectedBrand}
                uniqueBrands={uniqueBrands}
                searchResults={searchResults}
                onSelectShoe={addShoeToSanctuary}
              />
            </motion.div>

            {userShoes.length > 0 && (
              <StatsStrip
                totalShoes={userShoes.length}
                favouriteCount={Array.isArray(userShoes) ? userShoes.filter((s) => s.isFavourite).length : 0}
                brandCount={brandGroups.length}
              />
            )}
          </div>
        </section>

        <section className="px-fluid-lg md:px-fluid-xl pb-fluid-3xl">
          <div className="max-w-7xl mx-auto">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-fluid-3xl">
                <div className="flex items-center gap-2 mb-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-neutral-500 tracking-[0.2em]">[LOADING_SANCTUARY]</span>
                <LoadingBar size="lg" />
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
                <h3 className="font-tanker text-fluid-3xl text-white mb-fluid-xs">YOUR SANCTUARY AWAITS</h3>
                <p className="font-sora text-neutral-500 mb-fluid-md max-w-sm">
                  Start building your climbing shoe collection. Add your first shoe to track stats and get recommendations.
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
        onToggleFavourite={selectedShoe ? async () => {
          const result = await toggleFavouriteInStash(selectedShoe._id);
          result.match(
            () => {
              const newFavStatus = !selectedShoe.isFavourite;
              setSelectedShoe(prev => prev ? { ...prev, isFavourite: newFavStatus } : null);
              setUserShoes(prev => prev.map(shoe =>
                shoe._id === selectedShoe._id
                  ? { ...shoe, isFavourite: newFavStatus }
                  : shoe
              ));
              fetchUserStash();
              toast.addToast(newFavStatus ? 'Added to favorites!' : 'Removed from favorites', 'success');
            },
            (error) => {
              console.error('Failed to update favourite status:', error);
              toast.addToast('Failed to update favourite status', 'error');
            }
          );
        } : undefined}
        onEditShoe={selectedShoe ? () => {
          setEditingShoe(selectedShoe);
          setEditForm({
            size: selectedShoe.size || undefined,
            purchaseDate: selectedShoe.purchaseDate || undefined,
            condition: selectedShoe.condition || undefined,
            notes: selectedShoe.notes || undefined,
            showNotes: false,
            comfortScore: selectedShoe.comfortScore || undefined,
            performanceRating: selectedShoe.performanceRating || undefined,
            durabilityRating: selectedShoe.durabilityRating || undefined,
          });
          setIsStatsModalOpen(false);
        } : undefined}
        onRemoveShoe={selectedShoe ? () => {
          if (confirm('Are you sure you want to remove this shoe from your sanctuary?')) {
            removeShoeFromStash(selectedShoe._id);
          }
        } : undefined}
      />

      <EditShoeDialog
        editingShoe={editingShoe}
        editForm={editForm}
        setEditForm={setEditForm}
        setEditingShoe={setEditingShoe}
        updateShoeStats={updateShoeStats}
        removeShoe={editingShoe ? () => {
          if (confirm('Are you sure you want to remove this shoe from your sanctuary?')) {
            removeShoeFromStash(editingShoe._id);
            setEditingShoe(null);
          }
        } : undefined}
      />
    </div>
  );
}
