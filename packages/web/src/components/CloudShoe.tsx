'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { memo, useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Pencil, Star, Trash2 } from 'lucide-react';
import ShoeImage from "@/components/ShoeImage";
import { BrandLogo } from "@/components/stash/BrandLogo";
import type { UserShoe } from "@/types/api";
import { getShoeProfileCompletion } from "@/utils/shoeProfile";
import { getShoeDescription } from "@/utils/sanctuaryDescriptions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CloudShoeProps {
  shoe: UserShoe;
  variantLabel?: string | null | undefined;
  specialLabel?: { type: 'most-worn' | 'oldest' | 'most-comfy'; icon: React.ReactNode } | undefined;
  onOpenStats: () => void;
  onEdit: () => void;
  onToggleFavourite: () => void;
  onRemove: () => void;
}

function formatCondition(condition?: string) {
  if (!condition) return 'Not set';
  return condition.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const specialLabelTitles = {
  'most-comfy': 'Highest comfort score in your collection',
  'oldest': 'Oldest shoe in your collection',
  'most-worn': 'Most worn shoe in your collection',
} as const;

const CloudShoe = memo<CloudShoeProps>(({ shoe, variantLabel, specialLabel, onOpenStats, onEdit, onToggleFavourite, onRemove }) => {
  const details = shoe.shoe ?? shoe.shoeDetails;
  const brand = details?.brand ?? 'Unknown Brand';
  const name = details?.name ?? 'Unknown Shoe';
  const imageUrl = details?.imageUrl;
  const slug = details?.slug;
  const gender = details?.gender;
  const cardLabel = variantLabel?.trim() || details?.variantLabel?.trim() || (gender ? gender[0]!.toUpperCase() + gender.slice(1) : "Unisex");
  const [isInView, setIsInView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const detailsId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const profileCompletion = getShoeProfileCompletion(shoe);
  const { completed, total, missing: missingFields, isComplete } = profileCompletion;
  const ratingItems = [
    ['COM', shoe.comfortScore],
    ['PER', shoe.performanceRating],
    ['DUR', shoe.durabilityRating],
  ] as const;
  const ratedItems = ratingItems.filter(([, value]) => value !== undefined);
  const specTags = [
    shoe.shoe?.aggressiveness,
    shoe.shoe?.climbingDiscipline,
    shoe.shoe?.stiffness,
    shoe.shoe?.volume,
    shoe.shoe?.rubberTechnology?.compound,
  ].filter((tag): tag is string => Boolean(tag?.trim()));

  useEffect(() => {
    if (isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isInView]);

  return (
    <motion.article
      ref={cardRef}
      className="group relative w-full overflow-hidden rounded-xl border border-white/30 bg-brand-surface shadow-lg shadow-black/20 transition-colors duration-300 hover:border-white/50 focus-within:border-white/50"
      {...(expanded ? {} : { whileHover: { y: -3 } })}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={detailsId}
        aria-label={expanded ? `Hide details for ${brand} ${name}` : `Show details for ${brand} ${name}`}
        onClick={() => setExpanded((value) => !value)}
        className="block w-full text-left outline-hidden focus-visible:border-brand-red"
      >
        <div className="flex min-h-11 items-center justify-between border-b border-white/20 px-4 py-2.5">
          <BrandLogo brand={brand} size="sm" tooltip className="max-w-[70%]" />
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
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Edit ${brand} ${name}`}
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onEdit(); } }}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border border-white/10 bg-white/6 text-brand-chalk transition-colors hover:bg-white/15"
                  >
                    <Pencil className="h-3 w-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Edit shoe</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${brand} ${name}`}
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onRemove(); } }}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border border-brand-red/30 bg-white/6 text-brand-red transition-colors hover:bg-brand-red/15"
                  >
                    <Trash2 className="h-3 w-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Remove from sanctuary</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="relative flex aspect-[16/10] items-center justify-center border-b border-white/20 bg-brand-soft-surface p-4">
          <div className="absolute left-3 top-3 rounded-sm border border-white/9 bg-black/65 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-putty/90">
            {cardLabel}
          </div>
          {isInView && (
            <ShoeImage
              brand={brand}
              shoeName={name}
              imageUrl={imageUrl}
              slug={slug}
              className="object-contain transition-transform duration-500 group-hover:scale-[1.035]"
              transformation={[{
                height: 220,
                width: 320,
                crop: "at_max",
                cropMode: "pad_resize",
                format: "png",
                quality: 82,
              }]}
              gender={gender}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <h3 className="truncate font-mono text-base font-semibold text-brand-chalk transition-colors group-hover:text-white">
              {name}
            </h3>
            <p className="mt-1.5 truncate font-mono text-[11px] uppercase tracking-[0.14em] text-brand-putty/85">
              {ratedItems.length ? ratedItems.map(([label, value]) => `${label} ${value}`).join(' · ') : 'Add ratings'}
            </p>
          </div>
          <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-brand-putty transition-transform duration-300 motion-reduce:transform-none ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            id={detailsId}
            initial={reduceMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { height: 'auto', opacity: 1, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden border-t border-white/20"
          >
            <div className="space-y-4 p-4">
              <p className="font-mono text-xs leading-relaxed text-brand-putty">
                {getShoeDescription(details)}
              </p>

              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/20 bg-white/20">
                <div className="bg-brand-base px-3 py-2.5">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.13em] text-brand-putty/85">Size</dt>
                  <dd className="mt-1 truncate font-mono text-xs font-medium text-brand-chalk">{shoe.size || 'Not set'}</dd>
                </div>
                <div className="bg-brand-base px-3 py-2.5">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.13em] text-brand-putty/85">Condition</dt>
                  <dd className="mt-1 truncate font-mono text-xs font-medium text-brand-chalk">{formatCondition(shoe.condition)}</dd>
                </div>
              </dl>

              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-putty/85">Your ratings</p>
                <div className="grid grid-cols-3 gap-2">
                  {ratingItems.map(([label, value]) => (
                    <div key={label} className="rounded-md border border-white/20 bg-white/2.5 px-2 py-2 text-center">
                      <span className="block font-mono text-[11px] tracking-[0.12em] text-brand-putty/85">{label}</span>
                      <strong className={`mt-0.5 block font-normal text-brand-chalk ${value === undefined ? 'font-mono text-[11px]' : 'font-amatic text-lg'}`}>{value ?? 'Not rated'}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {specTags.length > 0 && (
                <ul aria-label="Shoe specs" className="flex flex-wrap gap-1.5">
                  {specTags.map((tag) => (
                    <li key={tag} className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-brand-putty">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              <div className="space-y-4 pt-4">
                <button
                  type="button"
                  title={isComplete ? 'Size, condition, and ratings added' : `Missing: ${missingFields.join(', ')}`}
                  aria-label={isComplete ? `${name} profile complete` : `Complete ${name} profile. Missing ${missingFields.join(', ')}`}
                  onClick={onEdit}
                  className={`flex min-h-11 w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${isComplete
                      ? 'border-white/20 bg-white/2.5 hover:bg-white/5'
                      : 'border-brand-red/35 bg-brand-red/8 hover:bg-brand-red/[0.14]'
                    }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm ${isComplete ? 'bg-white/10 text-brand-chalk' : 'bg-brand-red text-black'}`}>
                      {isComplete ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-[11px] font-medium text-brand-chalk">
                        {isComplete ? 'Profile complete' : 'Add your fit'}
                      </span>
                      <span className="block truncate font-mono text-[11px] text-brand-putty/85">
                        {completed} of {total} details added
                      </span>
                    </span>
                  </span>
                  <span className="ml-2 font-mono text-[10px] text-brand-putty/85">Edit</span>
                </button>

                <div className="flex flex-wrap gap-2 border-t border-white/20 pt-3">
                  <button type="button" aria-pressed={shoe.isFavourite === true} onClick={onToggleFavourite} className="min-h-9 rounded-md border border-white/20 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-chalk transition-colors hover:bg-white/5">
                    {shoe.isFavourite ? 'Unfavourite' : 'Favourite'}
                  </button>
                  <button type="button" onClick={onOpenStats} className="min-h-9 rounded-md border border-white/20 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-chalk transition-colors hover:bg-white/5">
                    Full stats
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.shoe === nextProps.shoe &&
    prevProps.variantLabel === nextProps.variantLabel &&
    prevProps.onOpenStats === nextProps.onOpenStats &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onToggleFavourite === nextProps.onToggleFavourite &&
    prevProps.onRemove === nextProps.onRemove &&
    prevProps.specialLabel?.type === nextProps.specialLabel?.type
  );
});

CloudShoe.displayName = 'CloudShoe';

export default CloudShoe;
