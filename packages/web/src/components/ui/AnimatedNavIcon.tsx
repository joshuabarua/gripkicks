'use client';

import { useState, useCallback } from 'react';
import { motion, type Variants } from 'framer-motion';

type IconAnimation = 'bounce' | 'wiggle' | 'pulse' | 'spin' | 'pop' | 'shake';

interface AnimatedNavIconProps {
  icon: React.ReactNode;
  animation?: IconAnimation;
  className?: string;
  size?: number;
}

const animationVariants: Record<IconAnimation, Variants> = {
  bounce: {
    idle: { y: 0, scale: 1 },
    hover: {
      y: [0, -3, 0, -1.5, 0],
      scale: [1, 1.15, 1, 1.08, 1],
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
  wiggle: {
    idle: { rotate: 0, scale: 1 },
    hover: {
      rotate: [0, -12, 10, -8, 5, 0],
      scale: [1, 1.1, 1.1, 1.05, 1.05, 1],
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
  pulse: {
    idle: { scale: 1, opacity: 1 },
    hover: {
      scale: [1, 1.25, 0.95, 1.1, 1],
      opacity: [1, 0.8, 1, 0.9, 1],
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
  spin: {
    idle: { rotate: 0, scale: 1 },
    hover: {
      rotate: [0, 360],
      scale: [1, 1.1, 1],
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  },
  pop: {
    idle: { scale: 1 },
    hover: {
      scale: [1, 0.8, 1.2, 1],
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  },
  shake: {
    idle: { x: 0 },
    hover: {
      x: [0, -3, 3, -2, 2, 0],
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  },
};

export function AnimatedNavIcon({
  icon,
  animation = 'bounce',
  className = '',
  size = 24,
}: AnimatedNavIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleAnimationComplete = useCallback(() => setIsHovered(false), []);

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      variants={animationVariants[animation]}
      animate={isHovered ? 'hover' : 'idle'}
      onAnimationComplete={handleAnimationComplete}
    >
      {icon}
    </motion.div>
  );
}
