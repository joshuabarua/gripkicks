import { motion } from 'framer-motion';

interface StatsStripProps {
  totalShoes: number;
  favouriteCount: number;
  brandCount: number;
}

export function StatsStrip({ totalShoes, favouriteCount, brandCount }: StatsStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex gap-fluid-md mt-fluid-md flex-wrap"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-fluid-md py-fluid-sm">
        <span className="font-tanker text-fluid-2xl text-orange-500">{totalShoes}</span>
        <span className="text-neutral-500 font-sora text-xs ml-2">shoes</span>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-fluid-md py-fluid-sm">
        <span className="font-tanker text-fluid-2xl text-orange-500">{favouriteCount}</span>
        <span className="text-neutral-500 font-sora text-xs ml-2">favorites</span>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-fluid-md py-fluid-sm">
        <span className="font-tanker text-fluid-2xl text-orange-500">{brandCount}</span>
        <span className="text-neutral-500 font-sora text-xs ml-2">brands</span>
      </div>
    </motion.div>
  );
}
