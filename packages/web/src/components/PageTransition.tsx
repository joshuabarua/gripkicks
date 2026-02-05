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

const MarqueeText = ({ children, reverse = false }: { children: React.ReactNode; reverse?: boolean }) => (
  <motion.div
    animate={{ x: reverse ? [0, 500] : [0, -500] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    className="flex gap-8 whitespace-nowrap"
  >
    {Array(20).fill(null).map((_, i) => (
      <span key={i} className="font-tanker text-xl text-orange-500/20">
        {children}
      </span>
    ))}
  </motion.div>
);

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [imageCounter, setImageCounter] = useState(1);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (pathname !== prevPathname) {
      setShowContent(false);
      setIsTransitioning(true);
      setCurrentImageIndex(0);
      setImageCounter(1);

      const imageInterval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          if (prev >= transitionImages.length - 1) {
            clearInterval(imageInterval);
            return prev;
          }
          return prev + 1;
        });
        setImageCounter((prev) => Math.min(prev + 1, transitionImages.length));
      }, 180);

      const transitionTimeout = setTimeout(() => {
        setIsTransitioning(false);
        setPrevPathname(pathname);
        setShowContent(true);
      }, transitionImages.length * 180 + 400);

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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          >
            {/* Background */}
            <motion.div
              className="absolute inset-0 bg-neutral-950"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />

            {/* Animated background text */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none flex flex-col justify-center gap-4 opacity-30">
              <MarqueeText>GRIP KICKS • LOADING • </MarqueeText>
              <MarqueeText reverse>AI POWERED • CLIMBING SHOES • </MarqueeText>
              <MarqueeText>FIND YOUR FIT • </MarqueeText>
            </div>

            {/* Corner accents */}
            <motion.div 
              className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-orange-500/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            />
            <motion.div 
              className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-orange-500/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            />

            {/* Top label */}
            <motion.div
              className="absolute top-6 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="font-mono text-[10px] text-orange-500 tracking-[0.3em]">[LOADING]</span>
            </motion.div>

            {/* Center content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Image container with border */}
              <motion.div
                className="relative p-1 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-neutral-900 rounded-xl p-4 relative overflow-hidden">
                  {/* Animated stripe pattern */}
                  <motion.div 
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 20px)'
                    }}
                    animate={{ backgroundPosition: ['0px 0px', '28px 28px'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <AnimatePresence mode="popLayout">
                    <motion.img
                      key={currentImageIndex}
                      src={transitionImages[currentImageIndex]}
                      alt=""
                      className="w-[180px] h-[180px] object-contain relative z-10"
                      initial={{ scale: 1.3, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.7, opacity: 0, rotate: 10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Counter */}
              <motion.div
                className="mt-6 flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="font-mono text-[10px] text-neutral-600">[{String(imageCounter).padStart(2, '0')}/{String(transitionImages.length).padStart(2, '0')}]</span>
                <div className="w-24 h-[2px] bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(imageCounter / transitionImages.length) * 100}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Bottom branding */}
            <motion.div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="font-tanker text-2xl text-white mb-1">
                GRIP <span className="text-orange-500">KICKS</span>
              </div>
              <div className="font-mono text-[9px] text-neutral-600 tracking-wider">V.2024</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ visibility: showContent ? 'visible' : 'hidden' }}
      >
        {children}
      </motion.div>
    </>
  );
}
