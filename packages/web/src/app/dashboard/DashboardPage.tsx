"use client";

import { useEffect, useMemo } from "react";
import Link from "@/components/ui/NavLink";
import { ArrowUpRight, ChevronRight, Footprints } from "lucide-react";
import { useRequireAuth } from "@/lib/auth";
import { useLoading } from "@/contexts/LoadingContext";
import ShoeImage from "@/components/ShoeImage";
import { BrandLogo } from "@/components/stash/BrandLogo";
import { useFootProfile, type FootProfile } from "@/hooks/useFootProfile";
import { useUserData } from "@/hooks/useUserData";
import type { UserShoe } from "@/types/api";
import { PageSurface } from "@/components/ui/PageSurface";
import { LabHeader } from "@/components/ui/LabHeader";
import { riseDelay } from "@/lib/motion";
import { ToeProfile, VolumeArch, TOE_HEIGHTS, VOLUME_ARCH, type FootShape, type FootVolume } from "@/components/foot/FootGlyphs";

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
  const glyphShape = footProfile?.shape && footProfile.shape.toLowerCase() in TOE_HEIGHTS ? footProfile.shape.toLowerCase() as FootShape : undefined;
  const glyphVolume = footProfile?.volume && footProfile.volume.toLowerCase() in VOLUME_ARCH ? footProfile.volume.toLowerCase() as FootVolume : undefined;

  return (
    <PageSurface aria-busy={isLoading}>
      <div className="lab-container">
        <LabHeader title="Dashboard" description={`Hey ${firstName}`} />

        {isLoading ? (
          <div role="status" aria-label="Loading dashboard" className="space-y-4">
            <p className="font-mono text-sm text-brand-putty">Loading your dashboard…</p>
            <div aria-hidden="true" className="lab-card h-32 animate-pulse motion-reduce:animate-none" />
            <div aria-hidden="true" className="lab-card h-64 animate-pulse motion-reduce:animate-none" />
          </div>
        ) : (
          <div className="space-y-6">
            <section aria-labelledby="next-step-title" className="lab-card lab-card-active lab-rise flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="lab-label mb-2">Next step</p>
                <h2 id="next-step-title" className="font-amatic text-3xl leading-tight">{nextAction.title}</h2>
                <p className="mt-2 max-w-lg font-mono text-sm leading-relaxed text-brand-putty">{nextAction.description}</p>
              </div>
              <Link href={nextAction.href} className="lab-button shrink-0">
                {nextAction.label}<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </section>

            <dl aria-label="Collection summary" className="grid grid-cols-3 gap-3">
              {metrics.map((metric, index) => (
                <div key={metric.label} style={riseDelay(index + 1)} className="lab-card lab-rise min-w-0 p-4 sm:p-6">
                  <dt className="lab-label">{metric.label}</dt>
                  <dd className="mt-2">
                    <span className={metric.value === "Not rated" ? "font-mono text-sm font-medium text-brand-chalk" : "font-amatic text-fluid-3xl leading-none tabular-nums"}>
                      {metric.value}
                      {metric.label === "Avg comfort" && summary.rated > 0 && <span className="ml-1 font-mono text-sm text-brand-putty">/10</span>}
                    </span>
                    {metric.detail && <span className="mt-2 block font-mono text-sm leading-relaxed text-brand-putty">{metric.detail}</span>}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
              <section aria-labelledby="collection-title" style={riseDelay(4)} className="lab-card lab-rise min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 p-5 sm:p-6">
                  <h2 id="collection-title" className="font-amatic text-2xl">Your collection</h2>
                  <Link href="/stash" className="lab-button-ghost">
                    Open Sanctuary<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
                {userShoes.length ? (
                  <ul className="divide-y divide-white/6">
                    {userShoes.slice(0, 3).map((shoe) => {
                      const details = shoe.shoe ?? shoe.shoeDetails;
                      const brand = details?.brand ?? "Unknown brand";
                      const name = details?.name ?? "Shoe details unavailable";
                      return (
                        <li key={shoe._id}>
                          <Link href="/stash" aria-label={`View ${brand} ${name} in Sanctuary`} className="group flex min-h-24 items-center gap-3 p-5 transition-colors hover:bg-white/3 focus-visible:bg-white/3 sm:gap-4 sm:px-6">
                            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-white/6 bg-black/40">
                              <ShoeImage brand={brand} shoeName={name} imageUrl={details?.imageUrl} slug={details?.slug} gender={details?.gender} context="thumbnail" className="p-2" transformation={[{ height: 64, width: 80, crop: "at_max", cropMode: "pad_resize", format: "png", quality: 80 }]} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <BrandLogo brand={brand} size="sm" />
                              <h3 className="mt-1 truncate font-mono text-sm font-semibold text-brand-chalk">{name}</h3>
                              {shoe.size && <p className="mt-1 font-mono text-sm text-brand-putty">Size {shoe.size}</p>}
                            </div>
                            <div className="shrink-0 text-right font-mono">
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
                  <div className="px-6 py-10 sm:px-8">
                    <Footprints aria-hidden="true" className="mb-4 h-6 w-6 text-brand-putty" />
                    <h3 className="font-mono text-base font-semibold">No shoes added yet</h3>
                    <p className="mt-2 max-w-sm font-mono text-sm leading-relaxed text-brand-putty">Add shoes in Sanctuary to record sizes, comfort and fit.</p>
                  </div>
                )}
              </section>

              <section aria-labelledby="profile-title" style={riseDelay(5)} className="lab-card lab-rise p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="profile-title" className="font-amatic text-2xl">Foot profile</h2>
                  {footProfile && <Link href="/footlab" aria-label="Edit foot profile" className="lab-button-ghost">Edit<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>}
                </div>
                {footProfile ? (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>{glyphShape && <ToeProfile shape={glyphShape} active height={56} />}</div>
                      <div>{glyphVolume && <VolumeArch volume={glyphVolume} active height={56} />}</div>
                    </div>
                    <dl className="mt-fluid-md grid grid-cols-2 gap-4 border-t border-white/6 pt-fluid-md">
                      <div><dt className="lab-label">Shape</dt><dd className="mt-2 font-mono text-base font-semibold">{footProfile.shape}</dd></div>
                      <div><dt className="lab-label">Volume</dt><dd className="mt-2 font-mono text-base font-semibold">{footProfile.volume}</dd></div>
                    </dl>
                  </>
                ) : (
                  <p className="mt-fluid-md font-mono text-sm leading-relaxed text-brand-putty">No profile saved. Set your shape and volume in Foot Lab using the next step above.</p>
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
  const { data: session } = useRequireAuth();
  const { profile: footProfile, isLoading: profileLoading } = useFootProfile();
  const { userData, userStashData, isLoading: userLoading } = useUserData();
  const { showLoader, hideLoader } = useLoading();
  const isLoadingData = !!session?.user && (userLoading || userData === undefined || (userData !== null && userStashData === undefined));
  const isLoading = !session?.user || isLoadingData || profileLoading;

  // Move useMemo before early returns to satisfy Rules of Hooks
  const userShoes = useMemo(() => userStashData ?? [], [userStashData]);

  useEffect(() => {
    if (isLoading) showLoader("dashboard");
    else hideLoader("dashboard");
    return () => hideLoader("dashboard");
  }, [isLoading, showLoader, hideLoader]);

  const firstName = (userData?.name || session?.user?.name || "Climber").trim().split(/\s+/)[0] || "Climber";
  return <DashboardOverview firstName={firstName} userShoes={userShoes} footProfile={footProfile} isLoading={isLoading} />;
}
