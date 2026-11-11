"use client";

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

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
    <div className="space-y-1.5">
      <h4 className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-putty/70">{title}</h4>
      {children}
    </div>
  );
}

interface FilterButtonGroupProps {
  options: { label: string; value: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

function FilterButtonGroup({ options, selectedValue, onChange }: FilterButtonGroupProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={selectedValue === option.value}
          className={`min-h-8 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all border ${selectedValue === option.value
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
  const reduceMotion = useReducedMotion();

  return (
    <div className="rounded-lg border border-white/15 bg-brand-surface">
      <div className="flex items-center gap-1.5 pr-1.5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="sanctuary-filters"
          className="flex min-h-10 flex-1 items-center gap-2 px-3 py-1 text-left font-mono text-xs uppercase tracking-wider text-brand-putty transition-colors hover:text-white"
        >
          <Filter className="h-3.5 w-3.5 text-brand-red" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 font-mono text-[10px] font-semibold text-black">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown aria-hidden="true" className={`ml-auto h-3.5 w-3.5 transition-transform duration-300 motion-reduce:transform-none ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex min-h-8 shrink-0 items-center gap-1 rounded-md px-2 font-mono text-[11px] text-brand-putty transition-colors hover:text-white"
          >
            <X className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="sanctuary-filters"
            initial={reduceMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { height: 'auto', opacity: 1, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-4 border-t border-white/10 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterSection title="Brand">
                <select
                  value={selectedBrand}
                  aria-label="Filter by brand"
                  onChange={(e) => onBrandChange(e.target.value)}
                  className="h-9 w-full rounded-lg bg-neutral-900 px-2.5 text-xs text-white border border-white/30 focus:border-brand-red/50 focus:outline-hidden focus:ring-1 focus:ring-brand-red/20"
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
                />
              </FilterSection>

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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
