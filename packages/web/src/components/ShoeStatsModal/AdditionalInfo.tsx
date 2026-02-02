'use client';

import { motion } from 'framer-motion';

interface AdditionalInfoProps {
  size?: string;
  condition?: string;
  purchaseDate?: string;
}

export default function AdditionalInfo({ size, condition, purchaseDate }: AdditionalInfoProps) {
  const hasAnyInfo = size || condition || purchaseDate;
  
  if (!hasAnyInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="border-t border-white/20 pt-4 space-y-2"
    >
      {size && (
        <div className="flex justify-between">
          <span className="text-white/90">Size</span>
          <span className="font-medium">{size}</span>
        </div>
      )}
      {condition && (
        <div className="flex justify-between">
          <span className="text-white/90">Condition</span>
          <span className="font-medium capitalize">{condition}</span>
        </div>
      )}
      {purchaseDate && (
        <div className="flex justify-between">
          <span className="text-white/90">Purchase Date</span>
          <span className="font-medium">{new Date(purchaseDate).toLocaleDateString()}</span>
        </div>
      )}
    </motion.div>
  );
}
