'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AmbientField from '@/components/brand/AmbientField';
import WordmarkWatermark from '@/components/brand/WordmarkWatermark';

const ChromaticGlassMark = dynamic(
  () => import('@/components/brand/ChromaticGlassMark'),
  { ssr: false, loading: () => null },
);

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-brand-chalk overflow-x-hidden selection:bg-brand-red selection:text-black">
      <section className="relative flex min-h-[80vh] items-center px-6 md:px-12 lg:px-16 pt-32 pb-24 overflow-hidden">
        <AmbientField intensity={0.3} />
        <WordmarkWatermark lines={['ABOUT']} align="right" />

        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-10"
          >
            <ChromaticGlassMark size={220} />
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.1 }}>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-brand-putty/40 mb-4 text-center">
              The mission
            </p>
            <h1 className="font-ball-pill text-6xl md:text-8xl lg:text-9xl leading-[0.85] mb-8 text-brand-chalk text-center">
              Built for<br /><span className="text-brand-red">climbers.</span>
            </h1>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sora text-lg md:text-xl text-brand-putty/70 max-w-2xl mx-auto leading-relaxed text-center"
          >
            GripKicks is a shoe wall for climbers &mdash; track every pair, rate the
            fit the way you actually feel it, and let the data surface shoes matched
            to your foot shape and style.
          </motion.p>
        </div>
      </section>
    </main>
  );
}
