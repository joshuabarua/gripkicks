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
      className="mt-fluid-md grid w-full max-w-xl grid-cols-3 overflow-hidden rounded-lg border border-white/20 bg-brand-surface"
    >
      <div className="border-r border-white/20 px-3 py-fluid-sm sm:px-fluid-md">
        <span className="font-ball-pill text-fluid-2xl text-brand-chalk">{totalShoes}</span>
        <span className="ml-2 font-mono text-xs text-brand-putty">shoes</span>
      </div>
      <div className="border-r border-white/20 px-3 py-fluid-sm sm:px-fluid-md">
        <span className="font-ball-pill text-fluid-2xl text-brand-chalk">{favouriteCount}</span>
        <span className="ml-2 font-mono text-xs text-brand-putty">favorites</span>
      </div>
      <div className="px-3 py-fluid-sm sm:px-fluid-md">
        <span className="font-ball-pill text-fluid-2xl text-brand-chalk">{brandCount}</span>
        <span className="ml-2 font-mono text-xs text-brand-putty">brands</span>
      </div>
    </motion.div>
  );
}
