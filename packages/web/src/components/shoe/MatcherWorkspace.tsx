"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Footprints } from "lucide-react";
import { PageSurface } from "@/components/ui/PageSurface";
import ShoeImage from "@/components/ShoeImage";
import { BrandLogo } from "@/components/stash/BrandLogo";
import type { SoleMateClimberMatch } from "@/hooks/useFindMyShoe";

export function MatcherWorkspace({ activeTab, children }: { activeTab: "seek" | "mate"; children: ReactNode }) {
  return (
    <PageSurface>
      <div className="mx-auto max-w-[1600px] px-fluid-md py-fluid-lg md:px-fluid-xl">
        <header className="space-y-fluid-md border-b border-white/40 pb-fluid-lg">
          <h1 className="font-ball-pill text-fluid-4xl leading-none">Matcher</h1>
          <nav aria-label="Matcher views" className="flex flex-wrap gap-3">
            {([["seek", "Shoe matches", "/matcher"], ["mate", "Sole Mate", "/matcher?tab=mate"]] as const).map(([tab, label, href]) => (
              <Link key={tab} href={href} scroll={false} aria-current={activeTab === tab ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-lg border px-5 py-3 font-sora text-sm font-semibold transition-colors ${activeTab === tab ? "border-brand-chalk bg-brand-chalk text-brand-base focus-visible:outline-brand-chalk" : "border-white/40 bg-brand-surface text-brand-chalk hover:bg-brand-soft-surface"}`}>{label}</Link>
            ))}
          </nav>
        </header>
        <div className="py-fluid-xl">{children}</div>
      </div>
    </PageSurface>
  );
}

export function SoleMateContent({ matches, isLoading, hasProfile }: { matches: SoleMateClimberMatch[]; isLoading: boolean; hasProfile: boolean }) {
  if (isLoading) {
    return <div role="status" aria-label="Loading sole mates" className="rounded-2xl border border-white/40 bg-brand-surface p-fluid-xl font-sora text-base text-brand-putty">Finding sole mates…</div>;
  }
  if (!hasProfile) {
    return (
      <section className="rounded-2xl border border-white/40 bg-brand-surface p-fluid-xl">
        <Footprints aria-hidden="true" className="mb-fluid-md h-8 w-8 text-brand-putty" />
        <h2 className="font-sora text-fluid-2xl font-semibold">Set up your foot profile</h2>
        <p className="mt-3 max-w-lg font-sora text-base leading-relaxed text-brand-putty">Your foot shape and volume are needed to find climbers with the same fit.</p>
        <Link href="/footlab" className="mt-fluid-lg inline-flex min-h-11 items-center rounded-lg bg-brand-red px-6 py-3 font-sora text-sm font-semibold text-black hover:bg-brand-red/90">Set up foot profile</Link>
      </section>
    );
  }
  if (!matches.length) {
    return (
      <section className="rounded-2xl border border-white/40 bg-brand-surface p-fluid-xl">
        <Users aria-hidden="true" className="mb-fluid-md h-8 w-8 text-brand-putty" />
        <h2 className="font-sora text-fluid-2xl font-semibold">No sole mates yet</h2>
        <p className="mt-3 max-w-lg font-sora text-base leading-relaxed text-brand-putty">No climbers with your exact foot profile have rated shoes above 8.5 yet.</p>
      </section>
    );
  }
  return (
    <div className="space-y-fluid-xl">
      <header className="rounded-2xl border border-brand-chalk bg-brand-chalk p-fluid-lg text-brand-base">
        <h2 className="font-sora text-fluid-2xl font-semibold">Sole Mate</h2>
        <p className="mt-2 font-sora text-base leading-relaxed">{matches.length} {matches.length === 1 ? "climber" : "climbers"} with your foot profile. Shoes they rate highly.</p>
      </header>
      <div className="grid items-start gap-fluid-lg xl:grid-cols-2">{matches.map((match) => <SoleMateCard key={match.user._id} match={match} />)}</div>
    </div>
  );
}

function SoleMateCard({ match }: { match: SoleMateClimberMatch }) {
  return (
    <article className="min-w-0 rounded-2xl border border-white/40 bg-brand-surface p-fluid-lg">
      <header className="mb-fluid-lg flex items-center gap-4 border-b border-white/40 pb-fluid-md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft-surface">
          {match.user.image ? <Image src={match.user.image} alt="" width={48} height={48} className="h-full w-full object-cover" /> : <Users aria-hidden="true" className="h-5 w-5 text-brand-chalk" />}
        </div>
        <div className="min-w-0">
          <h3 className="break-words font-sora text-lg font-semibold">{match.user.name || "Climber"}</h3>
          <p className="mt-1 font-sora text-sm text-brand-putty">{match.shoes.length} top {match.shoes.length === 1 ? "shoe" : "shoes"}</p>
        </div>
      </header>
      <ul className="space-y-4">
        {match.shoes.map((rating) => (
          <li key={rating.shoe._id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 rounded-xl border border-white/40 bg-brand-soft-surface p-3 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:gap-4 sm:p-4">
            <div className="h-16 w-full overflow-hidden rounded-lg bg-brand-chalk">
              <ShoeImage brand={rating.shoe.brand} shoeName={rating.shoe.name} imageUrl={rating.shoe.imageUrl} slug={rating.shoe.slug} gender={rating.shoe.gender === "men" || rating.shoe.gender === "women" || rating.shoe.gender === "kids" || rating.shoe.gender === "unisex" ? rating.shoe.gender : undefined} context="thumbnail" className="p-2" transformation={[{ height: 64, width: 80, crop: "at_max", format: "png" }]} />
            </div>
            <div className="min-w-0">
              <BrandLogo brand={rating.shoe.brand} size="sm" />
              <h4 className="mt-1 break-words font-sora text-base font-semibold">{rating.shoe.name}</h4>
            </div>
            <div className="col-start-2 flex items-baseline gap-2 font-sora sm:col-auto sm:block sm:text-right">
              <p className="text-lg font-semibold tabular-nums">{rating.matchScore}%</p>
              <p className="mt-1 text-sm text-brand-putty">Match</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
