'use client';

import { motion } from 'framer-motion';

interface AdditionalInfoProps {
  size?: string | undefined;
  condition?: string | undefined;
  purchaseDate?: string | undefined;
}

export default function AdditionalInfo({ size, condition, purchaseDate }: AdditionalInfoProps) {
  const hasAnyInfo = size || condition || purchaseDate;

  if (!hasAnyInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="border-t border-neutral-800 pt-4 space-y-2"
    >
      {size && (
        <div className="flex justify-between">
          <span className="text-neutral-400 font-mono text-sm">Size</span>
          <span className="font-medium text-white font-mono text-sm">{size}</span>
        </div>
      )}
      {condition && (
        <div className="flex justify-between">
          <span className="text-neutral-400 font-mono text-sm">Condition</span>
          <span className="font-medium capitalize text-white font-mono text-sm">{condition}</span>
        </div>
      )}
      {purchaseDate && (
        <div className="flex justify-between">
          <span className="text-neutral-400 font-mono text-sm">Purchase Date</span>
          <span className="font-medium text-white font-mono text-sm">{new Date(purchaseDate).toLocaleDateString()}</span>
        </div>
      )}
    </motion.div>
  );
}
