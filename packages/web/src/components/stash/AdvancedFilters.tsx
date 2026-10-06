"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type GenderFilter = 'all' | 'men' | 'women' | 'kids' | 'unisex';
type RatingFilter = 'all' | '8+' | '6+' | '4+' | '2+';

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
  { label: 'Flat', value: 'flat' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Aggressive', value: 'aggressive' },
];

const stiffnessOptions = [
  { label: 'All', value: 'all' },
  { label: 'Soft', value: 'soft' },
  { label: 'Medium', value: 'medium' },
  { label: 'Stiff', value: 'stiff' },
];

const disciplineOptions = [
  { label: 'All', value: 'all' },
  { label: 'Sport', value: 'sport' },
  { label: 'Bouldering', value: 'bouldering' },
  { label: 'Trad', value: 'trad' },
  { label: 'Gym', value: 'gym' },
  { label: 'Competition', value: 'competition' },
];

const volumeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const ratingOptions = [
  { label: 'All', value: 'all' },
  { label: '8+ /10', value: '8+' },
  { label: '6+ /10', value: '6+' },
  { label: '4+ /10', value: '4+' },
  { label: '2+ /10', value: '2+' },
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
          aria-pressed={selectedValue === option.value}
          className={`min-h-11 px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${selectedValue === option.value
            ? 'bg-brand-red text-black border-brand-red'
            : 'bg-neutral-900/60 text-brand-putty border-white/30 hover:border-brand-red/40 hover:text-white'
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
    <Card className="bg-brand-surface border-white/20">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-red" />
            <CardTitle className="text-lg text-white">Advanced Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-brand-red text-black">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-brand-putty hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
              aria-expanded={isExpanded}
              aria-controls={isExpanded ? 'sanctuary-filters' : undefined}
              className="min-h-11 min-w-11 text-brand-putty hover:text-white"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <CardDescription className="text-brand-putty">
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
            <CardContent id="sanctuary-filters" className="space-y-6 pt-0">
              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FilterSection title="Brand">
                  <select
                    value={selectedBrand}
                    aria-label="Filter by brand"
                    onChange={(e) => onBrandChange(e.target.value)}
                    className="w-full bg-neutral-900 text-white border border-white/30 rounded-lg px-3 py-2 text-sm focus:border-brand-red/50 focus:outline-none focus:ring-1 focus:ring-brand-red/20"
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
                <h3 className="text-white font-medium border-b border-white/30 pb-2">
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
                <h3 className="text-white font-medium border-b border-white/30 pb-2">
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
