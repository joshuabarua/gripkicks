'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, X, Edit2, Save, Footprints, HelpCircle, ChevronDown } from 'lucide-react';
import { useSession } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { fetchApi } from '@/lib/api-client';
import { z } from 'zod';

// Shoe size options with US/UK/EU equivalents
const shoeSizes = [
  // Kids Sizes
  { value: 'US Y10 / UK 9.5 / EU 27.5', label: 'US Y10 / UK 9.5 / EU 27.5' },
  { value: 'US Y10.5 / UK 10 / EU 28', label: 'US Y10.5 / UK 10 / EU 28' },
  { value: 'US Y11 / UK 10.5 / EU 28.5', label: 'US Y11 / UK 10.5 / EU 28.5' },
  { value: 'US Y11.5 / UK 11 / EU 29', label: 'US Y11.5 / UK 11 / EU 29' },
  { value: 'US Y12 / UK 11.5 / EU 30', label: 'US Y12 / UK 11.5 / EU 30' },
  { value: 'US Y12.5 / UK 12 / EU 30.5', label: 'US Y12.5 / UK 12 / EU 30.5' },
  { value: 'US Y13 / UK 12.5 / EU 31', label: 'US Y13 / UK 12.5 / EU 31' },
  { value: 'US Y13.5 / UK 13 / EU 31.5', label: 'US Y13.5 / UK 13 / EU 31.5' },
  { value: 'US Y1 / UK 13.5 / EU 32', label: 'US Y1 / UK 13.5 / EU 32' },
  { value: 'US Y1.5 / UK 14 / EU 33', label: 'US Y1.5 / UK 14 / EU 33' },
  { value: 'US Y2 / UK 14.5 / EU 33.5', label: 'US Y2 / UK 14.5 / EU 33.5' },
  { value: 'US Y2.5 / UK 15 / EU 34', label: 'US Y2.5 / UK 15 / EU 34' },
  { value: 'US Y3 / UK 15.5 / EU 35', label: 'US Y3 / UK 15.5 / EU 35' },
  { value: 'US Y3.5 / UK 16 / EU 35.5', label: 'US Y3.5 / UK 16 / EU 35.5' },
  { value: 'US Y4 / UK 16.5 / EU 36', label: 'US Y4 / UK 16.5 / EU 36' },
  { value: 'US Y4.5 / UK 17 / EU 36.5', label: 'US Y4.5 / UK 17 / EU 36.5' },
  { value: 'US Y5 / UK 17.5 / EU 37', label: 'US Y5 / UK 17.5 / EU 37' },
  { value: 'US Y5.5 / UK 18 / EU 37.5', label: 'US Y5.5 / UK 18 / EU 37.5' },
  { value: 'US Y6 / UK 18.5 / EU 38', label: 'US Y6 / UK 18.5 / EU 38' },
  { value: 'US Y6.5 / UK 19 / EU 38.5', label: 'US Y6.5 / UK 19 / EU 38.5' },
  { value: 'US Y7 / UK 19.5 / EU 39', label: 'US Y7 / UK 19.5 / EU 39' },
  { separator: true, label: '──────────' },
  // Women's Sizes
  { value: 'US W5 / UK 3.5 / EU 36', label: 'US W5 / UK 3.5 / EU 36' },
  { value: 'US W5.5 / UK 4 / EU 36.5', label: 'US W5.5 / UK 4 / EU 36.5' },
  { value: 'US W6 / UK 4.5 / EU 37', label: 'US W6 / UK 4.5 / EU 37' },
  { value: 'US W6.5 / UK 5 / EU 37.5', label: 'US W6.5 / UK 5 / EU 37.5' },
  { value: 'US W7 / UK 5.5 / EU 38', label: 'US W7 / UK 5.5 / EU 38' },
  { value: 'US W7.5 / UK 6 / EU 38.5', label: 'US W7.5 / UK 6 / EU 38.5' },
  { value: 'US W8 / UK 6.5 / EU 39', label: 'US W8 / UK 6.5 / EU 39' },
  { value: 'US W8.5 / UK 7 / EU 40', label: 'US W8.5 / UK 7 / EU 40' },
  { value: 'US W9 / UK 7.5 / EU 40.5', label: 'US W9 / UK 7.5 / EU 40.5' },
  { value: 'US W9.5 / UK 8 / EU 41', label: 'US W9.5 / UK 8 / EU 41' },
  { value: 'US W10 / UK 8.5 / EU 42', label: 'US W10 / UK 8.5 / EU 42' },
  { value: 'US W10.5 / UK 9 / EU 42.5', label: 'US W10.5 / UK 9 / EU 42.5' },
  { value: 'US W11 / UK 9.5 / EU 43', label: 'US W11 / UK 9.5 / EU 43' },
  { separator: true, label: '──────────' },
  // Men's Sizes
  { value: 'US 5 / UK 4.5 / EU 37.5', label: 'US 5 / UK 4.5 / EU 37.5' },
  { value: 'US 5.5 / UK 5 / EU 38', label: 'US 5.5 / UK 5 / EU 38' },
  { value: 'US 6 / UK 5.5 / EU 38.5', label: 'US 6 / UK 5.5 / EU 38.5' },
  { value: 'US 6.5 / UK 6 / EU 39', label: 'US 6.5 / UK 6 / EU 39' },
  { value: 'US 7 / UK 6.5 / EU 40', label: 'US 7 / UK 6.5 / EU 40' },
  { value: 'US 7.5 / UK 7 / EU 40.5', label: 'US 7.5 / UK 7 / EU 40.5' },
  { value: 'US 8 / UK 7.5 / EU 41', label: 'US 8 / UK 7.5 / EU 41' },
  { value: 'US 8.5 / UK 8 / EU 42', label: 'US 8.5 / UK 8 / EU 42' },
  { value: 'US 9 / UK 8.5 / EU 42.5', label: 'US 9 / UK 8.5 / EU 42.5' },
  { value: 'US 9.5 / UK 9 / EU 43', label: 'US 9.5 / UK 9 / EU 43' },
  { value: 'US 10 / UK 9.5 / EU 44', label: 'US 10 / UK 9.5 / EU 44' },
  { value: 'US 10.5 / UK 10 / EU 44.5', label: 'US 10.5 / UK 10 / EU 44.5' },
  { value: 'US 11 / UK 10.5 / EU 45', label: 'US 11 / UK 10.5 / EU 45' },
  { value: 'US 11.5 / UK 11 / EU 45.5', label: 'US 11.5 / UK 11 / EU 45.5' },
  { value: 'US 12 / UK 11.5 / EU 46', label: 'US 12 / UK 11.5 / EU 46' },
  { value: 'US 12.5 / UK 12 / EU 47', label: 'US 12.5 / UK 12 / EU 47' },
  { value: 'US 13 / UK 12.5 / EU 47.5', label: 'US 13 / UK 12.5 / EU 47.5' },
  { value: 'US 14 / UK 13.5 / EU 48.5', label: 'US 14 / UK 13.5 / EU 48.5' },
  { value: 'US 15 / UK 14.5 / EU 49.5', label: 'US 15 / UK 14.5 / EU 49.5' },
];

// Condition options
const conditions = [
  { value: 'New', label: 'New - Never worn' },
  { value: 'Like New', label: 'Like New - Worn once or twice' },
  { value: 'Good', label: 'Good - Light wear, good condition' },
  { value: 'Fair', label: 'Fair - Moderate wear, still functional' },
  { value: 'Worn', label: 'Worn - Heavy wear but usable' },
  { value: 'Retired', label: 'Retired - No longer in use' },
];

// Zod schema for form validation
const editFormSchema = z.object({
  size: z.string().optional(),
  purchaseDate: z.string().optional(),
  condition: z.string().optional(),
  notes: z.string().optional(),
  showNotes: z.boolean(),
  comfortScore: z.string().optional(),
  performanceRating: z.string().optional(),
  durabilityRating: z.string().optional(),
});

interface UserShoe {
  _id: string;
  shoeId: string;
  shoe: {
    _id: string;
    name: string;
    brand: string;
    imageUrl?: string;
  };
  // User's custom stats
  size?: string;
  purchaseDate?: string;
  condition?: string;
  notes?: string;
  // Comfort ranking fields
  comfortScore?: number; // 1-10 comfort rating
  performanceRating?: number; // 1-10 performance rating
  durabilityRating?: number; // 1-10 durability rating
}

interface CloudShoeProps {
  shoe: UserShoe;
  onClick: () => void;
  index: number;
}

function CloudShoe({ shoe, onClick, index }: CloudShoeProps) {
  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{
        left: `${20 + (index * 15) % 60}%`,
        top: `${20 + (index * 10) % 50}%`,
        animation: `float ${5 + index % 3}s ease-in-out infinite`,
        animationDelay: `${index * 0.5}s`,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Cloud background */}
      <motion.div
        className="absolute inset-0 w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Shoe content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-32 h-32">
        <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center mb-2">
          {shoe.shoe.imageUrl ? (
            <img
              src={shoe.shoe.imageUrl}
              alt={shoe.shoe.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Footprints className="w-10 h-10 text-white/80" />
          )}
        </div>
        <p className="text-xs text-white/90 text-center font-medium truncate w-full px-2">
          {shoe.shoe.name}
        </p>
        <p className="text-xs text-white/70 text-center">
          {shoe.shoe.brand}
        </p>
      </div>
    </motion.div>
  );
}

export default function ShoeSanctuaryPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [userShoes, setUserShoes] = useState<UserShoe[]>([]);
  const [selectedShoe, setSelectedShoe] = useState<UserShoe | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingShoe, setEditingShoe] = useState<UserShoe | null>(null);
  const [editForm, setEditForm] = useState({
    size: '',
    purchaseDate: '',
    condition: '',
    notes: '',
    showNotes: false,
    // Comfort ranking fields
    comfortScore: '',
    performanceRating: '',
    durabilityRating: '',
  });

  // Fetch all shoes from Convex
  const shoesData = useQuery(api.shoes.list);
  const allShoes = useMemo(() => shoesData ?? [], [shoesData]);

  // Fetch user's stash from Hono API
  useEffect(() => {
    if (session?.user) {
      fetchUserStash();
    }
  }, [session]);

  const fetchUserStash = async () => {
    try {
      const response = await fetchApi<{ success: boolean; data: UserShoe[] }>('/api/v1/stash');
      if (response.success) {
        setUserShoes(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user stash:', error);
    }
  };

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
      await fetchApi('/api/v1/stash', {
        method: 'POST',
        body: JSON.stringify({ shoeId }),
      });
      await fetchUserStash();
      setIsAddDialogOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to add shoe:', error);
    }
  };

  const updateShoeStats = async () => {
    if (!editingShoe) return;

    // Validate form data with Zod
    const validationResult = editFormSchema.safeParse(editForm);
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.flatten());
      return;
    }

    try {
      await fetchApi(`/api/v1/stash/${editingShoe._id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      await fetchUserStash();
      setEditingShoe(null);
      setSelectedShoe(null);
    } catch (error) {
      console.error('Failed to update shoe:', error);
    }
  };

  const removeShoe = async (shoeId: string) => {
    try {
      await fetchApi(`/api/v1/stash/${shoeId}`, { method: 'DELETE' });
      await fetchUserStash();
      setSelectedShoe(null);
    } catch (error) {
      console.error('Failed to remove shoe:', error);
    }
  };

  const openEditDialog = (shoe: UserShoe) => {
    setEditingShoe(shoe);
    setEditForm({
      size: shoe.size || '',
      purchaseDate: shoe.purchaseDate || '',
      condition: shoe.condition || '',
      notes: shoe.notes || '',
      showNotes: false,
      // Comfort ranking fields
      comfortScore: shoe.comfortScore?.toString() || '',
      performanceRating: shoe.performanceRating?.toString() || '',
      durabilityRating: shoe.durabilityRating?.toString() || '',
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
          <h1 className="text-3xl font-bold mb-4">Shoe Sanctuary</h1>
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
        style={{ backgroundImage: 'url("/imgs/clouds 4.png")' }}
      />
      
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 via-blue-300/20 to-blue-200/20" />
      
      {/* Shoe Sanctuary Floating Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 
          className="text-6xl md:text-8xl font-bold text-white/10 select-none"
          style={{
            animation: 'float 6s ease-in-out infinite',
          }}
        >
          Shoe Sanctuary
        </h1>
      </div>
      
      {/* Add global styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>

      {/* Header */}
      <div className="relative z-20 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Shoe Sanctuary</h1>
            <p className="text-white/80">Your personal collection in the clouds</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30">
                <Plus className="w-4 h-4 mr-2" />
                Add Shoe
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900/95 backdrop-blur-sm text-gray-100 border border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Add New Shoe</DialogTitle>
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
                    No shoes found. Try searching for climbing shoe brands like "La Sportiva", "Scarpa", or "Five Ten".
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Floating shoes */}
      <div className="relative z-10 h-[calc(100vh-200px)]">
        {userShoes.map((shoe, index) => (
          <CloudShoe
            key={shoe._id}
            shoe={shoe}
            onClick={() => setSelectedShoe(shoe)}
            index={index}
          />
        ))}
        
        {userShoes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/60">
            <Footprints className="w-16 h-16 mb-4" />
            <p className="text-xl">Your sanctuary is empty</p>
            <p className="text-sm">Click "Add Shoe" to start your collection</p>
          </div>
        )}
      </div>

      {/* Shoe detail dialog */}
      <AnimatePresence>
        {selectedShoe && !editingShoe && (
          <Dialog open={!!selectedShoe} onOpenChange={() => setSelectedShoe(null)}>
            <DialogContent className="bg-gray-900/95 backdrop-blur-sm text-gray-100 border border-gray-700 max-w-md">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl text-gray-100">{selectedShoe.shoe.name}</DialogTitle>
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
                
                {/* Comfort Rankings Display */}
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

      {/* Edit dialog */}
      <AnimatePresence>
        {editingShoe && (
          <Dialog open={!!editingShoe} onOpenChange={() => setEditingShoe(null)}>
            <DialogContent className="bg-gray-900/95 backdrop-blur-sm text-gray-100 border border-gray-700 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Edit Shoe Stats</DialogTitle>
                <DialogDescription className="text-sm text-gray-400">
                  {editingShoe.shoe.name} - {editingShoe.shoe.brand}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="size">Size</Label>
                    <select
                      id="size"
                      value={editForm.size}
                      onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 text-gray-100 border border-gray-600 rounded-md focus:border-gray-500 focus:outline-none"
                    >
                      <option value="">Select size</option>
                      {shoeSizes.map((size, index) => {
                        if (size.separator) {
                          return (
                            <option key={`separator-${index}`} disabled className="text-gray-600">
                              {size.label}
                            </option>
                          );
                        }
                        return (
                          <option key={size.value} value={size.value}>
                            {size.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <select
                      id="condition"
                      value={editForm.condition}
                      onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 text-gray-100 border border-gray-600 rounded-md focus:border-gray-500 focus:outline-none"
                    >
                      <option value="">Select condition</option>
                      {conditions.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={editForm.purchaseDate}
                      onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                      className="bg-gray-800/50 text-gray-100 border-gray-600 focus:border-gray-500"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="comfortScore">Comfort (1-10)</Label>
                      <div className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          How comfortable this shoe feels for your feet
                        </div>
                      </div>
                    </div>
                    <Input
                      id="comfortScore"
                      type="number"
                      min="1"
                      max="10"
                      value={editForm.comfortScore}
                      onChange={(e) => setEditForm({ ...editForm, comfortScore: e.target.value })}
                      placeholder="1-10"
                      className="bg-gray-800/50 text-gray-100 placeholder:text-gray-500 border-gray-600 focus:border-gray-500"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="performanceRating">Performance (1-10)</Label>
                      <div className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Rate how this shoe performs for your climbing style
                        </div>
                      </div>
                    </div>
                    <Input
                      id="performanceRating"
                      type="number"
                      min="1"
                      max="10"
                      value={editForm.performanceRating}
                      onChange={(e) => setEditForm({ ...editForm, performanceRating: e.target.value })}
                      placeholder="1-10"
                      className="bg-gray-800/50 text-gray-100 placeholder:text-gray-500 border-gray-600 focus:border-gray-500"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="durabilityRating">Durability (1-10)</Label>
                      <div className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          How well this shoe holds up over time
                        </div>
                      </div>
                    </div>
                    <Input
                      id="durabilityRating"
                      type="number"
                      min="1"
                      max="10"
                      value={editForm.durabilityRating}
                      onChange={(e) => setEditForm({ ...editForm, durabilityRating: e.target.value })}
                      placeholder="1-10"
                      className="bg-gray-800/50 text-gray-100 placeholder:text-gray-500 border-gray-600 focus:border-gray-500"
                    />
                  </div>
                </div>
                
                {/* Collapsible Notes Section */}
                <div className="border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, showNotes: !editForm.showNotes })}
                    className="flex items-center justify-between w-full py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <span>Additional Notes</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${editForm.showNotes ? 'rotate-180' : ''}`} />
                  </button>
                  {editForm.showNotes && (
                    <div className="pt-2">
                      <Textarea
                        id="notes"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        placeholder="Any additional notes about this shoe..."
                        rows={2}
                        className="bg-gray-800/50 text-gray-100 placeholder:text-gray-500 border-gray-600 focus:border-gray-500 resize-none"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingShoe(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={updateShoeStats}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
