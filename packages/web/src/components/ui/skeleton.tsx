"use client";

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  lines?: number;
}

export function Skeleton({ 
  className = '', 
  variant = 'default', 
  width, 
  height,
  lines = 1 
}: SkeletonProps) {
  const baseClasses = 'bg-neutral-800 rounded overflow-hidden';
  
  const variantClasses = {
    default: 'rounded-md',
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style = {
    width: width || (variant === 'circular' ? '40px' : undefined),
    height: height || (variant === 'circular' ? '40px' : undefined)
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{
              width: i === lines - 1 ? '60%' : '100%',
              height: '1rem'
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

// Shoe card skeleton for the stash
export function ShoeCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex gap-3">
        <Skeleton variant="rectangular" width="80px" height="80px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    </div>
  );
}

// User profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width="96px" height="96px" />
        <div className="space-y-2">
          <Skeleton variant="text" width="120px" />
          <Skeleton variant="text" width="200px" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" width="100px" />
        <Skeleton variant="rectangular" height="40px" />
        <Skeleton variant="text" width="100px" />
        <Skeleton variant="rectangular" height="40px" />
      </div>
    </div>
  );
}

// Stats strip skeleton
export function StatsStripSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton variant="text" width="60px" className="mx-auto" />
          <Skeleton variant="text" width="80px" className="mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Filter skeleton for advanced filters
export function FilterSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton variant="text" width="60px" />
          <Skeleton variant="rectangular" height="40px" />
        </div>
        <div className="space-y-3">
          <Skeleton variant="text" width="60px" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" width="60px" height="32px" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" width="200px" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton variant="text" width="80px" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} variant="rectangular" width="50px" height="32px" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
