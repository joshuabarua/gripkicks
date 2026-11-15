'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { memo, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Feather, Shield, Star, Trash2, X, Zap } from 'lucide-react';
import ShoeImage from "@/components/ShoeImage";
import { BrandLogo, hasBrandLogo } from "@/components/stash/BrandLogo";
import type { UserShoe } from "@/types/api";
import { getBrandDescription, getShoeDescription } from "@/utils/sanctuaryDescriptions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RatingIcons } from "@/components/RatingIcons";
import { conditions, shoeSizes } from "@/constants/shoe-data";
import { cardLayoutTransition, revealGroup, revealItem } from "@/lib/motion";

interface CloudShoeProps {
  shoe: UserShoe;
  variantLabel?: string | null | undefined;
  specialLabel?: { type: 'most-worn' | 'oldest' | 'most-comfy'; icon: React.ReactNode } | undefined;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleFavourite: () => void;
  onRemove: () => void;
  onRate?: (field: 'comfortScore' | 'performanceRating' | 'durabilityRating', value: number) => void;
  onUpdateDetails?: (fields: { size?: string; condition?: string }) => void;
}

const GENDER_WORDS = new Set(["men", "women", "unisex", "kids", "men's", "women's"]);

const specialLabelTitles = {
  'most-comfy': 'Highest comfort score in your collection',
  'oldest': 'Oldest shoe in your collection',
  'most-worn': 'Most worn shoe in your collection',
} as const;

function StatSlider({ label, icon, value, onCommit }: { label: string; icon: React.ReactNode; value: number | undefined; onCommit: ((value: number) => void) | undefined }) {
  // Draft holds the dragged value until the saved rating comes back.
  const [draft, setDraft] = useState<number | null>(null);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(null);
  }
  const shown = draft ?? value;
  const pct = shown === undefined ? 0 : Math.min(10, Math.max(0, shown)) * 10;

  const committed = useRef<number | null>(null);
  const commit = () => {
    if (draft === null || draft === value || draft === committed.current) return;
    committed.current = draft;
    onCommit?.(draft);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-mono text-xs text-brand-putty">
          <span className="text-brand-red/80">{icon}</span>
          {label}
        </span>
        <span className="font-mono text-xs text-brand-chalk">{shown !== undefined ? `${shown}/10` : 'Not rated'}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={shown ?? 0}
        disabled={!onCommit}
        aria-label={`${label} rating`}
        aria-valuetext={shown !== undefined ? `${shown} out of 10` : 'Not rated'}
        data-unrated={shown === undefined || undefined}
        onChange={(e) => setDraft(Number(e.target.value))}
        onPointerDown={() => { if (shown === undefined) setDraft(0); }}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        style={{ '--fill': `${pct}%` } as React.CSSProperties}
        className="mt-2 h-4 w-full cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-default focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-brand-chalk/60 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand-chalk [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[linear-gradient(to_right,rgb(244_91_91/0.7)_var(--fill),rgb(255_255_255/0.1)_var(--fill))] [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,rgb(244_91_91/0.7)_var(--fill),rgb(255_255_255/0.1)_var(--fill))] [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-chalk [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125 data-unrated:[&::-webkit-slider-thumb]:bg-white/30 data-unrated:[&::-moz-range-thumb]:bg-white/30"
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] text-brand-putty/60"><span>0</span><span>10</span></div>
    </div>
  );
}

const CloudShoe = memo<CloudShoeProps>(({ shoe, variantLabel, specialLabel, expanded, onToggleExpand, onToggleFavourite, onRemove, onRate, onUpdateDetails }) => {
  const details = shoe.shoe ?? shoe.shoeDetails;
  const brand = details?.brand ?? 'Unknown Brand';
  const name = details?.name ?? 'Unknown Shoe';
  const imageUrl = details?.imageUrl;
  const slug = details?.slug;
  const gender = details?.gender;
  const rawLabel = variantLabel?.trim() || details?.variantLabel?.trim() || null;
  const cardLabel = rawLabel && !GENDER_WORDS.has(rawLabel.toLowerCase()) ? rawLabel : null;
  const detailsId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const statSliders = [
    { label: 'Comfort', field: 'comfortScore' as const, value: shoe.comfortScore, icon: <Feather className="h-3.5 w-3.5" /> },
    { label: 'Performance', field: 'performanceRating' as const, value: shoe.performanceRating, icon: <Zap className="h-3.5 w-3.5" /> },
    { label: 'Durability', field: 'durabilityRating' as const, value: shoe.durabilityRating, icon: <Shield className="h-3.5 w-3.5" /> },
  ];
  const hasRatings = statSliders.some(({ value }) => value !== undefined);
  const specTags = [
    shoe.shoe?.aggressiveness,
    shoe.shoe?.climbingDiscipline,
    shoe.shoe?.stiffness ? `${shoe.shoe.stiffness} stiffness` : undefined,
    shoe.shoe?.volume ? `${shoe.shoe.volume} volume` : undefined,
    shoe.shoe?.rubberTechnology?.compound,
  ].filter((tag): tag is string => Boolean(tag?.trim()));

  const articleRef = useRef<HTMLElement>(null);
  const showButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(false);
  const scrollPendingRef = useRef(false);

  const collapse = () => {
    restoreFocusRef.current = true;
    onToggleExpand();
  };

  // Escape closes the open card unless a dialog or native control handled it.
  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      restoreFocusRef.current = true;
      onToggleExpand();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [expanded, onToggleExpand]);

  useEffect(() => {
    if (expanded) {
      scrollPendingRef.current = true;
      // No layout animation runs with reduced motion, so scroll straight away.
      if (reduceMotion) scrollIntoView();
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current = false;
      showButtonRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  function scrollIntoView() {
    if (!scrollPendingRef.current) return;
    scrollPendingRef.current = false;
    articleRef.current?.scrollIntoView?.({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  const labelClass = "font-mono text-[11px] uppercase tracking-[0.13em] text-brand-putty/85";
  const selectClass = "w-full appearance-none truncate rounded-md border border-white/20 bg-white/2.5 px-3 py-2.5 font-mono text-xs text-brand-chalk transition-colors hover:bg-white/5";

  return (
    <motion.article
      ref={articleRef}
      layout
      transition={{ layout: cardLayoutTransition }}
      onLayoutAnimationComplete={() => { if (expanded) scrollIntoView(); }}
      style={{ borderRadius: 12 }}
      className={`group relative w-full scroll-m-4 overflow-hidden border border-white/30 bg-brand-surface shadow-lg shadow-black/20 transition-colors duration-300 hover:border-white/50 focus-within:border-white/50 ${expanded ? 'sm:col-span-2 lg:col-span-3 xl:col-span-4' : ''}`}
      {...(expanded ? {} : { whileHover: { y: -3 } })}
    >
      <motion.div layout="position" className="flex min-h-11 items-center justify-between gap-3 border-b border-white/20 px-4 py-2.5">
        <h3 className="truncate lab-title text-base text-brand-chalk transition-colors group-hover:text-white">
          {name}
        </h3>
        <div className="flex items-center gap-1.5">
          <TooltipProvider>
            {specialLabel && (
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <span role="img" aria-label={specialLabelTitles[specialLabel.type]} className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/6 text-brand-chalk">
                    {specialLabel.icon}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{specialLabelTitles[specialLabel.type]}</TooltipContent>
              </Tooltip>
            )}
            {shoe.isFavourite && (
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <span role="img" aria-label="Favourite" className="flex h-6 w-6 items-center justify-center rounded-sm bg-brand-red text-black">
                    <Star className="h-3 w-3 fill-current" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Marked as favourite</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
          {expanded && (
            <button
              type="button"
              aria-expanded="true"
              aria-controls={detailsId}
              aria-label={`Hide details for ${brand} ${name}`}
              onClick={collapse}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border border-white/10 bg-white/6 text-brand-chalk transition-colors hover:bg-white/15 focus-visible:outline-brand-chalk"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>

      <div className={`grid ${expanded ? 'md:grid-cols-2' : ''}`}>
        <div className={expanded ? 'border-b border-white/20 md:border-b-0 md:border-r' : ''}>
          {/* One image for both states, so it glides into place instead of reloading. */}
          <motion.div
            layout
            transition={{ layout: cardLayoutTransition }}
            onClick={expanded ? undefined : onToggleExpand}
            className={`relative flex aspect-[16/10] items-center justify-center bg-brand-soft-surface ${expanded ? 'p-6' : 'cursor-pointer border-b border-white/20 p-4'}`}
          >
            {cardLabel && (
              <div className="absolute left-3 top-3 rounded-sm border border-white/9 bg-black/65 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-putty/90">
                {cardLabel}
              </div>
            )}
            <div className="relative flex h-full w-full items-center justify-center">
              <ShoeImage
                brand={brand}
                shoeName={name}
                imageUrl={imageUrl}
                slug={slug}
                className="object-contain transition-transform duration-500 group-hover:scale-[1.035]"
                transformation={[{ height: 448, width: 640, crop: "at_max", cropMode: "pad_resize", format: "png", quality: 82 }]}
                gender={gender}
              />
            </div>
            {hasBrandLogo(brand) && (
              <TooltipProvider>
                <Tooltip delayDuration={150}>
                  <TooltipTrigger asChild>
                    <span
                      role="img"
                      tabIndex={0}
                      aria-label={`${brand} brand`}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
                      className="absolute bottom-3 left-3 flex h-7 w-24 cursor-default items-center justify-start px-1"
                    >
                      <BrandLogo brand={brand} size="sm" suppressTitle className="h-5 w-20" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64 px-4 py-3">
                    <p className="lab-title text-xs text-white">{brand}</p>
                    {getBrandDescription(brand) && (
                      <p className="mt-1 font-mono text-xs leading-relaxed">{getBrandDescription(brand)}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </motion.div>

          {expanded ? (
            <motion.div key="fit" variants={revealGroup} initial={reduceMotion ? false : 'hidden'} animate="show" className="grid grid-cols-2 gap-3 p-4">
              <motion.div variants={revealItem}>
                <label htmlFor={`${detailsId}-size`} className={labelClass}>Size</label>
                <div className="relative mt-1.5">
                  <select id={`${detailsId}-size`} value={shoe.size || ''} onChange={(e) => onUpdateDetails?.({ size: e.target.value })} className={selectClass}>
                    <option value="">Select</option>
                    {shoeSizes.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-putty" />
                </div>
              </motion.div>
              <motion.div variants={revealItem}>
                <label htmlFor={`${detailsId}-condition`} className={labelClass}>Condition</label>
                <div className="relative mt-1.5">
                  <select id={`${detailsId}-condition`} value={shoe.condition || ''} onChange={(e) => onUpdateDetails?.({ condition: e.target.value })} className={selectClass}>
                    <option value="">Select condition</option>
                    {conditions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-putty" />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="summary"
              ref={showButtonRef}
              type="button"
              aria-expanded="false"
              aria-controls={detailsId}
              aria-label={`Show details for ${brand} ${name}`}
              onClick={onToggleExpand}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.25 } }}
              className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left focus-visible:outline-brand-chalk"
            >
              {hasRatings ? (
                <RatingIcons comfort={shoe.comfortScore} performance={shoe.performanceRating} durability={shoe.durabilityRating} className="min-w-0" />
              ) : (
                <span className="min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.14em] text-brand-putty/85">Add ratings</span>
              )}
              <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-putty transition-transform duration-300 group-hover:translate-y-0.5" />
            </motion.button>
          )}
        </div>

        {expanded && (
          <motion.div
            id={detailsId}
            variants={revealGroup}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="space-y-5 p-4 md:p-6"
          >
            <motion.div variants={revealItem}>
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-putty/85">About this shoe</p>
              <p className="font-mono text-xs leading-relaxed text-brand-putty">{getShoeDescription(details)}</p>
            </motion.div>

            <motion.div variants={revealItem}>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-putty/85">Stats</p>
              <div className="space-y-3.5">
                {statSliders.map(({ label, field, icon, value }) => (
                  <StatSlider key={label} label={label} icon={icon} value={value} onCommit={onRate ? (v) => onRate(field, v) : undefined} />
                ))}
              </div>
            </motion.div>

            {specTags.length > 0 && (
              <motion.div variants={revealItem}>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-putty/85">Tags</p>
                <ul aria-label="Shoe specs" className="flex flex-wrap gap-1.5">
                  {specTags.map((tag) => (
                    <li key={tag} className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-brand-putty">
                      {tag}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <motion.div variants={revealItem} className="flex flex-wrap gap-2 border-t border-white/20 pt-3">
              <button type="button" aria-pressed={shoe.isFavourite === true} onClick={onToggleFavourite} className="flex min-h-9 items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-chalk transition-colors hover:bg-white/5">
                <Star className={`h-3 w-3 ${shoe.isFavourite ? 'fill-current' : ''}`} /> {shoe.isFavourite ? 'Unfavourite' : 'Favourite'}
              </button>
              <button type="button" onClick={onRemove} className="flex min-h-9 items-center gap-1.5 rounded-md border border-brand-red/35 bg-brand-red/8 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-red transition-colors hover:bg-brand-red/[0.14]">
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.shoe === nextProps.shoe &&
    prevProps.variantLabel === nextProps.variantLabel &&
    prevProps.expanded === nextProps.expanded &&
    prevProps.onToggleExpand === nextProps.onToggleExpand &&
    prevProps.onToggleFavourite === nextProps.onToggleFavourite &&
    prevProps.onRemove === nextProps.onRemove &&
    prevProps.onRate === nextProps.onRate &&
    prevProps.onUpdateDetails === nextProps.onUpdateDetails &&
    prevProps.specialLabel?.type === nextProps.specialLabel?.type
  );
});

CloudShoe.displayName = 'CloudShoe';

export default CloudShoe;
