import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { PageSurface } from '@/components/ui/PageSurface';
import { LabHeader } from '@/components/ui/LabHeader';
import { riseDelay } from '@/lib/motion';

const CONTACT_EMAIL = 'gripkicksofficial@gmail.com';

export default function AboutPage() {
  return (
    <PageSurface>
      <div className="lab-container">
        <LabHeader title="About" />

        <article
          className="lab-card lab-rise grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
          style={riseDelay(1)}
        >
          <div className="relative aspect-[4/5] border-b border-white/6 md:aspect-auto md:min-h-[30rem] md:border-b-0 md:border-r">
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? ''}/gripkicks/imgs/web_assets/josh.jpg`}
              alt="Josh sitting on a crash mat in a bouldering gym"
              fill
              loading="eager"
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover object-[50%_30%]"
            />
          </div>

          <div className="flex flex-col justify-center gap-fluid-md p-fluid-xl font-mono text-fluid-base leading-relaxed text-brand-putty">
            <p className="text-fluid-lg text-brand-chalk">I&apos;m Josh, a climber and developer with awkward-shaped feet.</p>
            <p>Every shoe I&apos;ve owned could have fit a little better: heels slipping off on hooks, air gaps in the toe box. GripKicks is my attempt to find the right pair, and to help other climbers find theirs.</p>
            <p>It&apos;s free and stays free. I don&apos;t sell your data or keep anything I don&apos;t need.</p>
            <p>— Josh</p>

            <div className="mt-fluid-sm flex flex-wrap items-center gap-x-fluid-md gap-y-3 border-t border-white/6 pt-fluid-md">
              <a href={`mailto:${CONTACT_EMAIL}`} className="lab-button-ghost group">
                Send feedback
                <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
              </a>
              <span className="select-all text-sm text-brand-putty/70">{CONTACT_EMAIL}</span>
            </div>
          </div>
        </article>
      </div>
    </PageSurface>
  );
}
