"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth";
import { FullPageLoading } from "@/components/ui/loading";
import { PageSurface } from "@/components/ui/PageSurface";
import { MatcherView } from "@/components/shoe/MatcherView";
import { MatcherWorkspace, SoleMateContent } from "@/components/shoe/MatcherWorkspace";
import { useFindMyShoe } from "@/hooks/useFindMyShoe";
import { Footprints } from "lucide-react";
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
        <section className="flex w-full max-w-lg flex-col items-center text-center">
          <div className="hal-glow-animate flex h-16 w-16 items-center justify-center rounded-lg bg-brand-red/10">
            <Footprints aria-hidden="true" className="h-7 w-7 text-brand-red" />
          </div>
          <h1 className="mt-6 font-ball-pill text-4xl uppercase">Matcher</h1>
          <p className="mt-3 font-mono text-sm leading-relaxed text-neutral-500">Sign in to compare shoe matches and community ratings.</p>
          <Link href="/auth/login?callbackUrl=%2Fmatcher" className="lab-button mt-8">Log in</Link>
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
