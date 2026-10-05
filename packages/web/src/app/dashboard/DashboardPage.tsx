"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronRight, Footprints } from "lucide-react";
import { useSession } from "@/lib/auth";
import { useLoading } from "@/contexts/LoadingContext";
import ShoeImage from "@/components/ShoeImage";
import { useFootProfile, type FootProfile } from "@/hooks/useFootProfile";
import { useUserData } from "@/hooks/useUserData";
import type { UserShoe } from "@/types/api";
import { PageSurface } from "@/components/ui/PageSurface";
import LiquidGlassBackdrop from "@/components/brand/LiquidGlassBackdrop";
import WordmarkWatermark from "@/components/brand/WordmarkWatermark";

const isRated = (score?: number): score is number => typeof score === "number" && Number.isFinite(score) && score >= 1 && score <= 10;

interface DashboardOverviewProps {
  firstName: string;
  userShoes: UserShoe[];
  footProfile: FootProfile | null;
  isLoading?: boolean;
}

export function DashboardOverview({ firstName, userShoes, footProfile, isLoading = false }: DashboardOverviewProps) {
  const summary = useMemo(() => userShoes.reduce((totals, shoe) => {
    if (shoe.isFavourite) totals.favourites++;
    if (isRated(shoe.comfortScore)) {
      totals.comfort += shoe.comfortScore;
      totals.rated++;
    }
    return totals;
  }, { favourites: 0, comfort: 0, rated: 0 }), [userShoes]);
  const average = summary.rated ? (summary.comfort / summary.rated).toFixed(1) : "Not rated";
  const nextAction = !footProfile
    ? { title: "Set your foot profile", description: "Add your foot shape and volume before comparing shoe fit.", label: "Set up foot profile", href: "/footlab" }
    : !userShoes.length
      ? { title: "Add your first shoe", description: "Keep your shoes, sizes and fit ratings in Shoe Sanctuary.", label: "Add first shoe", href: "/stash" }
      : { title: "Find your next shoe", description: "Compare shoes using your foot profile and collection ratings.", label: "Find shoes", href: "/matcher?tab=mate" };
  const metrics = [
    { label: "Shoes", value: userShoes.length, detail: "" },
    { label: "Favourites", value: summary.favourites, detail: "" },
    { label: "Avg comfort", value: average, detail: summary.rated ? `${summary.rated} rated ${summary.rated === 1 ? "shoe" : "shoes"}` : "No rated shoes" },
  ];

  return (
    <PageSurface aria-busy={isLoading} className="bg-black">
      <div className="mx-auto max-w-6xl space-y-fluid-lg px-fluid-md py-fluid-lg md:px-fluid-xl">
        <header className="relative flex min-h-[13rem] items-end overflow-hidden rounded-3xl border border-white/[0.06] bg-black p-fluid-lg sm:min-h-[16rem] sm:p-fluid-xl">
          <LiquidGlassBackdrop align="right" />
          <WordmarkWatermark lines={["DASH"]} align="right" />
          <div className="relative z-10 flex w-full flex-wrap items-end justify-between gap-3">
            <h1 className="font-ball-pill text-fluid-4xl leading-none">Dashboard</h1>
            <p className="font-sora text-sm text-brand-putty">Hey {firstName}</p>
          </div>
        </header>

        {isLoading ? (
          <div role="status" aria-label="Loading dashboard" className="space-y-fluid-md">
            <p className="font-sora text-sm text-brand-putty">Loading your dashboard…</p>
            <div aria-hidden="true" className="h-32 animate-pulse rounded-3xl border border-white/[0.06] bg-brand-surface motion-reduce:animate-none" />
            <div aria-hidden="true" className="h-64 animate-pulse rounded-3xl border border-white/[0.06] bg-brand-surface motion-reduce:animate-none" />
          </div>
        ) : (
          <div className="space-y-fluid-lg">
            <section aria-labelledby="next-step-title" className="flex flex-col justify-between gap-fluid-md rounded-3xl border border-white/[0.06] bg-brand-surface p-fluid-lg sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 font-sora text-sm font-semibold uppercase tracking-widest text-brand-putty">Next step</p>
                <h2 id="next-step-title" className="font-sora text-fluid-2xl font-semibold leading-tight">{nextAction.title}</h2>
                <p className="mt-2 max-w-lg font-sora text-base leading-relaxed text-brand-putty">{nextAction.description}</p>
              </div>
              <Link href={nextAction.href} className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-brand-red/30 bg-brand-red px-5 py-3 font-ball-pill text-sm uppercase text-black transition-colors hover:bg-brand-red/80 focus-visible:outline-brand-red sm:w-auto">
                {nextAction.label}<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </section>

            <dl aria-label="Collection summary" className="grid grid-cols-3 divide-x divide-white/[0.06] overflow-hidden rounded-3xl border border-white/[0.06] bg-brand-surface">
              {metrics.map((metric) => (
                <div key={metric.label} className="min-w-0 px-3 py-fluid-md sm:px-fluid-lg">
                  <dt className="font-sora text-sm font-medium text-brand-chalk">{metric.label}</dt>
                  <dd className="mt-2">
                    <span className={`font-sora font-semibold tabular-nums leading-none ${metric.value === "Not rated" ? "text-sm" : "text-fluid-3xl"}`}>
                      {metric.value}
                      {metric.label === "Avg comfort" && summary.rated > 0 && <span className="ml-1 font-sora text-sm text-brand-putty">/10</span>}
                    </span>
                    {metric.detail && <span className="mt-2 block font-sora text-sm leading-relaxed text-brand-putty">{metric.detail}</span>}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="grid items-start gap-fluid-lg lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
              <section aria-labelledby="collection-title" className="min-w-0 overflow-hidden rounded-3xl border border-white/[0.06] bg-brand-surface">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-fluid-md">
                  <h2 id="collection-title" className="font-sora text-lg font-semibold">Your collection</h2>
                  <Link href="/stash" className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg border border-white/20 px-4 py-2 font-sora text-sm font-medium text-brand-chalk transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-brand-chalk">
                    Open Sanctuary<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
                {userShoes.length ? (
                  <ul className="divide-y divide-white/[0.06]">
                    {userShoes.slice(0, 3).map((shoe) => {
                      const details = shoe.shoe ?? shoe.shoeDetails;
                      const brand = details?.brand ?? "Unknown brand";
                      const name = details?.name ?? "Shoe details unavailable";
                      return (
                        <li key={shoe._id}>
                          <Link href="/stash" aria-label={`View ${brand} ${name} in Sanctuary`} className="group flex min-h-24 items-center gap-3 p-fluid-md transition-colors hover:bg-brand-soft-surface focus-visible:bg-brand-soft-surface sm:gap-4">
                            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-brand-chalk">
                              <ShoeImage brand={brand} shoeName={name} imageUrl={details?.imageUrl} slug={details?.slug} gender={details?.gender} context="thumbnail" className="p-2" transformation={[{ height: 64, width: 80, crop: "at_max", cropMode: "pad_resize", format: "png", quality: 80 }]} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-sora text-sm text-brand-putty">{brand}</p>
                              <h3 className="mt-1 truncate font-sora text-sm font-semibold text-brand-chalk">{name}</h3>
                              {shoe.size && <p className="mt-1 font-sora text-sm text-brand-putty">Size {shoe.size}</p>}
                            </div>
                            <div className="shrink-0 text-right font-sora">
                              <p className="text-sm text-brand-chalk">{isRated(shoe.comfortScore) ? `${shoe.comfortScore}/10` : "Not rated"}</p>
                              <p className="mt-1 text-xs text-brand-putty">Comfort</p>
                            </div>
                            <ChevronRight aria-hidden="true" className="hidden h-4 w-4 shrink-0 text-brand-putty sm:block" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="px-fluid-lg py-fluid-xl">
                    <Footprints aria-hidden="true" className="mb-4 h-6 w-6 text-brand-putty" />
                    <h3 className="font-sora text-base font-semibold">No shoes added yet</h3>
                    <p className="mt-2 max-w-sm font-sora text-sm leading-relaxed text-brand-putty">Add shoes in Sanctuary to record sizes, comfort and fit.</p>
                  </div>
                )}
              </section>

              <section aria-labelledby="profile-title" className="rounded-3xl border border-white/[0.06] bg-black p-fluid-lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="profile-title" className="font-sora text-lg font-semibold">Foot profile</h2>
                  {footProfile && <Link href="/footlab" aria-label="Edit foot profile" className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg border border-white/20 px-4 py-2 font-sora text-sm font-medium text-brand-chalk transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-brand-chalk">Edit<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>}
                </div>
                {footProfile ? (
                  <dl className="mt-fluid-md grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-fluid-md">
                    <div><dt className="font-sora text-sm text-brand-putty">Shape</dt><dd className="mt-2 font-sora text-base font-semibold">{footProfile.shape}</dd></div>
                    <div><dt className="font-sora text-sm text-brand-putty">Volume</dt><dd className="mt-2 font-sora text-base font-semibold">{footProfile.volume}</dd></div>
                  </dl>
                ) : (
                  <p className="mt-fluid-md font-sora text-sm leading-relaxed text-brand-putty">No profile saved. Set your shape and volume in Foot Lab using the next step above.</p>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </PageSurface>
  );
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { profile: footProfile, isLoading: profileLoading } = useFootProfile();
  const { userData, userStashData, isLoading: userLoading } = useUserData();
  const { showLoader, hideLoader } = useLoading();
  const isLoadingData = !!session?.user && (userLoading || userData === undefined || (userData !== null && userStashData === undefined));
  const isLoading = isPending || isLoadingData || profileLoading;

  // Move useMemo before early returns to satisfy Rules of Hooks
  const userShoes = useMemo(() => userStashData ?? [], [userStashData]);

  useEffect(() => {
    if (!isPending && !session?.user) router.replace("/auth/login");
  }, [isPending, router, session?.user]);

  useEffect(() => {
    if (isLoading) showLoader("dashboard");
    else hideLoader("dashboard");
    return () => hideLoader("dashboard");
  }, [isLoading, showLoader, hideLoader]);

  if (!isPending && !session?.user) return null;

  const firstName = (userData?.name || session?.user?.name || "Climber").trim().split(/\s+/)[0] || "Climber";
  return <DashboardOverview firstName={firstName} userShoes={userShoes} footProfile={footProfile} isLoading={isLoading} />;
}
