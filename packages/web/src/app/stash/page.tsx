'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Footprints, Heart, Crown, Clock } from 'lucide-react';
import ShoeImage from '@/components/ShoeImage';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { fetchApi } from '@/lib/api-client';
import { shoeCache } from '@/lib/cache';
import { useToast } from "@/components/ui/toast";
import type { UserShoe, GetStashResponse } from "@/types/api";
import { editFormSchema, type EditFormData } from '@/schemas/shoe-schema';
import CloudShoe from '@/components/CloudShoe';
import EditShoeDialog from '@/components/EditShoeDialog';
import ShoeStatsModal from '@/components/ShoeStatsModal';
import CloudBackground from '@/components/CloudBackground';
import { FullPageLoading, LoadingBar } from '@/components/ui/loading';

export default function ShoeSanctuaryPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const toast = useToast();
  const [userShoes, setUserShoes] = useState<UserShoe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Fetch all shoes from Convex
  const shoesData = useQuery(api.shoes.list);
  const allShoes = useMemo(() => shoesData ?? [], [shoesData]);

  // Fetch popularity data for all shoes
  const popularityData = useQuery(api.popularity.getAllShoesPopularity);
  const popularityMap = useMemo(() => (
    popularityData ? new Map(popularityData.map(p => [p.shoeId, p.count])) : new Map()
  ), [popularityData]);
  const totalShoesInDatabase = useMemo(() => (
    popularityData ? popularityData.reduce((sum, p) => sum + p.count, 0) : 0
  ), [popularityData]);

  const fetchUserStash = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to get from cache first
      const cacheKey = `user-stash-${session?.user?.id}`;
      const cachedData = shoeCache.get<GetStashResponse>(cacheKey);

      if (cachedData) {
        setUserShoes(cachedData.data || []);
        setIsLoading(false);
        return;
      }

      const response = await fetchApi<GetStashResponse>('/api/v1/stash');
      if (response.isOk()) {
        setUserShoes(response.value.data || []);
        // Cache the response for 5 minutes
        shoeCache.set(cacheKey, response.value, 5 * 60 * 1000);
      } else {
        toast.addToast(response.error?.message || 'Failed to load your shoe collection', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch user stash:', error);
      toast.addToast('Failed to load your shoe collection', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [toast, session?.user?.id]);

  // Fetch user's stash from Hono API
  useEffect(() => {
    if (session?.user) {
      fetchUserStash();
    }
  }, [session, fetchUserStash]);

  // Get unique brands
  const uniqueBrands = useMemo(() => {
    const brands = [...new Set(allShoes.map(shoe => shoe.brand))].sort();
    return brands;
  }, [allShoes]);

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
  const specialLabels = useMemo(() => {
    if (userShoes.length <= 1) return {};

    const labels: Record<string, { type: 'most-worn' | 'oldest' | 'most-comfy'; icon: React.ReactNode }> = {};

    // Most comfortable (highest comfort score)
    const mostComfy = userShoes.reduce((prev, current) =>
      (current.comfortScore || 0) > (prev.comfortScore || 0) ? current : prev
    );
    if (mostComfy.comfortScore && mostComfy.comfortScore > 0) {
      labels[mostComfy._id] = {
        type: 'most-comfy',
        icon: <Heart className="w-3 h-3" />
      };
    }

    // Oldest shoe (earliest purchase date)
    const shoesWithDate = userShoes.filter(shoe => shoe.purchaseDate);
    if (shoesWithDate.length > 0) {
      const oldest = shoesWithDate.reduce((prev, current) =>
        new Date(current.purchaseDate!).getTime() < new Date(prev.purchaseDate!).getTime() ? current : prev
      );
      labels[oldest._id] = {
        type: 'oldest',
        icon: <Clock className="w-3 h-3" />
      };
    }

    // Most worn (placeholder for future wear tracking)
    // For now, we'll use the shoe with the lowest condition
    const shoesWithCondition = userShoes.filter(shoe => shoe.condition);
    if (shoesWithCondition.length > 0) {
      const conditionOrder = { 'worn': 0, 'fair': 1, 'good': 2, 'excellent': 3, 'new': 4 };
      const mostWorn = shoesWithCondition.reduce((prev, current) => {
        const prevOrder = conditionOrder[prev.condition as keyof typeof conditionOrder] ?? 999;
        const currentOrder = conditionOrder[current.condition as keyof typeof conditionOrder] ?? 999;
        return currentOrder < prevOrder ? current : prev;
      });
      labels[mostWorn._id] = {
        type: 'most-worn',
        icon: <Crown className="w-3 h-3" />
      };
    }

    return labels;
  }, [userShoes]);

  // Search for shoes
  const searchResults = useMemo(() => {
    let results = allShoes;

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
    try {
      const response = await fetchApi<ApiResponse<UserShoe>>('/api/v1/stash', {
        method: 'POST',
        body: JSON.stringify({ shoeId }),
      });

      if (response.isOk()) {
        // Clear cache when adding new shoe
        shoeCache.clear();
        await fetchUserStash();
        setIsAddDialogOpen(false);
        setSearchQuery('');
        toast.addToast('Shoe added to your sanctuary!', 'success');
      } else {
        toast.addToast(response.error?.message || 'Failed to add shoe', 'error');
      }
    } catch (error) {
      console.error('Failed to add shoe:', error);
      toast.addToast('Failed to add shoe to sanctuary', 'error');
    }
  };

  // Define API response types
  interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
  }

  const removeShoeFromStash = async (shoeId: string) => {
    try {
      const response = await fetchApi<ApiResponse<null>>(`/api/v1/stash/${shoeId}`, {
        method: 'DELETE',
      });

      if (response.isOk()) {
        // Clear cache when removing shoe
        shoeCache.clear();
        await fetchUserStash();
        setIsStatsModalOpen(false);
        setSelectedShoe(null);
        toast.addToast('Shoe removed from your sanctuary', 'success');
      } else {
        toast.addToast(response.error?.message || 'Failed to remove shoe', 'error');
      }
    } catch (error) {
      console.error('Failed to remove shoe:', error);
      toast.addToast('Failed to remove shoe from sanctuary', 'error');
    }
  };

  const updateShoeStats = async () => {
    if (!editingShoe) return;

    // Validate form data with Zod
    const validationResult = editFormSchema.safeParse(editForm);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      console.error('Validation errors:', errors);
      toast.addToast('Please check your input values', 'error');
      return;
    }

    try {
      const response = await fetchApi<ApiResponse<UserShoe>>(`/api/v1/stash/${editingShoe._id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });

      if (response.isOk()) {
        // Clear cache when updating shoe
        shoeCache.clear();
        await fetchUserStash();
        setEditingShoe(null);
        setSelectedShoe(null);
        toast.addToast('Shoe updated successfully!', 'success');
      } else {
        toast.addToast(response.error?.message || 'Failed to update shoe', 'error');
      }
    } catch (error) {
      console.error('Failed to update shoe:', error);
      toast.addToast('Failed to update shoe', 'error');
    }
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
        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
            >
              <div>
                <p className="font-mono text-xs text-orange-500 mb-2 tracking-[0.3em]">[SANCTUARY]</p>
                <h1 className="font-so-cloudy uppercase text-5xl md:text-7xl lg:text-8xl text-white leading-none">
                  Shoe<br />
                  <span className="text-orange-500">Sanctuary</span>
                </h1>
                <p className="font-sora text-neutral-500 text-sm mt-3 max-w-md">
                  Your personal climbing shoe collection. Click any shoe to view stats, edit, or manage.
                </p>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) {
                  setSelectedBrand('all');
                  setSearchQuery('');
                }
              }}>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg px-8 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-colors duration-200 flex items-center gap-2 w-fit"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Shoe</span>
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="bg-neutral-950 text-white border border-neutral-800 max-w-2xl shadow-2xl shadow-orange-500/5 rounded-3xl">
                  <DialogHeader>
                    <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] text-center">[ADD_SHOE]</p>
                    <DialogTitle className="text-white font-so-cloudy uppercase text-2xl text-center">
                      Add New Shoe
                    </DialogTitle>
                    <DialogDescription className="text-neutral-500 text-center font-sora">
                      Search and add climbing shoes to your collection
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                      <Input
                        placeholder="Search for shoes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 bg-neutral-900 text-white placeholder:text-neutral-600 border-neutral-800 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-xl h-12 text-lg"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Label className="text-xs text-neutral-500 font-mono">Brand:</Label>
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="flex-1 bg-neutral-900 text-white border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                      >
                        <option value="all">All Brands</option>
                        {uniqueBrands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                      {searchResults.map((shoe) => (
                        <div
                          key={shoe._id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 cursor-pointer transition-all duration-300 border border-neutral-800 hover:border-orange-500/30 group"
                          onClick={() => addShoeToSanctuary(shoe._id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                              <ShoeImage
                                brand={shoe.brand}
                                shoeName={shoe.name}
                                imageUrl={shoe.imageUrl}
                                className="p-1.5"
                                transformation={[{ height: 64, width: 64, crop: "at_max", cropMode: "pad_resize", format: "png", quality: 75 }]}
                                gender={shoe.gender}
                              />
                            </div>
                            <div>
                              <p className="font-sora font-medium text-white group-hover:text-orange-500 transition-colors">{shoe.name}</p>
                              <p className="text-xs text-neutral-500 font-mono">{shoe.brand}</p>
                            </div>
                          </div>
                          <Plus className="w-5 h-5 text-neutral-600 group-hover:text-orange-500 group-hover:rotate-90 transition-all duration-300" />
                        </div>
                      ))}
                    </div>

                    {searchQuery.length > 2 && searchResults.length === 0 && (
                      <div className="text-center py-8">
                        <AnimatedIcon animation="bounce" trigger="scroll" className="mx-auto mb-4">
                          <Footprints className="w-12 h-12 text-neutral-700" />
                        </AnimatedIcon>
                        <p className="text-neutral-400 font-sora">No shoes found</p>
                        <p className="text-xs text-neutral-600 font-mono mt-2">Try &quot;La Sportiva&quot;, &quot;Scarpa&quot;, or &quot;Five Ten&quot;</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>

            {userShoes.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-6 mt-8"
              >
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3">
                  <span className="font-tanker text-2xl text-orange-500">{userShoes.length}</span>
                  <span className="text-neutral-500 font-sora text-xs ml-2">shoes</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3">
                  <span className="font-tanker text-2xl text-orange-500">
                    {Array.isArray(userShoes) ? userShoes.filter(s => s.isFavourite).length : 0}
                  </span>
                  <span className="text-neutral-500 font-sora text-xs ml-2">favorites</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3">
                  <span className="font-tanker text-2xl text-orange-500">
                    {Object.keys(userShoes.reduce((acc: Record<string, boolean>, s) => { acc[s.shoe.brand] = true; return acc; }, {})).length}
                  </span>
                  <span className="text-neutral-500 font-sora text-xs ml-2">brands</span>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-16 pb-24">
          <div className="max-w-7xl mx-auto">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32">
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
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6"
                >
                  <Footprints className="w-10 h-10 text-orange-500" />
                </motion.div>
                <h3 className="font-tanker text-3xl text-white mb-2">YOUR SANCTUARY AWAITS</h3>
                <p className="font-sora text-neutral-500 mb-6 max-w-sm">
                  Start building your climbing shoe collection. Add your first shoe to track stats and get recommendations.
                </p>
              </motion.div>
            )}

            {!isLoading && userShoes.length > 0 && (
              <div className="space-y-16">
                {Object.entries(
                  userShoes.reduce((acc: Record<string, UserShoe[]>, shoe: UserShoe) => {
                    const brand = shoe.shoe.brand;
                    if (!acc[brand]) acc[brand] = [];
                    acc[brand].push(shoe);
                    return acc;
                  }, {} as Record<string, UserShoe[]>)
                ).map(([brand, shoes]: [string, UserShoe[]], brandIndex: number) => (
                  <motion.div
                    key={brand}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: brandIndex * 0.15 }}
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <h2 className="font-so-cloudy uppercase text-3xl md:text-4xl text-white">{brand}</h2>
                      <div className="flex-1 h-px bg-neutral-800" />
                      <span className="font-mono text-[10px] text-neutral-600 tracking-wider">{shoes.length} {shoes.length === 1 ? 'SHOE' : 'SHOES'}</span>
                    </div>
                    <div className="flex flex-wrap gap-5">
                      {shoes.map((shoe: UserShoe, index: number) => (
                        <CloudShoe
                          key={shoe._id}
                          shoe={shoe}
                          onClick={() => {
                            setSelectedShoe(shoe);
                            setIsStatsModalOpen(true);
                          }}
                          index={index + brandIndex * 10}
                          specialLabel={specialLabels[shoe._id]}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
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
          try {
            const response = await fetchApi<ApiResponse<UserShoe>>(`/api/v1/stash/${selectedShoe._id}/favourite`, { method: 'POST' });
            if (response.isOk()) {
              const newFavStatus = !selectedShoe.isFavourite;
              setSelectedShoe(prev => prev ? { ...prev, isFavourite: newFavStatus } : null);
              setUserShoes(prev => prev.map(shoe =>
                shoe._id === selectedShoe._id
                  ? { ...shoe, isFavourite: newFavStatus }
                  : shoe
              ));
              await fetchUserStash();
              toast.addToast(newFavStatus ? 'Added to favorites!' : 'Removed from favorites', 'success');
            } else {
              toast.addToast(response.error?.message || 'Failed to update favourite status', 'error');
            }
          } catch {
            toast.addToast('Failed to update favourite status', 'error');
          }
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
