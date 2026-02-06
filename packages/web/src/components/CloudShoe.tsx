'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';
import ShoeImage from "@/components/ShoeImage";
import type { UserShoe } from "@/types/api";
import { calculateDefaultStats } from '@/components/ShoeStatsModal/utils';

interface CloudShoeProps {
  shoe: UserShoe;
  onClick: () => void;
  index: number;
  specialLabel?: { type: 'most-worn' | 'oldest' | 'most-comfy'; icon: React.ReactNode };
}

export default function CloudShoe({ shoe, onClick, index, specialLabel }: CloudShoeProps) {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const avgScore = (() => {
    const defaultStats = calculateDefaultStats({});
    const comfort = shoe.comfortScore || defaultStats.comfort;
    const performance = shoe.performanceRating || defaultStats.performance;
    const durability = shoe.durabilityRating || defaultStats.durability;
    return ((comfort + performance + durability) / 3).toFixed(1);
  })();

  useEffect(() => {
    if (isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
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
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-52 bg-white rounded-2xl overflow-hidden transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:shadow-orange-500/10">
        {(shoe.isFavourite || specialLabel) && (
          <div className="absolute top-3 left-3 z-20 flex gap-1.5">
            {shoe.isFavourite && (
              <div className="bg-orange-500/90 text-white rounded-full w-6 h-6 flex items-center justify-center">
                <Star className="w-3 h-3 fill-current" />
              </div>
            )}
            {specialLabel && (
              <div className={`rounded-full w-6 h-6 flex items-center justify-center ${
                specialLabel.type === 'most-comfy' ? 'bg-pink-500/90 text-white' :
                specialLabel.type === 'oldest' ? 'bg-blue-500/90 text-white' :
                'bg-purple-500/90 text-white'
              }`}>
                {specialLabel.icon}
              </div>
            )}
          </div>
        )}

        <div className="absolute top-3 right-3 z-20">
          <div className="bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-0.5">
            <span className="font-mono text-[10px] text-orange-400 font-bold">{avgScore}</span>
          </div>
        </div>

        <div className="w-full h-44 bg-white flex items-center justify-center">
          {isInView && (
            <ShoeImage
              brand={shoe.shoe.brand}
              shoeName={shoe.shoe.name}
              imageUrl={shoe.shoe.imageUrl}
              className="w-full h-full object-contain"
              transformation={[
                {
                  height: 200,
                  width: 200,
                  format: "auto",
                  quality: 80
                }
              ]}
            />
          )}
        </div>

        <div className="px-4 py-3 bg-white border-t border-neutral-100">
          <p className="font-sora text-neutral-900 text-sm font-medium leading-tight truncate group-hover:text-orange-500 transition-colors">
            {shoe.shoe.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
