"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const transitionImages = [
  '/imgs/transition/blue_hold.png',
  '/imgs/transition/rock1.png',
  '/imgs/transition/green_hold.png',
  '/imgs/transition/plastic_hold1.png',
  '/imgs/transition/yellow_hold.png',
  '/imgs/transition/dark_blue.png',
];

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPathname) {
      setIsTransitioning(true);
      setCurrentImageIndex(0);

      const imageInterval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          if (prev >= transitionImages.length - 1) {
            clearInterval(imageInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 150);

      const transitionTimeout = setTimeout(() => {
        setIsTransitioning(false);
        setPrevPathname(pathname);
      }, transitionImages.length * 150 + 300);

      return () => {
        clearInterval(imageInterval);
        clearTimeout(transitionTimeout);
      };
    }
  }, [pathname, prevPathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.95 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
            
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <AnimatePresence mode="sync">
                <motion.img
                  key={currentImageIndex}
                  src={transitionImages[currentImageIndex]}
                  alt=""
                  className="w-[200px] h-[200px] object-cover rounded-lg"
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: isTransitioning ? 0.2 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
