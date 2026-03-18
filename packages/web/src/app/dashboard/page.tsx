"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {
  Footprints,
  Plus,
  Star,
  ArrowUpRight,
  TrendingUp,
  Heart,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/api-client';
import type { UserShoe } from '@/types/api';
import { FullPageLoading } from '@/components/ui/loading';
import ShoeImage from '@/components/ShoeImage';
import { useFootProfileStore } from '@/stores/footProfileStore';

interface Profile {
  name?: string;
  footShape?: string;
  footVolume?: string;
  onboardingComplete?: boolean;
}

const MarqueeText = ({ children, reverse = false }: { children: React.ReactNode; reverse?: boolean }) => (
  <motion.div
    animate={{ x: reverse ? [0, 500] : [0, -500] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    className="flex gap-8 whitespace-nowrap"
  >
    {Array(20).fill(null).map((_, i) => (
      <span key={i} className="font-tanker text-xl text-orange-500/20">
        {children}
      </span>
    ))}
  </motion.div>
);

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [userShoes, setUserShoes] = useState<UserShoe[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { profile: footProfile } = useFootProfileStore();

  useEffect(() => {
    if (!isPending && session?.user) {
      loadUserData();
    }
  }, [session, isPending]);

  const loadUserData = async () => {
    try {
      const profileResult = await fetchApi<Profile>('/api/v1/profile');
      if (profileResult.isOk()) setProfile(profileResult.value);

      const shoesResult = await fetchApi<UserShoe[]>('/api/v1/stash');
      if (shoesResult.isOk()) {
        setUserShoes(Array.isArray(shoesResult.value) ? shoesResult.value : []);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || isLoading) return <FullPageLoading />;
  if (!session?.user) { router.push('/auth/login'); return null; }

  const firstName = (profile?.name || session.user.name || 'Climber').split(' ')[0];
  const avgComfort = userShoes.length > 0
    ? (userShoes.reduce((acc, s) => acc + (s.comfortScore || 0), 0) / userShoes.length).toFixed(1)
    : '—';
  const favCount = userShoes.filter(s => s.isFavourite).length;
  const footShape = footProfile?.shape || profile?.footShape;
  const footVolume = footProfile?.volume || profile?.footVolume;
  const hasFootProfile = !!(footShape && footVolume);

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="py-4 bg-orange-500/10 backdrop-blur-sm overflow-hidden">
        <MarqueeText>YOUR GEAR • YOUR STATS • GRIP KICKS • </MarqueeText>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-12 max-w-7xl mx-auto">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-12 mb-12"
        >
          <div>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Your Dashboard</p>
            <h1 className="font-tanker text-5xl md:text-7xl lg:text-8xl leading-[0.9]">
              Hey {firstName},<br />
              <span className="text-orange-500">ready to climb?</span>
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/stash')}
            className="group flex items-center gap-3 font-tanker text-2xl text-orange-500 hover:text-orange-400 transition-colors shrink-0"
          >
            View Collection
            <div className="w-10 h-10 rounded-full border border-orange-500/30 flex items-center justify-center group-hover:border-orange-500 transition-colors">
              <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </motion.button>
        </motion.div>

        {/* Stats Bento */}
        <div className="grid grid-cols-12 gap-4 auto-rows-[140px] mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="col-span-12 md:col-span-4 row-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between"
          >
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className="font-tanker text-7xl text-white leading-none">{userShoes.length}</div>
              <p className="font-sora text-neutral-500 text-sm mt-2">Shoes in your collection</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="col-span-6 md:col-span-4 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex items-center justify-between"
          >
            <div>
              <div className="font-tanker text-4xl text-white">{favCount}</div>
              <p className="font-sora text-neutral-500 text-xs mt-1">Favorites</p>
            </div>
            <Heart className="w-8 h-8 text-orange-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="col-span-6 md:col-span-4 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex items-center justify-between"
          >
            <div>
              <div className="font-tanker text-4xl text-white">{avgComfort}</div>
              <p className="font-sora text-neutral-500 text-xs mt-1">Avg Comfort</p>
            </div>
            <Star className="w-8 h-8 text-orange-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            onClick={() => router.push('/footscan')}
            className="col-span-12 md:col-span-8 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex items-center justify-between cursor-pointer hover:border-orange-500/30 transition-all group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                <Footprints className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                {hasFootProfile ? (
                  <>
                    <div className="font-tanker text-2xl text-white capitalize">
                      {footShape} <span className="text-white/30">·</span> {footVolume} volume
                    </div>
                    <p className="font-sora text-neutral-500 text-xs mt-0.5">Your foot profile — tap to update</p>
                  </>
                ) : (
                  <>
                    <div className="font-tanker text-xl text-orange-500">Set up your foot profile</div>
                    <p className="font-sora text-neutral-500 text-xs mt-0.5">Takes 30 seconds — unlocks better matches</p>
                  </>
                )}
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-neutral-600 group-hover:text-orange-500 group-hover:rotate-45 transition-all flex-shrink-0" />
          </motion.div>
        </div>

        {/* Where to next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border-t border-white/5 pt-12 mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <h2 className="font-tanker text-4xl md:text-5xl leading-none">Where to next?</h2>
            <button
              onClick={() => router.push('/findmyshoe')}
              className="group flex items-center gap-2 font-tanker text-xl text-orange-500 hover:text-orange-400 transition-colors"
            >
              Find my shoe
              <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
            </button>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => router.push('/stash')}
              className="col-span-12 md:col-span-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-8 flex flex-col justify-between cursor-pointer group relative overflow-hidden min-h-[180px]"
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-black/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/30 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
              </div>
              <div className="relative flex justify-between items-start">
                <h3 className="font-tanker text-4xl md:text-5xl text-black">Shoe Sanctuary</h3>
                <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <ArrowUpRight className="w-6 h-6 text-black group-hover:rotate-45 transition-transform" />
                </div>
              </div>
              <p className="relative font-sora text-black/70 max-w-md">Your full climbing shoe collection</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => router.push('/findmyshoe')}
              className="col-span-6 md:col-span-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between cursor-pointer group hover:border-orange-500/30 transition-colors min-h-[180px]"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 group-hover:rotate-45 transition-all" />
              </div>
              <div>
                <h4 className="font-tanker text-xl text-white mb-1">Sole Mate</h4>
                <p className="font-sora text-neutral-500 text-xs">Discover shoes made for you</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => router.push('/footscan')}
              className="col-span-6 md:col-span-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between cursor-pointer group hover:border-orange-500/30 transition-colors min-h-[180px]"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                  <Footprints className="w-6 h-6 text-orange-500" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 group-hover:rotate-45 transition-all" />
              </div>
              <div>
                <h4 className="font-tanker text-xl text-white mb-1">Foot Scan</h4>
                <p className="font-sora text-neutral-500 text-xs">Update your foot profile</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => router.push('/matcher')}
              className="col-span-6 md:col-span-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between cursor-pointer group hover:border-orange-500/30 transition-colors min-h-[180px]"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 group-hover:rotate-45 transition-all" />
              </div>
              <div>
                <h4 className="font-tanker text-xl text-white mb-1">Radar</h4>
                <p className="font-sora text-neutral-500 text-xs">Visual shoe matcher</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Shoes */}
        {userShoes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="border-t border-white/5 pt-12"
          >
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-tanker text-4xl md:text-5xl leading-none">Recent Shoes</h2>
              {userShoes.length > 3 && (
                <button
                  onClick={() => router.push('/stash')}
                  className="group flex items-center gap-2 font-tanker text-xl text-orange-500 hover:text-orange-400 transition-colors"
                >
                  View all
                  <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                </button>
              )}
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
              <div className="space-y-3">
                {userShoes.slice(0, 3).map((shoe, index) => {
                  const details = shoe.shoe ?? shoe.shoeDetails;
                  const brand = details?.brand ?? 'Unknown Brand';
                  const name = details?.name ?? 'Unknown Shoe';
                  const imageUrl = details?.imageUrl;
                  const slug = details?.slug;
                  const gender = details?.gender;

                  return (
                    <motion.div
                      key={shoe._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      onClick={() => router.push('/stash')}
                      className="flex items-center justify-between p-4 rounded-2xl bg-neutral-800/50 hover:bg-neutral-800 border border-transparent hover:border-orange-500/10 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                          <ShoeImage
                            brand={brand}
                            shoeName={name}
                            imageUrl={imageUrl}
                            slug={slug}
                            className="p-2"
                            transformation={[{ height: 56, width: 56, crop: "at_max", cropMode: "pad_resize", format: "png", quality: 75 }]}
                            gender={gender}
                          />
                        </div>
                        <div>
                          <h3 className="font-sora font-medium text-white group-hover:text-orange-500 transition-colors">{name}</h3>
                          <p className="font-sora text-[10px] text-neutral-600">{brand}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                            <span className="font-sora text-xs text-neutral-400">{shoe.comfortScore || 0}</span>
                          </div>
                          <span className="font-sora text-[10px] text-neutral-600">Comfort</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-orange-500 group-hover:rotate-45 transition-all" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {userShoes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="border-t border-white/5 pt-16 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Plus className="w-10 h-10 text-orange-500" />
            </motion.div>
            <h3 className="font-tanker text-4xl text-white mb-3">NO SHOES YET</h3>
            <p className="font-sora text-neutral-500 mb-8 max-w-sm mx-auto">
              Add your shoes so we can start figuring out what fits you best
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/stash')}
              className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg px-8 py-3 rounded-2xl transition-colors"
            >
              ADD YOUR FIRST SHOE
            </motion.button>
          </motion.div>
        )}
      </section>

      <section className="py-8 bg-orange-500 overflow-hidden mt-16">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap"
        >
          {Array(10).fill(null).map((_, i) => (
            <span key={i} className="font-tanker text-2xl text-black/80">
              SCAN • MATCH • CLIMB • REPEAT •
            </span>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
