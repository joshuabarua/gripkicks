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

          <p
            className="lab-rise font-mono text-fluid-xl text-brand-putty/70 max-w-2xl mx-auto leading-relaxed text-center"
            style={riseDelay(1)}
          >
            Hi there!
          </p>
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
                <p>My name&apos;s Josh. I&apos;m a climber, developer and guy with weird shaped feet.</p>
                <p>Through my years of climbing, every shoe has felt like it could probably fit alittle better. Call it copium, but I believe shoes really affect how we move on the wall. I&apos;ve had enough heel hooks rip my shoe off and enough big, puffy air gaps in my toe box.</p>
                <p>So, I built this to find my shoe, my Cinderella slipper, if you will. One day I&apos;ll find the perfect pair. Maybe, I&apos;ll help some other climbers find theirs too.</p>
                <p>The site is free because it depends on the climbing community. The more the merrier, and I&apos;ll keep it free. I don&apos;t sell your data, I don&apos;t keep anything I don&apos;t need, and I don&apos;t have a foot fetish.</p>

                <p>If you have any ideas you think I should include, I&apos;m open. Shoot me a message <a href="mailto:gripkicksofficial@gmail.com">here</a></p>
                <p>Anyway, enjoy the site. I hope it helps. Mobile apps are coming soon.</p>

                <p>— Josh</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
