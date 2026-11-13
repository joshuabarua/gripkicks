"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/lib/auth";
import { FullPageLoading } from "@/components/ui/loading";
import { MatcherView } from "@/components/shoe/MatcherView";
import { MatcherWorkspace, SoleMateContent } from "@/components/shoe/MatcherWorkspace";
import { FirstShoeQuiz } from "@/components/matcher/FirstShoeQuiz";
import { useFindMyShoe } from "@/hooks/useFindMyShoe";

export default function MatcherPage() {
  return <Suspense fallback={<FullPageLoading text="Loading matcher" />}><SoleSeekPage /></Suspense>;
}

function SoleSeekPage() {
  const { data: session } = useRequireAuth();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const activeTab = tab === "mate" ? "mate" : tab === "first" ? "first" : "seek";

  if (!session?.user) return <FullPageLoading text="Loading matcher" />;
  return <MatcherWorkspace activeTab={activeTab}>{activeTab === "seek" ? <MatcherView /> : activeTab === "first" ? <FirstShoeQuiz /> : <SoleMateTab />}</MatcherWorkspace>;
}

function SoleMateTab() {
  const { soleMateMatches, isLoading, hasProfile } = useFindMyShoe(10);
  return <SoleMateContent matches={soleMateMatches} isLoading={isLoading} hasProfile={hasProfile} />;
}
