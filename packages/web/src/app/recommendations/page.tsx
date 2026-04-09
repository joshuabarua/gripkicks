 'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth';

export default function RecommendationsPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-svh flex items-center justify-center px-6 py-16 bg-black text-white">
      <div className="max-w-2xl w-full text-center space-y-6">
        <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">Recommendations</p>
        <h1 className="font-so-cloudy uppercase text-4xl md:text-6xl leading-tight">Personalized picks coming soon</h1>
        <p className="font-sora text-neutral-400 text-base md:text-lg">
          We&apos;re training the recommender to tailor shoes to your climbing style. In the meantime, keep building your Shoe Sanctuary so we can rank comfort, performance, and durability for you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-4">
          <Link
            href="/stash"
            className="bg-brand-red hover:bg-brand-red/80 text-black font-tanker text-lg px-6 py-3 rounded-2xl shadow-lg shadow-brand-red/20 transition-colors duration-200 w-full sm:w-auto"
          >
            Go to Sanctuary
          </Link>
          {!session?.user && (
            <Link
              href="/login"
              className="border border-neutral-700 hover:border-brand-red/50 text-white font-sora px-6 py-3 rounded-2xl transition-colors duration-200 w-full sm:w-auto"
            >
              Log in to save picks
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
