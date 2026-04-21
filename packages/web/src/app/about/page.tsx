'use client';

import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="relative px-6 md:px-12 lg:px-16 pt-32 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <h1 className="font-tanker text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 text-white">
              About
            </h1>
          </motion.div>
          <p className="font-sora text-sm text-neutral-500 max-w-xl">
            Layout test. No marketing copy.
          </p>
        </div>
      </section>
    </main>
  );
}
