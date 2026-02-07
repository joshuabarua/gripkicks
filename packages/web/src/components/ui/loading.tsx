"use client";

import { motion } from 'framer-motion';

interface LoadingProps {
  text?: string;
  showProgress?: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'full';
}

export function Loading({
  text = 'Loading',
  showProgress = false,
  progress = 0,
  size = 'md',
  variant = 'default'
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-16',
    md: 'w-24',
    lg: 'w-32'
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  const textSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs'
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2">
        <div className={`${sizeClasses[size]} h-[2px] bg-neutral-800 rounded-full overflow-hidden`}>
          <motion.div
            className="h-full bg-orange-500"
            initial={{ width: '0%' }}
            animate={{ width: showProgress ? `${progress}%` : ['0%', '100%', '0%'] }}
            transition={showProgress ? { duration: 0.15 } : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-16 h-16 border-l-2 border-t-2 border-orange-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <div className="flex flex-col items-center gap-3">
            <span className="font-mono text-[10px] text-orange-500 tracking-[0.3em]">[{text.toUpperCase()}]</span>
            <div className={`${sizeClasses[size]} h-[2px] bg-neutral-800 rounded-full overflow-hidden`}>
              <motion.div
                className="h-full bg-orange-500"
                initial={{ width: '0%' }}
                animate={{ width: showProgress ? `${progress}%` : ['0%', '100%', '0%'] }}
                transition={showProgress ? { duration: 0.15 } : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${dotSizes[size]} bg-orange-500 rounded-full`}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <span className={`font-mono ${textSizes[size]} text-neutral-600 tracking-[0.2em]`}>[{text.toUpperCase()}]</span>
      {showProgress && (
        <div className={`${sizeClasses[size]} h-[2px] bg-neutral-800 rounded-full overflow-hidden`}>
          <motion.div
            className="h-full bg-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
      )}
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      className={`${sizes[size]} border-2 border-neutral-800 border-t-orange-500 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );
}

export function LoadingBar({
  progress,
  showLabel = false,
  size = 'md'
}: {
  progress?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-16 h-[2px]',
    md: 'w-24 h-[2px]',
    lg: 'w-32 h-1'
  };

  const isIndeterminate = progress === undefined;

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="font-mono text-[10px] text-neutral-600">
          {isIndeterminate ? '[...]' : `[${Math.round(progress)}%]`}
        </span>
      )}
      <div className={`${sizeClasses[size]} bg-neutral-800 rounded-full overflow-hidden`}>
        <motion.div
          className="h-full bg-orange-500"
          initial={{ width: '0%', x: 0 }}
          animate={isIndeterminate
            ? { x: ['-100%', '200%'] }
            : { width: `${progress}%` }
          }
          transition={isIndeterminate
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.15 }
          }
          style={isIndeterminate ? { width: '50%' } : undefined}
        />
      </div>
    </div>
  );
}

export function FullPageLoading({ text = 'Loading' }: { text?: string }) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-black">
      <div className="relative flex flex-col items-center">
        <motion.div
          className="absolute -top-8 -left-8 w-12 h-12 border-l-2 border-t-2 border-orange-500/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        />
        <motion.div
          className="absolute -bottom-8 -right-8 w-12 h-12 border-r-2 border-b-2 border-orange-500/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        />

        <div className="flex flex-col items-center gap-4 p-8">
          <div className="font-tanker text-2xl text-white">
            GRIP <span className="text-orange-500">KICKS</span>
          </div>

          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-orange-500 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>

          <span className="font-mono text-[10px] text-neutral-600 tracking-[0.2em]">[{text.toUpperCase()}]</span>

          <div className="w-24 h-[2px] bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-orange-500"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: '50%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
