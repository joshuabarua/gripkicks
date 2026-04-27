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
      <div className="bg-black/60 border border-white/[0.06] px-fluid-md py-fluid-sm">
        <span className="font-ball-pill text-fluid-2xl text-brand-red">{totalShoes}</span>
        <span className="text-brand-putty/40 font-sora text-xs ml-2">shoes</span>
      </div>
      <div className="bg-black/60 border border-white/[0.06] px-fluid-md py-fluid-sm">
        <span className="font-ball-pill text-fluid-2xl text-brand-red">{favouriteCount}</span>
        <span className="text-brand-putty/40 font-sora text-xs ml-2">favorites</span>
      </div>
      <div className="bg-black/60 border border-white/[0.06] px-fluid-md py-fluid-sm">
        <span className="font-ball-pill text-fluid-2xl text-brand-red">{brandCount}</span>
        <span className="text-brand-putty/40 font-sora text-xs ml-2">brands</span>
      </div>
    </motion.div>
  );
}
