"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Footprints } from "lucide-react";
import { PageSurface } from "@/components/ui/PageSurface";
import { LabHeader } from "@/components/ui/LabHeader";
import ShoeImage from "@/components/ShoeImage";
import { BrandLogo } from "@/components/stash/BrandLogo";
import type { SoleMateClimberMatch } from "@/hooks/useFindMyShoe";

export function MatcherWorkspace({ activeTab, children }: { activeTab: "seek" | "mate"; children: ReactNode }) {
  const tabs = (
    <nav aria-label="Matcher views" className="flex flex-wrap gap-3">
      {([["seek", "Shoe matches", "/matcher"], ["mate", "Sole Mate", "/matcher?tab=mate"]] as const).map(([tab, label, href]) => (
        <Link key={tab} href={href} scroll={false} aria-current={activeTab === tab ? "page" : undefined} className={activeTab === tab ? "lab-card lab-card-active inline-flex min-h-11 items-center rounded-lg px-5 py-3 font-mono text-xs uppercase tracking-wider text-white" : "lab-button-ghost"}>{label}</Link>
      ))}
    </nav>
  );

  return (
    <PageSurface className="lab-fade">
      <div className="mx-auto max-w-[1600px] px-6 py-14 md:px-12 lg:px-16">
        <LabHeader title="Matcher" description="Shoes ranked for your foot profile and community ratings." actions={tabs} />
        {children}
      </div>
    </PageSurface>
  );
}

export function SoleMateContent({ matches, isLoading, hasProfile }: { matches: SoleMateClimberMatch[]; isLoading: boolean; hasProfile: boolean }) {
  if (isLoading) {
    return <div role="status" aria-label="Loading sole mates" className="lab-card p-fluid-xl font-mono text-base text-brand-putty">Finding sole mates…</div>;
  }
  if (!hasProfile) {
    return (
      <section className="lab-card p-fluid-xl">
        <Footprints aria-hidden="true" className="mb-fluid-md h-8 w-8 text-brand-putty" />
        <h2 className="font-ball-pill text-fluid-2xl">Set up your foot profile</h2>
        <p className="mt-3 max-w-lg font-mono text-base leading-relaxed text-brand-putty">Your foot shape and volume are needed to find climbers with the same fit.</p>
        <Link href="/footlab" className="lab-button mt-fluid-lg">Set up foot profile</Link>
      </section>
    );
  }
  if (!matches.length) {
    return (
      <section className="lab-card p-fluid-xl">
        <Users aria-hidden="true" className="mb-fluid-md h-8 w-8 text-brand-putty" />
        <h2 className="font-ball-pill text-fluid-2xl">No sole mates yet</h2>
        <p className="mt-3 max-w-lg font-mono text-base leading-relaxed text-brand-putty">No climbers with your exact foot profile have rated shoes above 8.5 yet.</p>
      </section>
    );
  }
  return (
    <div className="space-y-fluid-xl">
      <header className="lab-card lab-card-active lab-rise p-fluid-lg" style={{ "--rise-delay": "150ms" } as CSSProperties}>
        <h2 className="font-ball-pill text-fluid-2xl">Sole Mate</h2>
        <p className="mt-2 font-mono text-base leading-relaxed text-brand-chalk">{matches.length} {matches.length === 1 ? "climber" : "climbers"} with your foot profile. Shoes they rate highly.</p>
      </header>
      <div className="grid items-start gap-fluid-lg xl:grid-cols-2">{matches.map((match, index) => <SoleMateCard key={match.user._id} match={match} index={index} />)}</div>
    </div>
  );
}

function SoleMateCard({ match, index }: { match: SoleMateClimberMatch; index: number }) {
  return (
    <article className="lab-card lab-rise min-w-0 p-fluid-lg" style={{ "--rise-delay": `${400 + Math.min(index, 8) * 150}ms` } as CSSProperties}>
      <header className="mb-fluid-lg flex items-center gap-4 border-b border-white/8 pb-fluid-md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/6 bg-black/40">
          {match.user.image ? <Image src={match.user.image} alt="" width={48} height={48} className="h-full w-full object-cover" /> : <Users aria-hidden="true" className="h-5 w-5 text-brand-chalk" />}
        </div>
        <div className="min-w-0">
          <h3 className="wrap-break-word font-mono text-lg font-semibold">{match.user.name || "Climber"}</h3>
          <p className="mt-1 font-mono text-sm text-brand-putty">{match.shoes.length} top {match.shoes.length === 1 ? "shoe" : "shoes"}</p>
        </div>
      </header>
      <ul className="space-y-4">
        {match.shoes.map((rating) => (
          <li key={rating.shoe._id} className="lab-card grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 p-3 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:gap-4 sm:p-4">
            <div className="h-16 w-full overflow-hidden rounded-lg border border-white/6 bg-black/40">
              <ShoeImage brand={rating.shoe.brand} shoeName={rating.shoe.name} imageUrl={rating.shoe.imageUrl} slug={rating.shoe.slug} gender={rating.shoe.gender === "men" || rating.shoe.gender === "women" || rating.shoe.gender === "kids" || rating.shoe.gender === "unisex" ? rating.shoe.gender : undefined} context="thumbnail" className="p-2" transformation={[{ height: 64, width: 80, crop: "at_max", format: "png" }]} />
            </div>
            <div className="min-w-0">
              <BrandLogo brand={rating.shoe.brand} size="sm" />
              <h4 className="mt-1 wrap-break-word font-mono text-base font-semibold">{rating.shoe.name}</h4>
            </div>
            <div className="col-start-2 flex items-baseline gap-2 font-mono sm:col-auto sm:block sm:text-right">
              <p className="font-ball-pill text-2xl tabular-nums">{rating.matchScore}%</p>
              <p className="lab-label mt-1">Match</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
