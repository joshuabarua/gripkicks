"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ShoeImage from '@/components/ShoeImage';
import { BrandLogo } from '@/components/stash/BrandLogo';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { LoadingBar } from '@/components/ui/loading';
import { Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { groupShoesByModel } from '@/utils/shoeVariants';
import type { Shoe } from '@/types/api';

type GenderFilter = 'all' | 'men' | 'women' | 'kids' | 'unisex';

const addButtonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.03 },
  tap: { scale: 0.97 },
};
// The shoe kicks up on hover; the plus badge spins.
const addIconVariants = {
  rest: { rotate: 0, y: 0 },
  hover: { rotate: -14, y: -2, transition: { type: 'spring' as const, stiffness: 400, damping: 12 } },
  tap: { rotate: -4, y: 0 },
};
const addPlusVariants = {
  rest: { rotate: 0, scale: 1 },
  hover: { rotate: 90, scale: 1.15, transition: { type: 'spring' as const, stiffness: 300, damping: 15 } },
  tap: { rotate: 90, scale: 0.9 },
};

function ShoeIcon({ className }: { className?: string }) {
  return (
    // Climbing shoe in profile: downturned pointed toe, rand, two straps, heel tab.
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <g transform="translate(0 -1)">
        <path d="M5 17.5C3.6 16.6 3.4 12.8 5 10.6l2.4-1.4c1.4 1 3.2 1.2 4.6.6 3.5.6 7.2 2.8 9 6.4-1.2.7-2.8.6-4.6.2-2.9-.5-6.4.2-9.4 1.2-.7.2-1.4.2-2-.1z" />
        <path d="M5.3 15.5c3.7-1 8.2-1.4 11.7-.9 1.4.2 2.7.7 3.6 1.3" />
        <path d="M11.6 10l.8 4.5M14.6 10.6l.7 3.8" />
        <path d="M5 10.6l-.4-2.4c1.2 0 2 .3 2.8 1" />
      </g>
    </svg>
  );
}

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
      <LoadingBar size="sm" />
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
          type="button"
          initial="rest"
          animate="rest"
          whileHover="hover"
          whileFocus="hover"
          whileTap="tap"
          variants={addButtonVariants}
          className="group relative mt-fluid-md inline-flex min-h-11 w-fit items-center gap-3 overflow-hidden rounded-lg bg-brand-red py-2 pl-2 pr-5 font-mono text-sm uppercase tracking-wider text-white shadow-lg shadow-brand-red/25 transition-[background-color,box-shadow] duration-500 hover:shadow-brand-red/40 focus-visible:outline-brand-chalk"
        >
          {/* Sheen that sweeps across on hover. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent opacity-0 transition-[left,opacity] duration-700 ease-out group-hover:left-[120%] group-hover:opacity-100 motion-reduce:hidden"
          />
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black/20">
            <motion.span variants={addIconVariants} className="flex">
              <ShoeIcon className="h-5 w-5" />
            </motion.span>
            <motion.span
              variants={addPlusVariants}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-brand-red"
            >
              <Plus aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
            </motion.span>
          </span>
          <span className="relative">Add shoe</span>
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
                        <p className="font-mono text-sm text-white decoration-brand-red underline-offset-4 group-hover:underline">
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
              <LoadingBar size="sm" />
              <span>Searching shoes...</span>
            </div>
          )}

          {groupedSearchResults.length === 0 && !isLoadingMore && !isSearching && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-6 py-10 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-red/10 flex items-center justify-center">
                <ShoeIcon className="w-6 h-6 text-brand-red" />
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
