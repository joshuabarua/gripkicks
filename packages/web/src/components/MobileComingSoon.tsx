export default function MobileComingSoon() {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden bg-black px-6 py-10 text-white md:hidden">
      <div className="relative w-full max-w-sm text-center">
        <div className="absolute inset-x-10 -top-28 h-56 rounded-full bg-brand-red/20 blur-3xl" />
        <div className="relative rounded-[2rem] border border-white/[0.08] bg-brand-charcoal/80 p-8 shadow-2xl shadow-black/60">
          <h1 className="font-ball-pill text-5xl leading-none text-brand-chalk">
            MOBILE
            <br />
            COMING SOON
          </h1>
          <p className="mt-5 font-sora text-sm leading-6 text-brand-putty/70">
            GripKicks is desktop-only for now. Open it on a tablet, laptop, or desktop.
          </p>
          <div className="mt-8 rounded-2xl border border-brand-red/20 bg-brand-red/10 px-4 py-3 font-sora text-xs text-brand-chalk/80">
            Desktop access is live now
          </div>
        </div>
      </div>
    </main>
  );
}
