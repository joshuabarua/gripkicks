'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOrientationScale } from '@/hooks/useOrientationScale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, X, Edit2, Footprints } from 'lucide-react';
import { useSession } from '@/lib/auth';
import { AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { fetchApi } from '@/lib/api-client';
import { useToast } from "@/components/ui/toast";
import type { UserShoe, GetStashResponse } from "@/types/api";
import { editFormSchema, type EditFormData } from '@/schemas/shoe-schema';
import CloudShoe from '@/components/CloudShoe';
import EditShoeDialog from '@/components/EditShoeDialog';
import CloudBackground from '@/components/CloudBackground';


export default function ShoeSanctuaryPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const toast = useToast();
  const { isPortrait, isLandscape, scale, orientation } = useOrientationScale();
  const [userShoes, setUserShoes] = useState<UserShoe[]>([]);
  const [selectedShoe, setSelectedShoe] = useState<UserShoe | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const fetchUserStash = useCallback(async () => {
    try {
      const response = await fetchApi<GetStashResponse>('/api/v1/stash');
      if (response.success && response.data) {
        setUserShoes(response.data);
      } else {
        toast.addToast(response.error || 'Failed to load your shoe collection', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch user stash:', error);
      toast.addToast('Failed to load your shoe collection', 'error');
    }
  }, [toast]);

  // Fetch user's stash from Hono API
  useEffect(() => {
    if (session?.user) {
      fetchUserStash();
    }
  }, [session, fetchUserStash]);

  // Search for shoes
  const searchResults = useMemo(() => {
    if (searchQuery.length > 2) {
      return allShoes.filter(shoe =>
        shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shoe.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  }, [searchQuery, allShoes]);

  const addShoeToSanctuary = async (shoeId: string) => {
    try {
      const response = await fetchApi<ApiResponse<UserShoe>>('/api/v1/stash', {
        method: 'POST',
        body: JSON.stringify({ shoeId }),
      });

      if (response.success) {
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

      if (response.success) {
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

  const removeShoe = async (shoeId: string) => {
    try {
      const response = await fetchApi<ApiResponse<void>>(`/api/v1/stash/${shoeId}`, { method: 'DELETE' });

      if (response.success) {
        await fetchUserStash();
        setSelectedShoe(null);
        toast.addToast('Shoe removed from your sanctuary', 'success');
      } else {
        toast.addToast(response.error || 'Failed to remove shoe', 'error');
      }
    } catch (error) {
      console.error('Failed to remove shoe:', error);
      toast.addToast('Failed to remove shoe', 'error');
    }
  };

  const openEditDialog = (shoe: UserShoe) => {
    setEditingShoe(shoe);
    setEditForm({
      size: shoe.size || undefined,
      purchaseDate: shoe.purchaseDate || undefined,
      condition: shoe.condition || undefined,
      notes: shoe.notes || undefined,
      showNotes: !!shoe.notes,
      comfortScore: shoe.comfortScore,
      performanceRating: shoe.performanceRating,
      durabilityRating: shoe.durabilityRating,
    });
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4 font-so-cloudy uppercase leading-[0.9]" style={{ fontSize: 'clamp(40px, 10vw, 60px)', lineHeight: 0.9 }}>Shoe Sanctuary</h1>
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

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6" style={{ paddingTop: '160px' }}>
        <div className="flex justify-center items-center">
          <div className="text-center">
            <h1
              className="text-4xl font-bold text-white mb-0 font-so-cloudy uppercase leading-[0.9]"
              style={{
                fontSize: isPortrait
                  ? `clamp(60px, 15vh, ${136 * scale}px)`
                  : `clamp(40px, 8vw, ${100 * scale}px)`,
                position: 'relative',
                display: 'inline-block',
                lineHeight: 0.9,
                transform: `scale(${Math.min(scale, 1.2)})`
              }}
            >
              Shoe Sanctuary
              <svg style={{ position: 'absolute', bottom: '-50px', left: 0, width: '100%', height: '10px' }} viewBox="0 0 200 10" preserveAspectRatio="none">
                <path d="M0,5 Q25,0 50,5 T100,5 T150,5 T200,5" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            </h1>
          </div>
          <div className="absolute right-6">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shoe
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/95 backdrop-blur-sm text-gray-100 border border-gray-700 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-gray-100 font-so-cloudy uppercase">Add New Shoe</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Search for climbing shoes to add to your sanctuary
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by shoe name or brand..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800/50 text-gray-100 placeholder:text-gray-500 border-gray-600 focus:border-gray-500"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchResults.map((shoe) => (
                      <div
                        key={shoe._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer transition-colors border border-gray-700"
                        onClick={() => addShoeToSanctuary(shoe._id)}
                      >
                        <div>
                          <p className="font-medium">{shoe.name}</p>
                          <p className="text-sm text-gray-400">{shoe.brand}</p>
                        </div>
                        <Plus className="w-5 h-5" />
                      </div>
                    ))}
                  </div>

                  {searchQuery.length > 2 && searchResults.length === 0 && (
                    <p className="text-center text-gray-400 py-4">
                      No shoes found. Try searching for climbing shoe brands like &quot;La Sportiva&quot;, &quot;Scarpa&quot;, or &quot;Five Ten&quot;.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Floating shoes - centered grouped by brand */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div
          className="relative w-full h-[600px] flex items-center justify-center"
          style={{
            maxWidth: isPortrait ? '100%' : '1200px',
            height: isPortrait ? '50vh' : '600px',
            padding: isPortrait ? '20px' : '40px'
          }}
        >
          <div
            className="flex flex-wrap justify-center gap-8"
            style={{
              gap: isPortrait ? `${16 * scale}px` : '32px',
              transform: `scale(${Math.min(scale, 1.1)})`
            }}
          >
            {Object.entries(
              userShoes.reduce((acc: Record<string, UserShoe[]>, shoe: UserShoe) => {
                const brand = shoe.shoe.brand;
                if (!acc[brand]) acc[brand] = [];
                acc[brand].push(shoe);
                return acc;
              }, {} as Record<string, UserShoe[]>)
            ).map(([brand, shoes]: [string, UserShoe[]], brandIndex: number) => (
              <div key={brand} className="relative">
                <p className="text-white/60 text-lg font-so-cloudy uppercase mb-2 text-center">{brand}</p>
                <div className="relative w-[300px] h-[300px]">
                  {shoes.map((shoe: UserShoe, index: number) => (
                    <CloudShoe
                      key={shoe._id}
                      shoe={shoe}
                      onClick={() => setSelectedShoe(shoe)}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))}

            {userShoes.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                <Footprints className="w-16 h-16 mb-4" />
                <p className="text-xl">Your sanctuary is empty</p>
                <p className="text-sm">Click &quot;Add Shoe&quot; to start your collection.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <AnimatePresence>
        {selectedShoe && !editingShoe && (
          <Dialog open={!!selectedShoe} onOpenChange={() => setSelectedShoe(null)}>
            <DialogContent className="bg-gray-900/95 backdrop-blur-sm text-gray-100 border border-gray-700 max-w-md">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl text-gray-100 font-so-cloudy uppercase">{selectedShoe.shoe.name}</DialogTitle>
                    <DialogDescription className="text-gray-400">{selectedShoe.shoe.brand}</DialogDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(selectedShoe)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {selectedShoe.size && (
                  <div>
                    <Label className="text-sm text-gray-400">Size</Label>
                    <p className="font-medium">{selectedShoe.size}</p>
                  </div>
                )}

                {selectedShoe.purchaseDate && (
                  <div>
                    <Label className="text-sm text-gray-400">Purchase Date</Label>
                    <p className="font-medium">{selectedShoe.purchaseDate}</p>
                  </div>
                )}

                {selectedShoe.condition && (
                  <div>
                    <Label className="text-sm text-gray-400">Condition</Label>
                    <p className="font-medium">{selectedShoe.condition}</p>
                  </div>
                )}

                {selectedShoe.notes && (
                  <div>
                    <Label className="text-sm text-gray-400">Notes</Label>
                    <p className="font-medium">{selectedShoe.notes}</p>
                  </div>
                )}

                {(selectedShoe.comfortScore || selectedShoe.performanceRating || selectedShoe.durabilityRating) && (
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Comfort Rankings</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedShoe.comfortScore && (
                        <div>
                          <Label className="text-sm text-gray-400">Comfort</Label>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{selectedShoe.comfortScore}/10</span>
                            <div className="flex">
                              {[...Array(10)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < (selectedShoe.comfortScore || 0) ? 'text-yellow-400' : 'text-gray-600'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedShoe.performanceRating && (
                        <div>
                          <Label className="text-sm text-gray-400">Performance</Label>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{selectedShoe.performanceRating}/10</span>
                            <div className="flex">
                              {[...Array(10)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < (selectedShoe.performanceRating || 0) ? 'text-blue-400' : 'text-gray-600'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedShoe.durabilityRating && (
                        <div>
                          <Label className="text-sm text-gray-400">Durability</Label>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{selectedShoe.durabilityRating}/10</span>
                            <div className="flex">
                              {[...Array(10)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < (selectedShoe.durabilityRating || 0) ? 'text-green-400' : 'text-gray-600'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(selectedShoe)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => removeShoe(selectedShoe._id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <EditShoeDialog
        editingShoe={editingShoe}
        editForm={editForm}
        setEditForm={setEditForm}
        setEditingShoe={setEditingShoe}
        updateShoeStats={updateShoeStats}
      />
    </div>
  );
}
