"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ShoeImage from '@/components/ShoeImage';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { Footprints, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

type BaseShoe = {
  _id: string;
  name: string;
  brand: string;
  imageUrl?: string | null;
  gender?: string | null;
  slug?: string | null;
};

type GenderFilter = 'all' | 'men' | 'women' | 'kids' | 'unisex';

interface AddShoeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedBrand: string;
  onBrandChange: (value: string) => void;
  selectedGender: GenderFilter;
  onGenderChange: (value: GenderFilter) => void;
  uniqueBrands: string[];
  searchResults: BaseShoe[];
  onSelectShoe: (shoeId: string) => void;
}

export function AddShoeDialog({
  open,
  onOpenChange,
  searchQuery,
  onSearchChange,
  selectedBrand,
  onBrandChange,
  selectedGender,
  onGenderChange,
  uniqueBrands,
  searchResults,
  onSelectShoe,
}: AddShoeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const genderOptions: { label: string; value: GenderFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Kids', value: 'kids' },
    { label: 'Unisex', value: 'unisex' },
  ];

  const handleEndReached = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  const loadingIndicator = (
    <div className="inline-flex items-center gap-2 text-neutral-500 text-sm">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-500"></div>
      <span>Loading more shoes...</span>
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          onBrandChange('all');
          onSearchChange('');
        }
      }}
    >
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg px-fluid-lg py-fluid-sm rounded-2xl shadow-lg shadow-orange-500/20 transition-colors duration-200 flex items-center gap-fluid-sm w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Add Shoe</span>
        </motion.button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-950 text-white border border-neutral-800 max-w-2xl shadow-2xl shadow-orange-500/5 rounded-3xl">
        <DialogHeader>
          <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] text-center">[ADD_SHOE]</p>
          <DialogTitle className="text-white font-so-cloudy uppercase text-fluid-2xl text-center">
            Add New Shoe
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-center font-sora text-fluid-sm">
            Search and add climbing shoes to your collection
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-fluid-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
            <Input
              placeholder="Search for shoes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 bg-neutral-900 text-white placeholder:text-neutral-600 border-neutral-800 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 rounded-xl h-12 text-fluid-base"
            />
          </div>

          <div className="flex items-center gap-fluid-sm">
            <Label className="text-xs text-neutral-500 font-mono">Brand:</Label>
            <select
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              className="flex-1 bg-neutral-900 text-white border border-neutral-800 rounded-xl px-fluid-md py-fluid-xs text-sm focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-fluid-sm">
            <Label className="text-xs text-neutral-500 font-mono">Gender:</Label>
            <div className="flex flex-wrap gap-2">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onGenderChange(option.value)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors border ${
                    selectedGender === option.value
                      ? 'bg-orange-500 text-black border-orange-500'
                      : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-orange-500/40'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <PaginatedList
            items={searchResults}
            renderItem={(shoe: BaseShoe) => (
              <div
                key={shoe._id}
                className="flex items-center justify-between p-fluid-md rounded-2xl bg-neutral-900 hover:bg-neutral-800 cursor-pointer transition-all duration-300 border border-neutral-800 hover:border-orange-500/30 group"
                onClick={() => onSelectShoe(shoe._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                    <ShoeImage
                      brand={shoe.brand}
                      shoeName={shoe.name}
                      imageUrl={shoe.imageUrl ?? undefined}
                      slug={shoe.slug ?? undefined}
                      className="p-1.5"
                      transformation={[{ height: 64, width: 64, crop: 'at_max', cropMode: 'pad_resize', format: 'png', quality: 75 }]}
                      gender={['men', 'women', 'kids', 'unisex'].includes((shoe.gender ?? '').toLowerCase())
                        ? (shoe.gender?.toLowerCase() as 'men' | 'women' | 'kids' | 'unisex')
                        : undefined}
                    />
                  </div>
                  <div>
                    <p className="font-sora font-medium text-white group-hover:text-orange-500 transition-colors">
                      {shoe.name}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono">{shoe.brand}</p>
                  </div>
                </div>
                <Plus className="w-5 h-5 text-neutral-600 group-hover:text-orange-500 group-hover:rotate-90 transition-all duration-300" />
              </div>
            )}
            className="max-h-96 space-y-fluid-xs pr-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
            loadingIndicator={loadingIndicator}
            onEndReached={handleEndReached}
            hasMore={searchResults.length > 0}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
