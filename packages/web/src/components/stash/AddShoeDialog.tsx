"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ShoeImage from '@/components/ShoeImage';
import { BrandLogo } from '@/components/stash/BrandLogo';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { Footprints, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { groupShoesByModel } from '@/utils/shoeVariants';
import type { Shoe } from '@/types/api';

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
  searchResults: Shoe[];
  onSelectShoe: (shoeId: string) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  isSearching?: boolean;
  onLoadMore: () => void;
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
  hasMore,
  isLoadingMore,
  isSearching = false,
  onLoadMore,
}: AddShoeDialogProps) {
  const groupedSearchResults = useMemo(
    () => Array.from(groupShoesByModel(searchResults).values()),
    [searchResults],
  );

  const genderOptions: { label: string; value: GenderFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Kids', value: 'kids' },
    { label: 'Unisex', value: 'unisex' },
  ];

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
          onGenderChange('all');
          onSearchChange('');
        }
      }}
    >
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-brand-red hover:bg-brand-red/80 text-black font-amatic text-lg px-fluid-lg py-fluid-sm rounded-lg shadow-lg shadow-brand-red/20 transition-colors duration-500 flex items-center gap-fluid-sm w-fit mt-fluid-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add Shoe</span>
        </motion.button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-950 text-white border border-neutral-800 max-w-2xl shadow-2xl shadow-brand-red/5 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-white font-so-cloudy uppercase text-fluid-2xl text-center">
            Add New Shoe
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-center font-mono text-fluid-sm">
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
              className="pl-12 bg-neutral-900 text-white placeholder:text-neutral-600 border-neutral-800 focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20 rounded-xl h-12 text-fluid-base"
            />
          </div>

          <div className="flex items-center gap-fluid-sm">
            <Label className="text-xs text-neutral-500 font-mono">Brand:</Label>
            <Select value={selectedBrand} onValueChange={onBrandChange}>
              <SelectTrigger className="flex-1 bg-neutral-900 border-neutral-800 rounded-xl h-12 px-fluid-md text-white focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/20">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                <SelectItem value="all" className="focus:bg-neutral-800 focus:text-white">All Brands</SelectItem>
                {uniqueBrands.map((brand) => (
                  <SelectItem key={brand} value={brand} className="focus:bg-neutral-800 focus:text-white">
                    <span className="flex items-center gap-2.5">
                      <BrandLogo brand={brand} size="sm" />
                      <span className="font-mono text-xs text-brand-putty">{brand}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-fluid-sm">
            <Label className="text-xs text-neutral-500 font-mono">Gender:</Label>
            <div className="flex flex-wrap gap-2">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onGenderChange(option.value)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors border ${selectedGender === option.value
                    ? 'bg-brand-red text-black border-brand-red'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-brand-red/40'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <PaginatedList
            items={groupedSearchResults}
            renderItem={(group) => (
              <div
                key={group.groupKey}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-fluid-md transition-all duration-300 hover:border-brand-red/30"
              >
                <div className="mb-3 flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-700 rounded-xl overflow-hidden shrink-0">
                    <ShoeImage
                      brand={group.brand}
                      shoeName={group.baseName}
                      imageUrl={group.variants[0]?.item.imageUrl ?? undefined}
                      slug={group.variants[0]?.item.slug ?? undefined}
                      className="p-1.5"
                      transformation={[{ height: 64, width: 64, crop: 'at_max', cropMode: 'pad_resize', format: 'png', quality: 75 }]}
                      gender={['men', 'women', 'kids', 'unisex'].includes((group.variants[0]?.item.gender ?? '').toLowerCase())
                        ? (group.variants[0]?.item.gender?.toLowerCase() as 'men' | 'women' | 'kids' | 'unisex')
                        : undefined}
                    />
                  </div>
                  <div className="flex min-w-0 items-center gap-3">
                    <BrandLogo brand={group.brand} size="sm" className="shrink-0" />
                    <p className="truncate font-mono font-medium text-white">
                      {group.baseName}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {group.variants.map(({ item: shoe, variantLabel }) => (
                    <button
                      key={shoe._id}
                      type="button"
                      onClick={() => onSelectShoe(shoe._id)}
                      className="group flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-left transition-all duration-300 hover:border-brand-red/30 hover:bg-neutral-800"
                    >
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                          {group.variants.length > 1 ? variantLabel || "Standard" : "Add shoe"}
                        </p>
                        <p className="font-mono text-sm text-white transition-colors group-hover:text-brand-red">
                          {shoe.name}
                        </p>
                      </div>
                      <Plus className="w-5 h-5 text-neutral-600 transition-all duration-300 group-hover:text-brand-red group-hover:rotate-90" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            className="max-h-96 space-y-fluid-xs pr-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
            loadingIndicator={loadingIndicator}
            onEndReached={onLoadMore}
            hasMore={hasMore}
            isLoading={isLoadingMore}
            completedIndicator={<span className="font-mono text-xs text-neutral-500">All shoes loaded</span>}
          />

          {groupedSearchResults.length === 0 && isSearching && (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-6 py-10 font-mono text-sm text-neutral-500">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-neutral-500"></div>
              <span>Searching shoes...</span>
            </div>
          )}

          {groupedSearchResults.length === 0 && !isLoadingMore && !isSearching && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-6 py-10 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-red/10 flex items-center justify-center">
                <Footprints className="w-6 h-6 text-brand-red" />
              </div>
              <p className="font-mono text-white text-sm mb-1">No shoes match these filters</p>
              <p className="font-mono text-neutral-500 text-xs">
                Try clearing your dialog search, brand, or gender filter to view all shoes in the database.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
