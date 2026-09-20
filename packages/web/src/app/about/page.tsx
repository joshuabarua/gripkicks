'use client';

import { motion } from 'framer-motion';
import LiquidGlassBackdrop from '@/components/brand/LiquidGlassBackdrop';
import WordmarkWatermark from '@/components/brand/WordmarkWatermark';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-brand-chalk overflow-x-hidden selection:bg-brand-red selection:text-black">
      <section className="relative flex min-h-[90vh] items-center px-6 md:px-12 lg:px-16 pt-32 pb-24 overflow-hidden">
        <LiquidGlassBackdrop align="center" />
        <WordmarkWatermark lines={['ABOUT']} align="right" />

        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.1 }}>
            <h1 className="font-ball-pill text-6xl md:text-8xl lg:text-9xl leading-[0.85] mb-8 text-brand-chalk text-center">
              ABOUT
            </h1>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sora text-lg md:text-xl text-brand-putty/70 max-w-2xl mx-auto leading-relaxed text-center"
          >
            GripKicks helps you find climbing shoes that fit. Log your pairs,
            rate the fit, and get matches based on your foot shape.
          </motion.p>
        </div>
      </section>
    </main>
  );
}
