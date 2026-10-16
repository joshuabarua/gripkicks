"use client";

import { useCallback, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowDown, ArrowUpRight, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useProgress } from "@react-three/drei";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { CommunityMilestone } from "@/components/CommunityMilestone";
import { supportsWebGL } from "@/components/3d/webgl-utils";
import { PageSurface } from "@/components/ui/PageSurface";
import { CompareArrows, ScoreTag, ToeProfile } from "@/components/foot/FootGlyphs";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});
const EtherField = dynamic(() => import("@/components/3d/EtherField"), { ssr: false, loading: () => null });

const subscribeWebgl = () => () => undefined;
const getServerWebglSnapshot = () => null;

function HeroLoadCover({ ready }: { ready: boolean }) {
  const { progress } = useProgress();
  const [maxProgress, setMaxProgress] = useState(0);
  if (progress > maxProgress) setMaxProgress(progress);
  const fill = Math.min(100, Math.max(0, maxProgress));
  return (
    <div
      role="status"
      aria-label="Loading shoe"
      aria-hidden={ready}
      className={`pointer-events-none absolute inset-0 z-5 flex items-center justify-center bg-black transition-opacity duration-700 ease-out motion-reduce:transition-none ${ready ? "opacity-0" : "opacity-100"}`}
    >
      <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/40">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 bg-brand-red transition-[height] duration-500 ease-out motion-reduce:transition-none"
          style={{ height: `${fill}%` }}
        />
        <span className="lab-label relative mix-blend-difference">Loading</span>
      </div>
    </div>
  );
}

function HeroSection({ isReducedEffects }: { isReducedEffects: boolean }) {
  const webgl = useSyncExternalStore<boolean | null>(subscribeWebgl, supportsWebGL, getServerWebglSnapshot);
  const [sceneReady, setSceneReady] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  const ready = sceneReady || webgl === false;

  return (
    <section id="home-hero" aria-label="Interactive climbing shoe" aria-busy={!ready} className="relative h-[calc(100svh-3.5rem)] min-h-[360px] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,#171c27_0%,transparent_65%)]">
        {!isReducedEffects && webgl && (
          <EtherField className="absolute inset-0 h-full w-full" speed={0.7} ambientColor="#171c27" accentColor="#ff5a3d" />
        )}
      </div>
      {webgl && (
        <div className="absolute bottom-0 left-0 right-0 top-[10px] z-1">
          <Scene onReady={handleSceneReady} />
        </div>
      )}
      <HeroLoadCover ready={ready} />
      <Link href="#home-steps" aria-label="Scroll to homepage content" className="group absolute bottom-fluid-lg right-fluid-md z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-brand-base/70 text-brand-chalk transition-colors hover:bg-brand-surface focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-chalk md:right-fluid-xl"><ArrowDown aria-hidden="true" className="h-6 w-6 transition-transform duration-300 group-hover:translate-y-1 motion-reduce:transform-none" /></Link>
    </section>
  );
}

export default function HomeCreative() {
  const isReducedEffects = useReducedEffects();
  const countData = useQuery(api.users.getCount);

  const sections = [
    <HowItWorksSection key="steps" />,
    <ToolsSection key="tools" />,
    <VideoSection key="video" />,
    <CommunityMilestone key="milestones" userCount={countData?.count} />,
  ];

  return (
    <PageSurface className="relative antialiased selection:bg-brand-red selection:text-black">
      <div aria-hidden="true" className="grain-overlay-animated" />
      <HeroSection isReducedEffects={isReducedEffects} />
      {sections.map((section, i) => (
        <motion.div
          key={i}
          initial={isReducedEffects ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
        >
          {section}
        </motion.div>
      ))}
    </PageSurface>
  );
}

function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (hasEnded) video.currentTime = 0;
    if (video.paused) void video.play();
    else video.pause();
  };

  return (
    <section aria-label="GripKicks video" className="border-t border-white/6 bg-black px-fluid-md py-fluid-3xl md:px-fluid-xl">
      <div className="mx-auto max-w-(--fluid-container-xl)">
        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[3rem] border border-white/6">
          <video
            ref={videoRef}
            src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/gripkicks/vids/20261005_GripKicks_v02.mp4`}
            playsInline
            preload="metadata"
            controlsList="nodownload"
            onClick={togglePlay}
            onPlay={() => { setIsPlaying(true); setHasEnded(false); }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => { setIsPlaying(false); setHasEnded(true); }}
            className="block h-auto w-full cursor-pointer"
          />
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={hasEnded ? "Play video again" : "Play video"}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand-chalk"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-red text-black shadow-lg shadow-brand-red/30">
                {hasEnded ? <RotateCcw aria-hidden="true" className="h-7 w-7" /> : <Play aria-hidden="true" className="h-7 w-7 fill-current" />}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-brand-base/70 text-brand-chalk transition-colors hover:bg-brand-surface focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-chalk"
          >
            {isMuted ? <VolumeX aria-hidden="true" className="h-5 w-5" /> : <Volume2 aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { title: "Map your foot", copy: "Set your foot shape and volume.", glyph: <div className="w-20"><ToeProfile shape="egyptian" active height={48} /></div> },
    { title: "Rate your shoes", copy: "Record size, comfort, performance and durability.", glyph: <div className="w-20"><ScoreTag active height={48} /></div> },
    { title: "Compare fits", copy: "Check catalog matches and ratings from climbers with your foot profile.", glyph: <div className="w-20"><CompareArrows active height={48} /></div> },
  ];

  return (
    <section id="home-steps" aria-labelledby="steps-title" className="scroll-mt-14 border-t border-white/6 bg-black px-fluid-md py-fluid-3xl md:px-fluid-xl">
      <div className="mx-auto max-w-(--fluid-container-xl)">
        <h2 id="steps-title" className="mb-fluid-2xl font-ball-pill text-fluid-5xl uppercase leading-none">How it works</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4">
          {steps.map((step, index) => (
            <article key={step.title} style={{ "--rise-delay": `${index * 50}ms` } as CSSProperties} className="lab-card lab-card-lift lab-rise flex min-h-60 flex-col justify-center gap-fluid-xl p-fluid-xl">
              <div className="flex items-center gap-fluid-lg">
                <div className="shrink-0">{step.glyph}</div>
                <div className="min-w-0">
                  <h3 className="wrap-break-word font-ball-pill text-fluid-3xl leading-tight text-white">{step.title}</h3>
                  <p className="mt-fluid-md font-mono text-sm leading-relaxed text-neutral-400">{step.copy}</p>
                </div>
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
              <div className="flex items-center justify-between gap-4">
                <h3 className="wrap-break-word font-ball-pill text-fluid-4xl leading-none text-white">{tool.title}</h3>
                <ArrowUpRight aria-hidden="true" className="h-8 w-8 shrink-0 text-brand-chalk transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-focus-visible:-translate-y-1 group-focus-visible:translate-x-1 motion-reduce:transform-none" />
              </div>
              <p className="max-w-sm font-mono text-sm leading-relaxed text-neutral-400">{tool.copy}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
