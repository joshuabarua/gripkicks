'use client';

import { motion } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { Check, Pencil, Star } from 'lucide-react';
import ShoeImage from "@/components/ShoeImage";
import { BrandLogo } from "@/components/stash/BrandLogo";
import type { UserShoe } from "@/types/api";
import { getShoeProfileCompletion } from "@/utils/shoeProfile";
import { getShoeDescription } from "@/utils/sanctuaryDescriptions";

interface CloudShoeProps {
  shoe: UserShoe;
  onClick: () => void;
  onEdit: () => void;
  index: number;
  variantLabel?: string | null | undefined;
  specialLabel?: { type: 'most-worn' | 'oldest' | 'most-comfy'; icon: React.ReactNode } | undefined;
}

function formatCondition(condition?: string) {
  if (!condition) return 'Not set';
  return condition.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const CloudShoe = memo<CloudShoeProps>(({ shoe, onClick, onEdit, index, variantLabel, specialLabel }) => {
  const details = shoe.shoe ?? shoe.shoeDetails;
  const brand = details?.brand ?? 'Unknown Brand';
  const name = details?.name ?? 'Unknown Shoe';
  const imageUrl = details?.imageUrl;
  const slug = details?.slug;
  const gender = details?.gender;
  const cardLabel = variantLabel?.trim() || details?.variantLabel?.trim() || (gender ? gender[0]!.toUpperCase() + gender.slice(1) : "Unisex");
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const profileCompletion = getShoeProfileCompletion(shoe);
  const { completed, total, missing: missingFields, isComplete } = profileCompletion;
  const ratingItems = [
    ['COM', shoe.comfortScore],
    ['PER', shoe.performanceRating],
    ['DUR', shoe.durabilityRating],
  ] as const;

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
    <motion.div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`View ${brand} ${name}`}
      className="group relative w-full cursor-pointer outline-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 10) * 0.035 }}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
    >
      <article className="relative overflow-hidden rounded-xl border border-white/30 bg-brand-surface shadow-lg shadow-black/20 transition-colors duration-300 group-hover:border-white/50 group-focus-visible:border-brand-red">
        <div className="flex min-h-11 items-center justify-between border-b border-white/20 px-4 py-2.5">
          <BrandLogo brand={brand} size="sm" className="max-w-[70%]" />
          <div className="flex items-center gap-1.5">
            {specialLabel && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/6 text-brand-chalk">
                {specialLabel.icon}
              </span>
            )}
            {shoe.isFavourite && (
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-brand-red text-black">
                <Star className="h-3 w-3 fill-current" />
              </span>
            )}
          </div>
        </div>

        <div className="relative flex aspect-4/3 items-center justify-center border-b border-white/20 bg-brand-soft-surface p-4">
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
                height: 260,
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

        <div className="space-y-4 p-4">
          <div className="min-w-0">
            <h3 className="truncate font-mono text-base font-semibold text-brand-chalk transition-colors group-hover:text-white">
              {name}
            </h3>
            <p className="mt-2 font-mono text-xs leading-relaxed text-brand-putty">
              {getShoeDescription(details)}
            </p>
          </div>

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
                  <strong className={`mt-0.5 block font-normal text-brand-chalk ${value === undefined ? 'font-mono text-[11px]' : 'font-ball-pill text-lg'}`}>{value ?? 'Not rated'}</strong>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            title={isComplete ? 'Size, condition, and ratings added' : `Missing: ${missingFields.join(', ')}`}
            aria-label={isComplete ? `${name} profile complete` : `Complete ${name} profile. Missing ${missingFields.join(', ')}`}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            className={`flex min-h-11 w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${
              isComplete
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
        </div>
      </article>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if essential props changed
  return (
    prevProps.shoe === nextProps.shoe &&
    prevProps.index === nextProps.index &&
    prevProps.variantLabel === nextProps.variantLabel &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.specialLabel?.type === nextProps.specialLabel?.type
  );
});

CloudShoe.displayName = 'CloudShoe';

export default CloudShoe;
