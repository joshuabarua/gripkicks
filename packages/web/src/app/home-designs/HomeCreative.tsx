"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useSession } from "@/lib/auth";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { CommunityMilestone } from "@/components/CommunityMilestone";
import { PageSurface } from "@/components/ui/PageSurface";

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const Scene = dynamic(() => import("@/components/3d/Scene"), { ssr: false, loading: () => null });
const EtherField = dynamic(() => import("@/components/3d/EtherField"), { ssr: false, loading: () => null });

function HeroSection({ isReducedEffects }: { isReducedEffects: boolean }) {
  return (
    <section id="home-hero" aria-label="Interactive climbing shoe" className="relative h-[calc(100svh-3.5rem)] min-h-[360px] overflow-hidden">
      <div className="absolute inset-0">
        <EtherField className="absolute inset-0 h-full w-full" paused={isReducedEffects} speed={isReducedEffects ? 0 : 0.7} ambientColor="#171c27" accentColor="#ff5a3d" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 top-[10px] z-[1]"><Scene /></div>
      <Link href="#home-intro" aria-label="Scroll to homepage content" className="group absolute bottom-fluid-lg right-fluid-md z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-brand-base/70 text-brand-chalk transition-colors hover:bg-brand-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-chalk md:right-fluid-xl"><ArrowDown aria-hidden="true" className="h-6 w-6 transition-transform duration-300 group-hover:translate-y-1 motion-reduce:transform-none" /></Link>
    </section>
  );
}

export default function HomeCreative() {
  const { data: session, isPending } = useSession();
  const hasHydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const isReducedEffects = useReducedEffects();
  const countData = useQuery(api.users.getCount);
  const isAuthenticated = !!session?.user;

  return (
    <PageSurface className="relative antialiased selection:bg-brand-red selection:text-black">
      <HeroSection isReducedEffects={isReducedEffects} />
      <section id="home-intro" aria-labelledby="home-title" className="relative scroll-mt-14 overflow-hidden border-y border-white/30 bg-brand-surface px-fluid-md py-fluid-3xl text-brand-chalk md:px-fluid-xl">
        <div aria-hidden="true" className="grain-overlay !absolute !z-0" />
        <div className="relative mx-auto grid max-w-fluid-xl items-end gap-fluid-xl md:grid-cols-[1.2fr_1fr]">
          <h1 id="home-title" className="font-ball-pill text-[clamp(2.5rem,6vw,6.5rem)] leading-none">GRIPKICKS</h1>
          <div className="border-l-4 border-brand-chalk/30 pl-fluid-lg">
            <p className="font-sora text-fluid-2xl font-semibold leading-snug">Climbing shoes, sizes and fit ratings.</p>
            <p className="mt-fluid-md max-w-md font-sora text-base leading-relaxed">Set your foot profile. Log the shoes you climb in. Compare fit and community ratings.</p>
          </div>
        </div>
      </section>
      <HowItWorksSection />
      <ToolsSection />
      <CommunityMilestone userCount={countData?.count} />
      <section aria-labelledby="account-title" className="relative overflow-hidden border-t border-white/40 bg-brand-surface px-fluid-md py-fluid-3xl text-brand-chalk md:px-fluid-xl">
        <div aria-hidden="true" className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[3rem] border-brand-red/70" />
        <div className="relative mx-auto flex max-w-fluid-xl flex-wrap items-end justify-between gap-fluid-xl">
          <h2 id="account-title" className="font-ball-pill text-[clamp(2.5rem,6vw,6.5rem)] leading-none">{hasHydrated && isAuthenticated ? "YOUR DASHBOARD" : "GET STARTED"}</h2>
          {!hasHydrated || isPending ? <p role="status" className="font-sora text-sm">Loading account…</p> : <Link href={isAuthenticated ? "/dashboard" : "/auth/signup"} className="group inline-flex min-h-14 shrink-0 items-center justify-center gap-5 rounded-full border border-brand-chalk/60 bg-brand-chalk px-7 py-4 font-sora text-base font-semibold text-brand-base transition-colors hover:bg-brand-red hover:text-black focus-visible:outline-brand-chalk">{isAuthenticated ? "Open dashboard" : "Create account"}<ArrowUpRight aria-hidden="true" className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transform-none" /></Link>}
        </div>
      </section>
    </PageSurface>
  );
}

function HowItWorksSection() {
  const steps = [
    { title: "Map your foot", copy: "Set your foot shape and volume." },
    { title: "Rate your shoes", copy: "Record size, comfort, performance and durability." },
    { title: "Compare fits", copy: "Check catalog matches and ratings from climbers with your foot profile." },
  ];

  return (
    <section aria-labelledby="steps-title" className="px-fluid-md py-fluid-3xl md:px-fluid-xl">
      <div className="mx-auto max-w-fluid-xl">
        <h2 id="steps-title" className="mb-fluid-2xl font-ball-pill text-fluid-5xl leading-none">How it works</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-px overflow-hidden border border-white/30 bg-brand-chalk/30">
          {steps.map((step) => (
            <article key={step.title} className="flex min-h-[clamp(12rem,20vw,17rem)] flex-col justify-between gap-fluid-lg bg-brand-base p-fluid-xl">
              <h3 className="break-words font-ball-pill text-fluid-3xl leading-tight">{step.title}</h3>
              <p className="max-w-xs font-sora text-base leading-relaxed text-brand-putty">{step.copy}</p>
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
    <section id="home-tools" aria-labelledby="tools-title" className="scroll-mt-14 border-y border-white/40 bg-brand-surface px-fluid-md py-fluid-3xl md:px-fluid-xl">
      <div className="mx-auto max-w-fluid-xl">
        <div className="mb-fluid-xl flex items-center gap-fluid-lg">
          <h2 id="tools-title" className="font-ball-pill text-fluid-5xl leading-none">Tools</h2>
          <span aria-hidden="true" className="h-px flex-1 bg-brand-chalk/60" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(28rem,calc(50%_-_1px))),1fr))] gap-px overflow-hidden border border-white/40 bg-brand-chalk/40">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group relative flex min-h-[clamp(14rem,22vw,22rem)] min-w-0 flex-col justify-between gap-fluid-xl overflow-hidden bg-brand-base p-fluid-xl transition-colors duration-500 hover:bg-brand-soft-surface focus-visible:bg-brand-soft-surface focus-visible:outline-brand-chalk focus-visible:-outline-offset-4">
              <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-1.5 origin-bottom scale-y-0 bg-brand-red transition-transform duration-500 group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none" />
              <ArrowUpRight aria-hidden="true" className="h-8 w-8 shrink-0 self-end text-brand-chalk transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-focus-visible:-translate-y-1 group-focus-visible:translate-x-1 motion-reduce:transform-none" />
              <div className="transition-transform duration-500 group-hover:translate-x-2 group-focus-visible:translate-x-2 motion-reduce:transform-none">
                <h3 className="break-words font-ball-pill text-fluid-5xl leading-none">{tool.title}</h3>
                <p className="mt-fluid-md max-w-sm font-sora text-base leading-relaxed text-brand-putty">{tool.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
