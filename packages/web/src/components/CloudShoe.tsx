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
        <div className="relative w-44 h-44">
          {/* White circular background */}
          <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
          {/* Shoe image - reduced inset for less cropping */}
          <div className="absolute inset-2 overflow-hidden rounded-full">
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
                  quality: 90
                }
              ]}
            />
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
    </motion.div>
  );
}
