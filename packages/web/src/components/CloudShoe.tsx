'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { memo } from 'react';
import { Star } from 'lucide-react';
import ShoeImage from "@/components/ShoeImage";
import type { UserShoe } from "@/types/api";
import { getEffectiveShoeStats } from '@/components/ShoeStatsModal/utils';

interface CloudShoeProps {
  shoe: UserShoe;
  onClick: () => void;
  index: number;
  specialLabel?: { type: 'most-worn' | 'oldest' | 'most-comfy'; icon: React.ReactNode } | undefined;
}

const CloudShoe = memo<CloudShoeProps>(({ shoe, onClick, index, specialLabel }) => {
  const details = shoe?.shoe ?? shoe?.shoeDetails;
  const brand = details?.brand ?? 'Unknown Brand';
  const name = details?.name ?? 'Unknown Shoe';
  const imageUrl = details?.imageUrl;
  const slug = details?.slug;
  const gender = details?.gender;
  const characteristicSource = shoe?.shoe;

  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const avgScore = getEffectiveShoeStats(
    {
      aggressiveness: characteristicSource?.aggressiveness,
      climbingDiscipline: characteristicSource?.climbingDiscipline,
      stiffness: characteristicSource?.stiffness,
    },
    {
      comfortScore: shoe.comfortScore,
      performanceRating: shoe.performanceRating,
      durabilityRating: shoe.durabilityRating,
    },
  ).average.toFixed(1);

  useEffect(() => {
    if (isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [isInView]);

  return (
    <motion.div
      ref={imgRef}
      className="relative cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.04 }}
      onClick={onClick}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="monolith-card relative flex flex-col justify-center items-center gap-fluid-sm rounded-lg border border-white/[0.09] bg-black/65 p-fluid-md transition-colors duration-300 group-hover:border-brand-red/35">
        {(shoe.isFavourite || specialLabel) && (
          <div className="absolute top-fluid-sm left-fluid-sm z-20 flex gap-fluid-xs">
            {shoe.isFavourite && (
              <div className="bg-brand-red text-black rounded-sm w-6 h-6 flex items-center justify-center">
                <Star className="w-3 h-3 fill-current" />
              </div>
            )}
            {specialLabel && (
              <div className={`rounded-full w-7 h-7 flex items-center justify-center ${specialLabel.type === 'most-comfy' ? 'bg-pink-500/90 text-white' :
                specialLabel.type === 'oldest' ? 'bg-blue-500/90 text-white' :
                  'bg-purple-500/90 text-white'
                }`}>
                {specialLabel.icon}
              </div>
            )}
          </div>
        )}

        <div className="absolute top-fluid-sm right-fluid-sm z-20">
          <div className="bg-black/70 rounded-sm px-2 py-0.5 border border-white/[0.09]">
            <span className="font-sora text-[10px] text-brand-chalk/70 font-semibold tracking-wider">{avgScore}</span>
          </div>
        </div>

        <div className="flex items-center justify-center w-[min(48vw,220px)] h-[min(55vw,240px)]">
          {isInView && (
            <ShoeImage
              brand={brand}
              shoeName={name}
              imageUrl={imageUrl}
              slug={slug}
              className="object-contain"
              transformation={[
                {
                  height: 200,
                  width: 200,
                  crop: "at_max",
                  cropMode: "pad_resize",
                  format: "png",
                  quality: 80
                }
              ]}
              gender={gender}
            />
          )}
        </div>

        <div className="w-full text-center space-y-0.5">
          <p className="font-sora uppercase text-brand-chalk text-sm font-medium leading-tight truncate group-hover:text-white transition-colors duration-300">
            {name}
          </p>
          <p className="font-sora text-[10px] text-brand-putty/30 truncate">
            {brand}
          </p>
        </div>
      </div>
    </motion.div >
  );
}, (prevProps, nextProps) => {
  // Only re-render if essential props changed
  return (
    prevProps.shoe._id === nextProps.shoe._id &&
    prevProps.shoe.isFavourite === nextProps.shoe.isFavourite &&
    prevProps.shoe.comfortScore === nextProps.shoe.comfortScore &&
    prevProps.shoe.performanceRating === nextProps.shoe.performanceRating &&
    prevProps.shoe.durabilityRating === nextProps.shoe.durabilityRating &&
    prevProps.index === nextProps.index &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.specialLabel?.type === nextProps.specialLabel?.type
  );
});

CloudShoe.displayName = 'CloudShoe';

export default CloudShoe;
