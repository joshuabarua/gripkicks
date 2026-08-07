"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type GenderFilter = 'all' | 'men' | 'women' | 'kids' | 'unisex';
type RatingFilter = 'all' | '4+' | '3+' | '2+' | '1+';

interface AdvancedFiltersProps {
  selectedBrand: string;
  onBrandChange: (value: string) => void;
  selectedGender: GenderFilter;
  onGenderChange: (value: GenderFilter) => void;
  selectedAggressiveness: string;
  onAggressivenessChange: (value: string) => void;
  selectedStiffness: string;
  onStiffnessChange: (value: string) => void;
  selectedDiscipline: string;
  onDisciplineChange: (value: string) => void;
  selectedVolume: string;
  onVolumeChange: (value: string) => void;
  selectedComfortRating: RatingFilter;
  onComfortRatingChange: (value: RatingFilter) => void;
  selectedPerformanceRating: RatingFilter;
  onPerformanceRatingChange: (value: RatingFilter) => void;
  uniqueBrands: string[];
  onReset: () => void;
  activeFiltersCount: number;
}

const aggressivenessOptions = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'High', value: 'high' },
  { label: 'Very High', value: 'very_high' },
];

const stiffnessOptions = [
  { label: 'All', value: 'all' },
  { label: 'Soft', value: 'soft' },
  { label: 'Medium', value: 'medium' },
  { label: 'Stiff', value: 'stiff' },
  { label: 'Very Stiff', value: 'very_stiff' },
];

const disciplineOptions = [
  { label: 'All', value: 'all' },
  { label: 'Sport', value: 'sport' },
  { label: 'Bouldering', value: 'bouldering' },
  { label: 'Trad', value: 'trad' },
  { label: 'Multi-pitch', value: 'multi_pitch' },
  { label: 'Indoor', value: 'indoor' },
  { label: 'All-around', value: 'all_around' },
];

const volumeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const ratingOptions = [
  { label: 'All', value: 'all' },
  { label: '4+ Stars', value: '4+' },
  { label: '3+ Stars', value: '3+' },
  { label: '2+ Stars', value: '2+' },
  { label: '1+ Stars', value: '1+' },
];

const genderOptions = [
  { label: 'All', value: 'all' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Kids', value: 'kids' },
  { label: 'Unisex', value: 'unisex' },
];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-white">{title}</h4>
      {children}
    </div>
  );
}

interface FilterButtonGroupProps {
  options: { label: string; value: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  layout?: 'grid' | 'flex';
}

function FilterButtonGroup({ options, selectedValue, onChange, layout = 'grid' }: FilterButtonGroupProps) {
  return (
    <div className={layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-2' : 'flex flex-wrap gap-2'}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-sora transition-all border ${selectedValue === option.value
            ? 'bg-brand-red text-black border-brand-red'
            : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-brand-red/40 hover:text-white'
            }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AdvancedFilters({
  selectedBrand,
  onBrandChange,
  selectedGender,
  onGenderChange,
  selectedAggressiveness,
  onAggressivenessChange,
  selectedStiffness,
  onStiffnessChange,
  selectedDiscipline,
  onDisciplineChange,
  selectedVolume,
  onVolumeChange,
  selectedComfortRating,
  onComfortRatingChange,
  selectedPerformanceRating,
  onPerformanceRatingChange,
  uniqueBrands,
  onReset,
  activeFiltersCount,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-neutral-950 border-neutral-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-red" />
            <CardTitle className="text-lg text-white">Advanced Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-brand-red text-black">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neutral-400 hover:text-white"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <CardDescription className="text-neutral-500">
          Filter shoes by brand, gender, performance characteristics, and ratings
        </CardDescription>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CardContent className="space-y-6 pt-0">
              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FilterSection title="Brand">
                  <select
                    value={selectedBrand}
                    onChange={(e) => onBrandChange(e.target.value)}
                    className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-brand-red/50 focus:outline-none focus:ring-1 focus:ring-brand-red/20"
                  >
                    <option value="all">All Brands</option>
                    {uniqueBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </FilterSection>

                <FilterSection title="Gender">
                  <FilterButtonGroup
                    options={genderOptions}
                    selectedValue={selectedGender}
                    onChange={(value) => onGenderChange(value as GenderFilter)}
                    layout="flex"
                  />
                </FilterSection>
              </div>

              {/* Performance Characteristics */}
              <div className="space-y-4">
                <h3 className="text-white font-medium border-b border-neutral-800 pb-2">
                  Performance Characteristics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FilterSection title="Aggressiveness">
                    <FilterButtonGroup
                      options={aggressivenessOptions}
                      selectedValue={selectedAggressiveness}
                      onChange={onAggressivenessChange}
                    />
                  </FilterSection>

                  <FilterSection title="Stiffness">
                    <FilterButtonGroup
                      options={stiffnessOptions}
                      selectedValue={selectedStiffness}
                      onChange={onStiffnessChange}
                    />
                  </FilterSection>

                  <FilterSection title="Volume">
                    <FilterButtonGroup
                      options={volumeOptions}
                      selectedValue={selectedVolume}
                      onChange={onVolumeChange}
                    />
                  </FilterSection>

                  <FilterSection title="Climbing Discipline">
                    <FilterButtonGroup
                      options={disciplineOptions}
                      selectedValue={selectedDiscipline}
                      onChange={onDisciplineChange}
                    />
                  </FilterSection>
                </div>
              </div>

              {/* Rating Filters */}
              <div className="space-y-4">
                <h3 className="text-white font-medium border-b border-neutral-800 pb-2">
                  User Ratings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FilterSection title="Comfort Rating">
                    <FilterButtonGroup
                      options={ratingOptions}
                      selectedValue={selectedComfortRating}
                      onChange={(value) => onComfortRatingChange(value as RatingFilter)}
                    />
                  </FilterSection>

                  <FilterSection title="Performance Rating">
                    <FilterButtonGroup
                      options={ratingOptions}
                      selectedValue={selectedPerformanceRating}
                      onChange={(value) => onPerformanceRatingChange(value as RatingFilter)}
                    />
                  </FilterSection>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
