'use client';

import { motion } from 'framer-motion';
import ShoeImage from "@/components/ShoeImage";
import type { UserShoe } from "@/types/api";

interface CloudShoeProps {
  shoe: UserShoe;
  onClick: () => void;
  index: number;
}

export default function CloudShoe({ shoe, onClick, index }: CloudShoeProps) {
  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{
        left: `${20 + (index * 15) % 60}px`,
        top: `${20 + (index * 10) % 60}px`,
      }}
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
      <div className="relative z-10 flex flex-col items-center justify-center w-64 h-64">
        <div className="relative w-52 h-52 mb-2">
          {/* White circular background */}
          <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
          {/* Shoe image with rounded corners and feathered edges */}
          <div className="absolute inset-6 overflow-hidden rounded-3xl">
            {/* Subtle gradient overlays for feathered edge effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/10 via-white/3 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 via-white/3 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-l from-white/10 via-white/3 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/10 via-white/3 to-transparent pointer-events-none z-10" />
            {/* Subtle radial gradient for center fade */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none z-10" 
                 style={{
                   background: 'radial-gradient(circle at center, transparent 80%, rgba(255,255,255,0.05) 100%)'
                 }} />
            {/* Shoe name overlay inside image */}
            <div className="absolute inset-x-0 bottom-2 z-20">
              <div className="bg-black/40 backdrop-blur-sm px-1 py-0.5 rounded mx-2">
                <p className="text-[10px] text-white text-center font-so-cloudy uppercase whitespace-nowrap leading-tight">
                  {shoe.shoe.name}
                </p>
              </div>
            </div>
            <ShoeImage
              brand={shoe.shoe.brand}
              shoeName={shoe.shoe.name}
              imageUrl={shoe.shoe.imageUrl}
              className="w-full h-full object-cover"
              transformation={[
                {
                  height: 160,
                  width: 160,
                  format: "auto",
                  quality: 90
                }
              ]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
