'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
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
      <section className="relative flex min-h-[55vh] items-center px-6 md:px-12 lg:px-16 pt-32 pb-24 overflow-hidden">
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
            className="font-mono text-lg md:text-xl text-brand-putty/70 max-w-2xl mx-auto leading-relaxed text-center"
          >
            Hi there!
          </motion.p>
        </div>
      </section>

      <section className="bg-brand-surface px-6 py-24 md:px-12 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="rounded-3xl border border-white/6 bg-black p-8 md:p-12"
          >
            <div className="flex flex-col gap-8 sm:flex-row sm:items-stretch">
              <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:h-auto sm:w-60">
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? ""}/gripkicks/imgs/web_assets/josh.jpg`}
                  alt="Josh"
                  fill
                  sizes="(min-width: 640px) 240px, 100vw"
                  className="object-contain"
                />
              </div>
              <div className="space-y-6 font-mono text-base md:text-lg text-brand-putty/80 leading-relaxed">
              <p>My name&apos;s Josh. I&apos;m a climber, developer and guy with weird shaped feet.</p>
              <p>Over all my years of climbing, every shoe has felt like it should fit better. Call it an obsession or cope, but I believe shoes really affect how we move on the wall. I&apos;ve had enough heel hooks rip my shoe off and enough big, puffy air gaps in my toe box.</p>
              <p>So, I built this to find my Cinderella shoe. One day I&apos;ll find the perfect pair. Maybe, just maybe, I&apos;ll help some other climbers find theirs too.</p>
              <p>The site is free because it depends on the climbing community. The more the merrier, and I&apos;ll keep it free. I don&apos;t sell your data, I don&apos;t keep anything I don&apos;t need, and I don&apos;t have a foot fetish.</p>
              <p>Anyway, enjoy the site. I hope it helps. Mobile apps are coming soon.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
