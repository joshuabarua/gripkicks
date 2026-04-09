"use client";

import { useState } from 'react';
import { useSession } from '@/lib/auth';
import { FullPageLoading } from '@/components/ui/loading';
import { ShoeRadarMatcher } from '@/components/shoe/ShoeRadarMatcher';
import CragRadar from '@/components/shoe/CragRadar';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Activity, Clock, Users, Footprints, ArrowUpRight } from 'lucide-react';
import { useFindMyShoe, type SoleMateClimberMatch, type AggregatedRating } from '@/hooks/useFindMyShoe';
import Link from 'next/link';
import Image from 'next/image';

type Tab = 'seek' | 'mate' | 'crag';

export default function SoleSeekPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('seek');

  if (sessionLoading) return <FullPageLoading text="Loading" />;

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="mb-8">
            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-brand-red" />
            </div>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3">Shoe matching</p>
            <h1 className="font-tanker text-5xl text-white mb-2">MATCHER</h1>
            <p className="font-sora text-neutral-400">
              See where every shoe lands based on how it actually performs
            </p>
          </div>

          <div className="space-y-6 text-left">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-brand-red mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-sora font-semibold text-white mb-1">See How Shoes Compare</h3>
                <p className="text-sm text-neutral-400">Every shoe plotted on a grid by comfort, performance, and aggressiveness</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-brand-red mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-sora font-semibold text-white mb-1">Find Your Style</h3>
                <p className="text-sm text-neutral-400">Bouldering, sport, all-around — see what fits your climbing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brand-red mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-sora font-semibold text-white mb-1">Visual Grid</h3>
                <p className="text-sm text-neutral-400">Shoe images placed on a quadrant so you can spot the right zone fast</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-neutral-900 rounded-xl border border-neutral-800">
            <p className="font-sora text-sm text-neutral-400 text-center">Sign in to access Matcher</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 md:px-12 lg:px-16 pt-28 max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3">Shoe matching</p>
            <h1 className="font-tanker text-6xl md:text-7xl leading-none">MATCHER</h1>
          </div>
          <Link
            href="/radar-lab"
            className="font-sora inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-brand-red/40 hover:text-white mb-2"
          >
            Crag <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex border-b border-neutral-800">
          {([
            ['seek', 'Matcher'],
            ['mate', 'Sole Mate'],
            ['crag', 'Crag'],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-sora text-sm px-5 py-3 border-b-2 transition-colors capitalize ${activeTab === tab
                  ? 'border-brand-red text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'seek' ? (
          <motion.div key="seek" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ShoeRadarMatcher />
          </motion.div>
        ) : activeTab === 'crag' ? (
          <motion.div key="crag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <CragRadar />
          </motion.div>
        ) : (
          <motion.div key="mate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <SoleMateTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SoleMateTab() {
  const { soleMateMatches, isLoading, hasProfile } = useFindMyShoe(10);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <motion.div
            className="w-8 h-8 border-l-2 border-t-2 border-brand-red/40 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">Finding sole mates</p>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="px-6 md:px-12 lg:px-16 py-16 max-w-[1440px] mx-auto text-center">
        <Footprints className="w-10 h-10 text-brand-red/40 mx-auto mb-4" />
        <h2 className="font-tanker text-2xl text-white mb-2">SET UP YOUR FOOT PROFILE</h2>
        <p className="font-sora text-neutral-500 mb-6 max-w-sm mx-auto">Your foot profile is needed to find climbers with the same fit</p>
        <Link href="/footscan">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-brand-red hover:bg-brand-red/80 text-black font-tanker px-6 py-2.5 rounded-xl transition-colors">
            FOOT LAB
          </motion.button>
        </Link>
      </div>
    );
  }

  if (soleMateMatches.length === 0) {
    return (
      <div className="px-6 md:px-12 lg:px-16 py-16 max-w-[1440px] mx-auto text-center">
        <Users className="w-10 h-10 text-neutral-700 mx-auto mb-4" />
        <h2 className="font-tanker text-2xl text-white mb-2">NO SOLE MATES YET</h2>
        <p className="font-sora text-neutral-500 max-w-sm mx-auto">No one with your exact foot profile has rated shoes above 8.5 yet. Check back as the community grows.</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-brand-red/10 border border-brand-red/20 rounded-2xl px-4 py-2.5 text-center">
          <p className="font-tanker text-2xl text-brand-red">{soleMateMatches.length}</p>
          <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-white/30">Sole mates</p>
        </div>
        <p className="font-sora text-sm text-neutral-500">Climbers with your exact foot profile — see what&apos;s working for them</p>
      </div>

      <div className="space-y-4">
        {soleMateMatches.map((match) => (
          <SoleMateCard key={match.user._id} match={match} />
        ))}
      </div>
    </div>
  );
}

function SoleMateCard({ match }: { match: SoleMateClimberMatch }) {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {match.user.image ? (
            <Image src={match.user.image} alt={match.user.name || 'Climber'} width={40} height={40} className="w-full h-full object-cover" />
          ) : (
            <Users className="w-4 h-4 text-brand-red" />
          )}
        </div>
        <div>
          <h3 className="font-sora font-semibold text-white text-sm">{match.user.name || 'Climber'}</h3>
          <p className="font-sora text-[10px] uppercase tracking-[0.15em] text-white/30">{match.shoes.length} top shoes</p>
        </div>
      </div>

      <div className="space-y-2">
        {match.shoes.map((rating: AggregatedRating) => (
          <div key={rating.shoe._id} className="flex items-center gap-4 p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
            <div className="w-10 h-10 bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
              {rating.shoe.imageUrl ? (
                <Image src={rating.shoe.imageUrl} alt={rating.shoe.name} width={40} height={40} className="w-full h-full object-contain p-1" />
              ) : (
                <Footprints className="w-4 h-4 text-neutral-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-tanker text-base leading-none text-white">{rating.shoe.name}</p>
              <p className="font-sora text-[10px] text-neutral-500 mt-0.5">{rating.shoe.brand}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-tanker text-lg text-brand-red">{rating.matchScore}%</p>
              <p className="font-sora text-[9px] uppercase tracking-[0.15em] text-white/30">match</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
