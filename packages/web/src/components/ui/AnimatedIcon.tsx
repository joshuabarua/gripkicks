'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type AnimationType = 'bounce' | 'pulse' | 'spin' | 'float' | 'pop';

interface AnimatedIconProps {
  children: React.ReactNode;
  animation?: AnimationType;
  trigger?: 'hover' | 'scroll' | 'both';
  delay?: number;
  className?: string;
}

const scrollVariants = {
  bounce: {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: [0, -6, 0],
      transition: {
        opacity: { duration: 0.4, delay },
        y: { duration: 1.5, delay: delay + 0.3, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' },
      },
    }),
  },
  pulse: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (delay: number) => ({
      opacity: 1,
      scale: [1, 1.15, 1],
      transition: {
        opacity: { duration: 0.4, delay },
        scale: { duration: 2, delay: delay + 0.2, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' },
      },
    }),
  },
  spin: {
    hidden: { opacity: 0, rotate: -90 },
    visible: (delay: number) => ({
      opacity: 1,
      rotate: 0,
      transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  float: {
    hidden: { opacity: 0, y: 10 },
    visible: (delay: number) => ({
      opacity: 1,
      y: [0, -4, 0],
      transition: {
        opacity: { duration: 0.4, delay },
        y: { duration: 3, delay: delay + 0.1, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' },
      },
    }),
  },
  pop: {
    hidden: { opacity: 0, scale: 0 },
    visible: (delay: number) => ({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay, type: 'spring', stiffness: 300, damping: 15 },
    }),
  },
};

const hoverEffects = {
  bounce: { y: -4, transition: { type: 'spring', stiffness: 400 } },
  pulse: { scale: 1.2, transition: { type: 'spring', stiffness: 300 } },
  spin: { rotate: 180, transition: { duration: 0.4 } },
  float: { y: -6, scale: 1.05, transition: { type: 'spring', stiffness: 300 } },
  pop: { scale: 1.3, transition: { type: 'spring', stiffness: 400, damping: 10 } },
};

export function AnimatedIcon({
  children,
  animation = 'bounce',
  trigger = 'both',
  delay = 0,
  className = '',
}: AnimatedIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const shouldAnimate = trigger === 'scroll' || trigger === 'both';
  const shouldHover = trigger === 'hover' || trigger === 'both';

  return (
    <motion.div
      ref={ref}
      className={`inline-flex items-center justify-center ${className}`}
      variants={shouldAnimate ? scrollVariants[animation] : undefined}
      initial={shouldAnimate ? 'hidden' : undefined}
      animate={shouldAnimate && isInView ? 'visible' : undefined}
      custom={delay}
      whileHover={shouldHover ? hoverEffects[animation] : undefined}
    >
      {children}
    </motion.div>
  );
}
