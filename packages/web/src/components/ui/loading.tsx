export function LoadingBar({
  progress,
  showLabel = false,
  size = "md",
}: {
  progress?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg" | "full";
}) {
  const sizeClasses = {
    sm: "w-16 h-px",
    md: "w-24 h-px",
    lg: "w-32 h-px",
    full: "w-full h-full",
  };
  const value = progress === undefined ? undefined : Math.max(0, Math.min(100, progress));

  return (
    <div className={`flex items-center gap-3 ${size === "full" ? "h-full w-full" : ""}`}>
      {showLabel && (
        <span className="font-mono text-[10px] text-brand-putty/60">
          {value === undefined ? "Loading" : `${Math.round(value)}%`}
        </span>
      )}
      <div
        role="progressbar"
        aria-label="Loading"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className={`${sizeClasses[size]} overflow-hidden bg-white/10`}
      >
        <div
          className={`h-full origin-left bg-brand-red ${value === undefined ? "loading-stroke w-1/3" : "w-full"}`}
          style={value === undefined ? undefined : { transform: `scaleX(${value / 100})` }}
        />
      </div>
    </div>
  );
}

export function FullPageLoading({ text = "Loading" }: { text?: string }) {
  return (
    <section className="mx-auto min-h-[65svh] w-full max-w-7xl px-fluid-lg py-fluid-2xl" role="status" aria-label={text} aria-busy="true">
      <div className="flex items-center gap-fluid-md border-b border-white/10 pb-fluid-lg">
        <span aria-hidden="true" className="h-2 w-2 rounded-sm bg-brand-red" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-chalk">{text}</span>
        <div aria-hidden="true" className="ml-auto"><LoadingBar size="lg" /></div>
      </div>
      <div aria-hidden="true" className="space-y-fluid-xl pt-fluid-xl">
        <div className="h-12 w-2/5 rounded-sm bg-white/6" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-fluid-lg">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-sm border border-white/10">
              <div className="flex items-center gap-2 border-b border-white/10 p-fluid-md">
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <div className="h-2 w-16 bg-white/10" />
              </div>
              <div className="flex aspect-4/3 items-center justify-center bg-white/2">
                <div className="h-24 w-12 rotate-[-25deg] rounded-[50%] border border-dashed border-white/15" />
              </div>
              <div className="space-y-3 border-t border-white/10 p-fluid-md">
                <div className="h-2 w-2/3 bg-white/10" />
                <div className="h-2 w-1/3 bg-white/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
