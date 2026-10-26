"use client";

export function StatsStripSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mt-fluid-md grid w-full min-w-64 max-w-xl flex-1 grid-cols-3 overflow-hidden rounded-lg border border-white/20 bg-brand-surface"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`flex items-baseline px-3 py-fluid-sm sm:px-fluid-md ${i < 2 ? "border-r border-white/20" : ""}`}
        >
          <div className="h-7 w-9 animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
          <div className="ml-2 h-3 w-12 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}

function SanctuaryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/30 bg-brand-surface">
      <div className="flex min-h-11 items-center border-b border-white/20 px-4">
        <div className="h-4 w-20 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
      </div>
      <div className="aspect-[16/10] border-b border-white/20 bg-brand-soft-surface" />
      <div className="space-y-2.5 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
      </div>
    </div>
  );
}

export function SanctuaryGridSkeleton() {
  return (
    <div role="status" aria-label="Loading your collection" aria-busy="true">
      <span className="sr-only">Loading your collection</span>
      <div aria-hidden="true" className="grid gap-fluid-xl lg:grid-cols-2">
        {[0, 1].map((brand) => (
          <div key={brand} className="lg:col-span-2">
            <div className="mb-fluid-lg flex items-center gap-fluid-md">
              <div className="h-8 w-28 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
              <div className="h-px flex-1 bg-white/20" />
            </div>
            <div className="grid items-start gap-fluid-lg sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SanctuaryCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
