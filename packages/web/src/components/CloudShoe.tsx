'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { memo, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Ellipsis, Feather, Pencil, Shield, Star, Trash2, X, Zap } from 'lucide-react';
import ShoeImage from "@/components/ShoeImage";
import { BrandLogo, hasBrandLogo } from "@/components/stash/BrandLogo";
import type { UserShoe } from "@/types/api";
import { getBrandDescription, getShoeDescription } from "@/utils/sanctuaryDescriptions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RatingIcons } from "@/components/RatingIcons";

interface CloudShoeProps {
  shoe: UserShoe;
  variantLabel?: string | null | undefined;
  specialLabel?: { type: 'most-worn' | 'oldest' | 'most-comfy'; icon: React.ReactNode } | undefined;
  onOpenStats: () => void;
  onEdit: () => void;
  onToggleFavourite: () => void;
  onRemove: () => void;
  onRate?: (field: 'comfortScore' | 'performanceRating' | 'durabilityRating', value: number) => void;
}

const GENDER_WORDS = new Set(["men", "women", "unisex", "kids", "men's", "women's"]);

function formatCondition(condition?: string) {
  if (!condition) return 'Not set';
  return condition.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const specialLabelTitles = {
  'most-comfy': 'Highest comfort score in your collection',
  'oldest': 'Oldest shoe in your collection',
  'most-worn': 'Most worn shoe in your collection',
} as const;

function StatSlider({ label, icon, value, onCommit }: { label: string; icon: React.ReactNode; value: number | undefined; onCommit: ((value: number) => void) | undefined }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(0);
  const shown = editing ? draft : value;
  const pct = shown === undefined ? 0 : Math.min(10, Math.max(0, shown)) * 10;

  const commit = () => {
    setEditing(false);
    if (draft !== value) onCommit?.(draft);
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
      {editing ? (
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={draft}
          autoFocus
          aria-label={`${label} rating`}
          onChange={(e) => setDraft(Number(e.target.value))}
          onPointerUp={commit}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false); }}
          className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-brand-red/40 outline-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand-chalk [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-chalk"
        />
      ) : (
        <button
          type="button"
          aria-label={onCommit ? `Edit ${label} rating` : `${label} rating ${value ?? 'not rated'}`}
          disabled={!onCommit}
          onClick={() => { setDraft(value ?? 5); setEditing(true); }}
          className="relative mt-2 block h-3 w-full cursor-pointer disabled:cursor-default"
        >
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10">
            <div className="absolute inset-y-0 left-0 rounded-full bg-brand-red/70" style={{ width: `${pct}%` }} />
          </div>
          {value !== undefined && (
            <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-chalk" style={{ left: `${pct}%` }} />
          )}
        </button>
      )}
      <div className="mt-1 flex justify-between font-mono text-[10px] text-brand-putty/60"><span>0</span><span>10</span></div>
    </div>
  );
}

const CloudShoe = memo<CloudShoeProps>(({ shoe, variantLabel, specialLabel, onOpenStats, onEdit, onToggleFavourite, onRemove, onRate }) => {
  const details = shoe.shoe ?? shoe.shoeDetails;
  const brand = details?.brand ?? 'Unknown Brand';
  const name = details?.name ?? 'Unknown Shoe';
  const imageUrl = details?.imageUrl;
  const slug = details?.slug;
  const gender = details?.gender;
  const rawLabel = variantLabel?.trim() || details?.variantLabel?.trim() || null;
  const cardLabel = rawLabel && !GENDER_WORDS.has(rawLabel.toLowerCase()) ? rawLabel : null;
  const [isInView, setIsInView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
  const cardRef = useRef<HTMLElement>(null);
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

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
    setExpanded(false);
  }

  const shoeVisual = (
    <>
      {cardLabel && (
        <div className="absolute left-3 top-3 rounded-sm border border-white/9 bg-black/65 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-putty/90">
          {cardLabel}
        </div>
      )}
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
    </>
  );

  return (
    <motion.article
      ref={cardRef}
      className={`group relative w-full overflow-hidden rounded-xl border border-white/30 bg-brand-surface shadow-lg shadow-black/20 transition-colors duration-300 hover:border-white/50 focus-within:border-white/50 ${expanded ? 'sm:col-span-2 lg:col-span-3 xl:col-span-4' : ''}`}
      {...(expanded ? {} : { whileHover: { y: -3 } })}
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/20 px-4 py-2.5">
        <h3 className="truncate font-amatic text-2xl tracking-wide text-brand-chalk transition-colors group-hover:text-white">
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
          {expanded ? (
            <button
              type="button"
              aria-expanded="true"
              aria-controls={detailsId}
              aria-label={`Hide details for ${brand} ${name}`}
              onClick={() => setExpanded(false)}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border border-white/10 bg-white/6 text-brand-chalk transition-colors hover:bg-white/15 focus-visible:outline-brand-chalk"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger
                aria-label={`Options for ${brand} ${name}`}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border border-white/10 bg-white/6 text-brand-chalk transition-colors hover:bg-white/15 focus-visible:outline-brand-chalk"
              >
                <Ellipsis className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onToggleFavourite}>
                  <Star className={`h-3.5 w-3.5 ${shoe.isFavourite ? 'fill-current' : ''}`} />
                  {shoe.isFavourite ? 'Unfavourite' : 'Favourite'}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit shoe
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onRemove} className="text-brand-red focus:bg-brand-red/15 focus:text-brand-red">
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove from sanctuary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!expanded ? (
          <motion.button
            key="collapsed"
            type="button"
            aria-expanded="false"
            aria-controls={detailsId}
            aria-label={`Show details for ${brand} ${name}`}
            onClick={() => setExpanded(true)}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="block w-full text-left outline-hidden focus-visible:border-brand-red"
          >
            <div className="relative flex aspect-[16/10] items-center justify-center border-b border-white/20 bg-brand-soft-surface p-4">
              {shoeVisual}
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              {hasRatings ? (
                <RatingIcons comfort={shoe.comfortScore} performance={shoe.performanceRating} durability={shoe.durabilityRating} className="min-w-0" />
              ) : (
                <p className="min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.14em] text-brand-putty/85">Add ratings</p>
              )}
              <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-putty" />
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="details"
            id={detailsId}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22 }}
          >
            <div className="grid md:grid-cols-2">
              <div className="border-b border-white/20 md:border-b-0 md:border-r">
                <div className="relative flex aspect-[16/10] items-center justify-center bg-brand-soft-surface p-6">
                  {shoeVisual}
                </div>
                <div className="grid grid-cols-2 gap-3 p-4">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.13em] text-brand-putty/85">Size</span>
                    <button type="button" onClick={onEdit} className="mt-1.5 flex w-full items-center justify-between rounded-md border border-white/20 bg-white/2.5 px-3 py-2.5 font-mono text-xs text-brand-chalk transition-colors hover:bg-white/5">
                      {shoe.size || 'Select'}
                      <ChevronDown className="h-3.5 w-3.5 text-brand-putty" />
                    </button>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.13em] text-brand-putty/85">Condition</span>
                    <button type="button" onClick={onEdit} className="mt-1.5 flex w-full items-center justify-between rounded-md border border-white/20 bg-white/2.5 px-3 py-2.5 font-mono text-xs text-brand-chalk transition-colors hover:bg-white/5">
                      {shoe.condition ? formatCondition(shoe.condition) : 'Select condition'}
                      <ChevronDown className="h-3.5 w-3.5 text-brand-putty" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-4 md:p-6">
                <div>
                  <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-putty/85">About this shoe</p>
                  <p className="font-mono text-xs leading-relaxed text-brand-putty">
                    {getShoeDescription(details)}
                  </p>
                </div>

                <div>
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-putty/85">Stats</p>
                  <div className="space-y-3.5">
                    {statSliders.map(({ label, field, icon, value }) => (
                      <StatSlider key={label} label={label} icon={icon} value={value} onCommit={onRate ? (v) => onRate(field, v) : undefined} />
                    ))}
                  </div>
                </div>

                {specTags.length > 0 && (
                  <div>
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-putty/85">Tags</p>
                    <ul aria-label="Shoe specs" className="flex flex-wrap gap-1.5">
                      {specTags.map((tag) => (
                        <li key={tag} className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-brand-putty">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t border-white/20 pt-3">
                  <button type="button" onClick={onEdit} className="flex min-h-9 items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-chalk transition-colors hover:bg-white/5">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button type="button" aria-pressed={shoe.isFavourite === true} onClick={onToggleFavourite} className="flex min-h-9 items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-chalk transition-colors hover:bg-white/5">
                    <Star className={`h-3 w-3 ${shoe.isFavourite ? 'fill-current' : ''}`} /> {shoe.isFavourite ? 'Unfavourite' : 'Favourite'}
                  </button>
                  <button type="button" onClick={onOpenStats} className="min-h-9 rounded-md border border-white/20 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-chalk transition-colors hover:bg-white/5">
                    Full stats
                  </button>
                  <button type="button" onClick={onRemove} className="flex min-h-9 items-center gap-1.5 rounded-md border border-brand-red/35 bg-brand-red/8 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-red transition-colors hover:bg-brand-red/[0.14]">
                    <Trash2 className="h-3 w-3" /> Remove
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
    prevProps.onRate === nextProps.onRate &&
    prevProps.specialLabel?.type === nextProps.specialLabel?.type
  );
});

CloudShoe.displayName = 'CloudShoe';

export default CloudShoe;
