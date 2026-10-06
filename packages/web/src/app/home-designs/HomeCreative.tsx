"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { IKVideo } from "imagekitio-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { CommunityMilestone } from "@/components/CommunityMilestone";
import { PageSurface } from "@/components/ui/PageSurface";
import { ToeProfile, VolumeArch } from "@/components/foot/FootGlyphs";

const Scene = dynamic(() => import("@/components/3d/Scene"), { ssr: false, loading: () => null });
const EtherField = dynamic(() => import("@/components/3d/EtherField"), { ssr: false, loading: () => null });

function HeroSection({ isReducedEffects }: { isReducedEffects: boolean }) {
  return (
    <section id="home-hero" aria-label="Interactive climbing shoe" className="relative h-[calc(100svh-3.5rem)] min-h-[360px] overflow-hidden">
      <div className="absolute inset-0">
        <EtherField className="absolute inset-0 h-full w-full" paused={isReducedEffects} speed={isReducedEffects ? 0 : 0.7} ambientColor="#171c27" accentColor="#ff5a3d" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 top-[10px] z-1"><Scene /></div>
      <Link href="#home-steps" aria-label="Scroll to homepage content" className="group absolute bottom-fluid-lg right-fluid-md z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-brand-base/70 text-brand-chalk transition-colors hover:bg-brand-surface focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-chalk md:right-fluid-xl"><ArrowDown aria-hidden="true" className="h-6 w-6 transition-transform duration-300 group-hover:translate-y-1 motion-reduce:transform-none" /></Link>
    </section>
  );
}

export default function HomeCreative() {
  const isReducedEffects = useReducedEffects();
  const countData = useQuery(api.users.getCount);

  return (
    <PageSurface className="relative antialiased selection:bg-brand-red selection:text-black">
      <HeroSection isReducedEffects={isReducedEffects} />
      <HowItWorksSection />
      <ToolsSection />
      <CommunityMilestone userCount={countData?.count} />
      <VideoSection />
    </PageSurface>
  );
}

function VideoSection() {
  return (
    <section aria-label="GripKicks video" className="border-t border-white/6 bg-black px-fluid-md py-fluid-3xl md:px-fluid-xl">
      <div className="mx-auto max-w-(--fluid-container-xl)">
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-full border border-white/6">
          <IKVideo
            path="vids/20261005_GripKicks_v02.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            transformation={[{ format: "auto", quality: "auto" }]}
            className="block h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { title: "Map your foot", copy: "Set your foot shape and volume.", glyph: <div className="w-20"><ToeProfile shape="egyptian" active height={48} /></div> },
    { title: "Rate your shoes", copy: "Record size, comfort, performance and durability.", glyph: <div className="w-20"><VolumeArch volume="medium" active height={48} /></div> },
    { title: "Compare fits", copy: "Check catalog matches and ratings from climbers with your foot profile.", glyph: <div className="w-20"><VolumeArch volume="high" active height={48} /></div> },
  ];

  return (
    <section id="home-steps" aria-labelledby="steps-title" className="scroll-mt-14 border-t border-white/6 bg-black px-fluid-md py-fluid-3xl md:px-fluid-xl">
      <div className="mx-auto max-w-(--fluid-container-xl)">
        <h2 id="steps-title" className="mb-fluid-2xl font-ball-pill text-fluid-5xl uppercase leading-none">How it works</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4">
          {steps.map((step, index) => (
            <article key={step.title} style={{ "--rise-delay": `${index * 50}ms` } as CSSProperties} className="lab-card lab-card-lift lab-rise flex min-h-60 flex-col justify-between gap-fluid-xl p-fluid-xl">
              <div className="flex items-start justify-between">
                <span className="lab-label">{String(index + 1).padStart(2, "0")}</span>
                {step.glyph}
              </div>
              <div>
                <h3 className="wrap-break-word font-ball-pill text-fluid-3xl leading-tight text-white">{step.title}</h3>
                <p className="mt-fluid-md max-w-xs font-mono text-sm leading-relaxed text-neutral-400">{step.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolsSection() {
  const tools = [
    { title: "Foot Lab", copy: "Set your foot shape and volume.", href: "/footlab" },
    { title: "Sanctuary", copy: "Your shoes, sizes and fit ratings.", href: "/stash" },
    { title: "Matcher", copy: "Compare shoe matches and community ratings.", href: "/matcher" },
    { title: "Sole Mate", copy: "Shoes rated by climbers with your foot profile.", href: "/matcher?tab=mate" },
  ];

  return (
    <section id="home-tools" aria-labelledby="tools-title" className="scroll-mt-14 border-t border-white/6 bg-black px-fluid-md py-fluid-3xl md:px-fluid-xl">
      <div className="mx-auto max-w-(--fluid-container-xl)">
        <div className="mb-fluid-xl flex items-center gap-fluid-lg">
          <h2 id="tools-title" className="font-ball-pill text-fluid-5xl uppercase leading-none">Tools</h2>
          <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool, index) => (
            <Link key={tool.href} href={tool.href} style={{ "--rise-delay": `${index * 50}ms` } as CSSProperties} className="lab-card lab-card-lift lab-rise group flex min-h-56 min-w-0 flex-col justify-between gap-fluid-xl p-fluid-xl focus-visible:outline-brand-chalk">
              <ArrowUpRight aria-hidden="true" className="h-8 w-8 shrink-0 self-end text-brand-chalk transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-focus-visible:-translate-y-1 group-focus-visible:translate-x-1 motion-reduce:transform-none" />
              <div>
                <h3 className="wrap-break-word font-ball-pill text-fluid-4xl leading-none text-white">{tool.title}</h3>
                <p className="mt-fluid-md max-w-sm font-mono text-sm leading-relaxed text-neutral-400">{tool.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
