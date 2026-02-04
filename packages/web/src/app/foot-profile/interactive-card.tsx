'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export default function InteractiveCard({ 
  children, 
  isSelected, 
  onClick, 
  className 
}: InteractiveCardProps) {
  return (
    <motion.div
      className={cn(
        "relative cursor-pointer rounded-2xl p-6 transition-all duration-300",
        "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm",
        "border border-white/20 hover:border-white/40",
        "hover:shadow-xl hover:shadow-white/10",
        isSelected && "ring-2 ring-white ring-offset-2 ring-offset-background",
        className
      )}
      onClick={onClick}
      whileHover={{ 
        scale: 1.02,
        y: -2
      }}
      whileTap={{ 
        scale: 0.98 
      }}
      layout
    >
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
