'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';
import ShoeImage from "@/components/ShoeImage";
import type { UserShoe } from "@/types/api";

interface CloudShoeProps {
  shoe: UserShoe;
  onClick: () => void;
  index: number;
  rank?: number;
  specialLabel?: { type: 'most-worn' | 'oldest' | 'most-comfy'; icon: React.ReactNode };
}

export default function CloudShoe({ shoe, onClick, index, rank, specialLabel }: CloudShoeProps) {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInView) return; // Don't re-observe if already in view

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
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 8 + (index % 3),
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
        delay: index * 0.5,
      }}
      onClick={onClick}
      whileHover={{
        rotate: 5,
      }}
      whileTap={{}}
    >
      {/* Shoe content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-48 h-48">
        {/* Rank badge - shows on hover */}
        {rank && (
          <div className="absolute -top-2 -right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
              #{rank}
            </div>
          </div>
        )}

        {/* Favourite star */}
        {shoe.isFavourite && (
          <div className="absolute -top-[-15px] -right-[-25px] z-30">
            <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white">
              <Star className="w-3 h-3 fill-current" />
            </div>
          </div>
        )}

        {/* Special label badge */}
        {specialLabel && (
          <div className="absolute -top-2 -left-2 z-30">
            <div className={`rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white ${specialLabel.type === 'most-comfy' ? 'bg-pink-500 text-white' :
              specialLabel.type === 'oldest' ? 'bg-blue-500 text-white' :
                'bg-purple-500 text-white'
              }`}>
              {specialLabel.icon}
            </div>
          </div>
        )}

        <div className="relative w-44 h-44">
          {/* White circular background */}
          <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
          {/* Shoe image - reduced inset for less cropping */}
          <div className="absolute inset-2 overflow-hidden rounded-full">
            {isInView && (
              <ShoeImage
                brand={shoe.shoe.brand}
                shoeName={shoe.shoe.name}
                imageUrl={shoe.shoe.imageUrl}
                className={`w-full h-full object-contain transition-opacity duration-300`}
                transformation={[
                  {
                    height: 200,
                    width: 200,
                    format: "auto",
                    quality: 75
                  }
                ]}
              />
            )}
          </div>
          {/* Shoe name inside the circle at bottom */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
              <p className="text-xs text-gray-800 text-center font-so-cloudy uppercase whitespace-nowrap leading-tight font-semibold">
                {shoe.shoe.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div >
  );
}
