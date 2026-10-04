"use client";

export function CommunityMilestone({ userCount }: { userCount?: number | undefined }) {
  return (
    <section aria-labelledby="community-title" className="border-t border-white/40 px-fluid-md py-fluid-xl md:px-fluid-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-fluid-md rounded-2xl border border-white/40 bg-brand-surface p-fluid-lg">
        <h2 id="community-title" className="font-sora text-xl font-semibold text-brand-chalk">Community</h2>
        {userCount === undefined ? <p role="status" aria-label="Loading community count" className="font-sora text-sm text-brand-putty">Loading community count…</p> : <p className="font-sora text-base text-brand-putty"><span className="font-semibold tabular-nums text-brand-chalk">{userCount}</span> {userCount === 1 ? "climber" : "climbers"} registered</p>}
      </div>
    </section>
  );
}
