'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Footprints, ArrowUpRight, Star, Zap, Target, Heart, Crown, Clock } from 'lucide-react';
import ShoeImage from '@/components/ShoeImage';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/lib/auth';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { fetchApi } from '@/lib/api-client';
import { shoeCache } from '@/lib/cache';
import { useToast } from "@/components/ui/toast";
import type { UserShoe, GetStashResponse } from "@/types/api";
import CloudShoe from '@/components/CloudShoe';
import EditShoeDialog from '@/components/EditShoeDialog';
import ShoeStatsModal from '@/components/ShoeStatsModal';
import CloudBackground from '@/components/CloudBackground';
import { FullPageLoading, LoadingBar } from '@/components/ui/loading';

const MarqueeText = ({ children, reverse = false }: { children: React.ReactNode; reverse?: boolean }) => (
  <motion.div
    animate={{ x: reverse ? [0, 500] : [0, -500] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    className="flex gap-8 whitespace-nowrap"
  >
    {Array(20).fill(null).map((_, i) => (
      <span key={i} className="font-tanker text-xl text-white/30">
        {children}
      </span>
    ))}
  </motion.div>
);


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
  const popularityMap = popularityData ? new Map(popularityData.map(p => [p.shoeId, p.count])) : new Map();
  const totalShoesInDatabase = popularityData ? popularityData.reduce((sum, p) => sum + p.count, 0) : 0;

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
        toast.addToast(response.error || 'Failed to load your shoe collection', 'error');
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
        const prevOrder = conditionOrder[current.condition as keyof typeof conditionOrder] ?? 999;
        const currentOrder = conditionOrder[prev.condition as keyof typeof conditionOrder] ?? 999;
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
        toast.addToast(response.error || 'Failed to add shoe', 'error');
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
        toast.addToast(response.error || 'Failed to remove shoe', 'error');
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
        toast.addToast(response.error || 'Failed to update shoe', 'error');
      }
    } catch (error) {
      console.error('Failed to update shoe:', error);
      toast.addToast('Failed to update shoe', 'error');
    }
  };


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
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Cloud background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/imgs/clouds/clouds 4.png")' }}
      />

      {/* Floating clouds animation - between background and content */}
      <CloudBackground />

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 via-blue-300/20 to-blue-200/20" />

      {/* Header and Content Container */}
      <div className="absolute top-0 left-0 right-0 bottom-0 z-20 p-6" >
        <div className="flex flex-col items-center justify-around max-w-7xl mx-auto h-full">
          {/* Title Section */}
          <div className="text-center">
            <h1 className="text-title-xl font-bold text-white mb-0 font-so-cloudy uppercase relative inline-block">
              Shoe Sanctuary
              <svg style={{ position: 'absolute', left: 0, width: '100%', height: '10px' }} viewBox="0 0 200 10" preserveAspectRatio="none">
                <path d="M0,5 Q25,0 50,5 T100,5 T150,5 T200,5" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            </h1>
          </div>

          {/* Floating Add Shoe Button */}
          <div className="flex items-center justify-between flex-col h-fit w-full ">
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
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Shoe</span>
                </motion.button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 text-gray-100 border border-white/30 max-w-2xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white font-so-cloudy uppercase text-2xl text-center">
                    Add New Shoe
                  </DialogTitle>
                  <DialogDescription className="text-white/80 text-center">
                    Search and add climbing shoes to your collection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      placeholder="Search for shoes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 bg-white/20 text-white placeholder:text-white/60 border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 rounded-lg h-12 text-lg"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Label className="text-sm text-white/80 font-medium">Filter by Brand:</Label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="flex-1 bg-white/20 text-white border border-white/30 rounded-lg px-4 py-2 text-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      <option value="all">All Brands</option>
                      {uniqueBrands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {searchResults.map((shoe) => (
                      <div
                        key={shoe._id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer transition-all duration-300 border border-white/20 hover:border-white/50 hover:scale-[1.02] group"
                        onClick={() => addShoeToSanctuary(shoe._id)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Shoe image */}
                          <div className="w-16 h-16 bg-white/20 rounded-lg overflow-hidden flex-shrink-0">
                            <ShoeImage
                              brand={shoe.brand}
                              shoeName={shoe.name}
                              imageUrl={shoe.imageUrl}
                              className="w-full h-full object-contain p-2"
                              transformation={[
                                {
                                  height: 64,
                                  width: 64,
                                  format: "auto",
                                  quality: 75
                                }
                              ]}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-white group-hover:text-white transition-colors">{shoe.name}</p>
                            <p className="text-sm text-white/70">{shoe.brand}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60 group-hover:text-white transition-colors">Click to add</span>
                          <Plus className="w-6 h-6 text-white group-hover:rotate-90 transition-all duration-300" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {searchQuery.length > 2 && searchResults.length === 0 && (
                    <div className="text-center py-8">
                      <Footprints className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-300 text-lg">No shoes found 😔</p>
                      <p className="text-sm text-gray-400 mt-2">Try searching for brands like &quot;La Sportiva&quot;, &quot;Scarpa&quot;, or &quot;Five Ten&quot;</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Floating shoes - centered grouped by brand */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-fluid-xl h-full flex items-center justify-center p-fluid-lg">
                <div className="flex flex-wrap justify-center gap-fluid-lg">
                  {Object.entries(
                    userShoes.reduce((acc: Record<string, UserShoe[]>, shoe: UserShoe) => {
                      const brand = shoe.shoe.brand;
                      if (!acc[brand]) acc[brand] = [];
                      acc[brand].push(shoe);
                      return acc;
                    }, {} as Record<string, UserShoe[]>)
                  ).map(([brand, shoes]: [string, UserShoe[]]) => (
                    <div key={brand} className="flex flex-col items-center">
                      <p className="text-3xl font-so-cloudy uppercase mb-4 text-center font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.3)' }}>{brand}</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {shoes.map((shoe: UserShoe, index: number) => (
                          <CloudShoe
                            key={shoe._id}
                            shoe={shoe}
                            onClick={() => {
                              setSelectedShoe(shoe);
                              setIsStatsModalOpen(true);
                            }}
                            index={index}
                            specialLabel={specialLabels[shoe._id]}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                        <span className="font-mono text-[10px] text-white/60 tracking-[0.2em]">[LOADING SANCTUARY]</span>
                        <LoadingBar size="lg" />
                      </div>
                    </div>
                  )}

                  {!isLoading && userShoes.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                      <Footprints className="w-16 h-16 mb-4" />
                      <p className="text-xl">Your sanctuary is empty</p>
                      <p className="text-sm">Click &quot;Add Shoe&quot; to start your collection.</p>
                    </div>
                  )}
                </div>
              </div>
            </div >

            <ShoeStatsModal
              shoe={selectedShoe}
              fullShoe={selectedShoe ? {
                ...allShoes.find(s => s._id === selectedShoe.shoeId),
                popularityCount: popularityMap.get(selectedShoe.shoeId),
                totalShoesInDatabase
              } : undefined}
              isOpen={isStatsModalOpen}
              onClose={() => {
                setIsStatsModalOpen(false);
                setSelectedShoe(null);
              }}
              userShoes={userShoes}
              rank={selectedShoe ? shoeRankings.get(selectedShoe._id) : undefined}
              onToggleFavourite={selectedShoe ? async () => {
                try {
                  const response = await fetchApi(`/api/v1/stash/${selectedShoe._id}/favourite`, { method: 'POST' });
                  if (response) {
                    const newFavStatus = !selectedShoe.isFavourite;
                    // Update the selectedShoe state to trigger re-render
                    setSelectedShoe(prev => prev ? { ...prev, isFavourite: newFavStatus } : null);
                    // Also update the userShoes array to update the cloud shoes immediately
                    setUserShoes(prev => prev.map(shoe =>
                      shoe._id === selectedShoe._id
                        ? { ...shoe, isFavourite: newFavStatus }
                        : shoe
                    ));
                    await fetchUserStash();
                    toast.addToast(newFavStatus ? 'Added to favorites!' : 'Removed from favorites', 'success');
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
        </div>
      </div>
    </div>
  );
}
