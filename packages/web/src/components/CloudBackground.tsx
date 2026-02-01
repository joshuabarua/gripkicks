'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

export default function CloudBackground() {
  const [windowWidth, setWindowWidth] = useState(0);

  // Debounce function to limit resize events
  const debounce = useCallback(<T extends (...args: unknown[]) => unknown>(func: T, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    
    const handleResize = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 250); // 250ms debounce
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [debounce]);

  if (windowWidth === 0) return null;

  // Generate random positions for clouds
  const clouds = [
    { src: "/imgs/clouds/cloud1.png", size: 400, opacity: 0.9, duration: 60, delay: 0 },
    { src: "/imgs/clouds/cloud2.png", size: 350, opacity: 0.85, duration: 45, delay: 8 },
    { src: "/imgs/clouds/cloud3.png", size: 380, opacity: 0.88, duration: 55, delay: 15 },
    { src: "/imgs/clouds/cloud4.png", size: 420, opacity: 0.92, duration: 50, delay: 22 },
    { src: "/imgs/clouds/cloud5.png", size: 360, opacity: 0.87, duration: 48, delay: 5 },
    { src: "/imgs/clouds/cloud1.png", size: 450, opacity: 0.95, duration: 65, delay: 12 },
    { src: "/imgs/clouds/cloud3.png", size: 330, opacity: 0.83, duration: 40, delay: 18 }
  ];

  // Vertical positions spread out to prevent overlap
  const verticalPositions = [
    "-top-12", "top-10", "top-1/4", "top-1/2", "top-3/4", "bottom-10", "-bottom-8"
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {clouds.map((cloud, index) => {
        // Alternate direction for each cloud
        const direction = index % 2 === 0 ? 'left' : 'right';
        const initialX = direction === 'left' ? -600 : windowWidth + 600;
        const finalX = direction === 'left' ? windowWidth + 600 : -600;
        
        // Assign unique vertical position from our array
        const verticalPos = verticalPositions[index % verticalPositions.length];
        
        return (
          <motion.div
            key={index}
            className={`absolute ${verticalPos}`}
            style={{ width: cloud.size }}
            initial={{ x: initialX }}
            animate={{ x: finalX, opacity: cloud.opacity }}
            transition={{
              duration: cloud.duration,
              ease: "linear",
              repeat: Infinity,
              delay: cloud.delay,
            }}
          >
            <Image 
              src={cloud.src} 
              alt="Cloud" 
              width={cloud.size}
              height={400}
              style={{ maxHeight: '400px', width: 'auto' }}
              priority={false}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
