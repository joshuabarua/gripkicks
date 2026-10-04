"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth";
import { FullPageLoading } from "@/components/ui/loading";
import { PageSurface } from "@/components/ui/PageSurface";
import { MatcherView } from "@/components/shoe/MatcherView";
import { MatcherWorkspace, SoleMateContent } from "@/components/shoe/MatcherWorkspace";
import { useFindMyShoe } from "@/hooks/useFindMyShoe";
import Link from "next/link";

export default function MatcherPage() {
  return <Suspense fallback={<FullPageLoading text="Loading matcher" />}><SoleSeekPage /></Suspense>;
}

function SoleSeekPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "mate" ? "mate" : "seek";

  if (sessionLoading) return <FullPageLoading text="Loading matcher" />;
  if (!session?.user) {
    return (
      <PageSurface className="flex items-center justify-center px-fluid-md py-fluid-xl">
        <section className="w-full max-w-lg rounded-2xl border border-brand-chalk bg-brand-chalk p-fluid-xl text-brand-base">
          <h1 className="font-ball-pill text-fluid-4xl">Matcher</h1>
          <p className="mt-fluid-md font-sora text-base leading-relaxed">Sign in to compare shoe matches and community ratings.</p>
          <Link href="/auth/login?callbackUrl=%2Fmatcher" className="mt-fluid-lg inline-flex min-h-11 items-center rounded-lg border border-brand-base bg-brand-red px-6 py-3 font-sora text-sm font-semibold text-black hover:bg-brand-red/90 focus-visible:outline-brand-base">Sign in</Link>
        </section>
      </PageSurface>
    );
  }
  return <MatcherWorkspace activeTab={activeTab}>{activeTab === "seek" ? <MatcherView /> : <SoleMateTab />}</MatcherWorkspace>;
}

function SoleMateTab() {
  const { soleMateMatches, isLoading, hasProfile } = useFindMyShoe(10);
  return <SoleMateContent matches={soleMateMatches} isLoading={isLoading} hasProfile={hasProfile} />;
}
