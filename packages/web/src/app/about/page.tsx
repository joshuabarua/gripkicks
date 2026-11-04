'use client';

import Image from 'next/image';
import LiquidGlassBackdrop from '@/components/brand/LiquidGlassBackdrop';
import WordmarkWatermark from '@/components/brand/WordmarkWatermark';
import { riseDelay } from '@/lib/motion';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-brand-chalk overflow-x-hidden selection:bg-brand-red selection:text-black">
      <section className="relative flex min-h-[55vh] items-center px-fluid-lg md:px-fluid-xl pt-fluid-3xl pb-fluid-3xl overflow-hidden">
        <LiquidGlassBackdrop align="center" />
        <WordmarkWatermark lines={['ABOUT']} align="right" />

        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <div className="lab-rise" style={riseDelay(0)}>
            <h1 className="font-ball-pill text-fluid-9xl leading-[0.85] mb-8 text-brand-chalk text-center">
              ABOUT
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-brand-surface px-fluid-lg py-fluid-3xl md:px-fluid-xl">
        <div className="max-w-6xl mx-auto">
          <div
            className="lab-rise rounded-3xl border border-white/6 bg-black p-fluid-xl"
            style={riseDelay(2)}
          >
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:aspect-[3/4] sm:h-auto sm:w-1/2">
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? ""}/gripkicks/imgs/web_assets/josh.jpg`}
                  alt="Josh"
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-contain"
                />
              </div>
              <div className="space-y-6 font-mono text-fluid-lg text-brand-putty/80 leading-relaxed">
                <p>I&apos;m Josh, a climber and developer with awkward-shaped feet.</p>
                <p>Every shoe I&apos;ve owned could have fit a little better: heels slipping off on hooks, air gaps in the toe box. GripKicks is my attempt to find the right pair, and to help other climbers find theirs.</p>
                <p>It&apos;s free and stays free. I don&apos;t sell your data or keep anything I don&apos;t need.</p>
                <p>Ideas or feedback: <a href="mailto:gripkicksofficial@gmail.com" className="text-brand-chalk underline decoration-brand-red underline-offset-4 transition-colors duration-500 hover:decoration-brand-chalk">gripkicksofficial@gmail.com</a></p>

                <p>— Josh</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
