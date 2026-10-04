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
        <EtherField className="absolute inset-0 h-full w-full" paused={isReducedEffects} speed={isReducedEffects ? 0 : 0.7} ambientColor="#0a0d18" accentColor="#ff5a3d" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 top-[10px] z-[1]"><Scene /></div>
      <Link href="#home-tools" className="absolute bottom-fluid-lg right-fluid-md z-10 inline-flex min-h-11 items-center gap-3 rounded-lg border border-brand-chalk bg-brand-chalk px-5 py-3 font-sora text-sm font-semibold text-brand-base md:right-fluid-xl focus-visible:outline-brand-chalk">Explore tools<ArrowDown aria-hidden="true" className="h-4 w-4" /></Link>
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
      <section id="home-tools" className="scroll-mt-14 border-y border-brand-chalk bg-brand-chalk px-fluid-md py-fluid-2xl text-brand-base md:px-fluid-xl">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-fluid-lg md:flex-row md:items-center">
          <div>
            <h1 className="font-ball-pill text-fluid-4xl leading-none">GripKicks</h1>
            <p className="mt-fluid-md font-sora text-base leading-relaxed">Climbing shoes, sizes and fit ratings.</p>
          </div>
          {!hasHydrated || isPending ? <p role="status" className="font-sora text-sm">Loading account…</p> : <Link href={isAuthenticated ? "/dashboard" : "/auth/signup"} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-lg border border-brand-base bg-brand-red px-6 py-3 font-sora text-sm font-semibold text-black hover:bg-brand-red/90 focus-visible:outline-brand-base">{isAuthenticated ? "Open dashboard" : "Create account"}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>}
        </div>
      </section>
      <ToolsSection />
      <CommunityMilestone userCount={countData?.count} />
    </PageSurface>
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
    <section aria-labelledby="tools-title" className="px-fluid-md py-fluid-2xl md:px-fluid-xl">
      <div className="mx-auto max-w-6xl space-y-fluid-lg">
        <h2 id="tools-title" className="font-sora text-fluid-2xl font-semibold">Tools</h2>
        <div className="grid gap-fluid-lg md:grid-cols-2">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group flex min-h-44 items-start justify-between gap-5 rounded-2xl border border-white/40 bg-brand-surface p-fluid-lg transition-colors hover:bg-brand-soft-surface focus-visible:bg-brand-soft-surface">
              <div>
                <h3 className="font-sora text-xl font-semibold">{tool.title}</h3>
                <p className="mt-3 max-w-sm font-sora text-base leading-relaxed text-brand-putty">{tool.copy}</p>
              </div>
              <ArrowUpRight aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-brand-chalk transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
