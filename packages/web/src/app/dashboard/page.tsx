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
  Activity,
  Heart,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/api-client';
import type { UserShoe } from '@/types/api';
import { FullPageLoading } from '@/components/ui/loading';
import ShoeImage from '@/components/ShoeImage';

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

  useEffect(() => {
    if (!isPending && session?.user) {
      loadUserData();
    }
  }, [session, isPending]);

  const loadUserData = async () => {
    try {
      const profileResult = await fetchApi<Profile>('/api/v1/profile');
      if (profileResult.isOk()) {
        setProfile(profileResult.value);
      }

      const shoesResult = await fetchApi<UserShoe[]>('/api/v1/stash');
      if (shoesResult.isOk()) {
        setUserShoes(shoesResult.value);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || isLoading) {
    return <FullPageLoading />;
  }

  if (!session?.user) {
    router.push('/auth/login');
    return null;
  }

  const userName = profile?.name || session.user.name || 'Climber';
  const avgComfort = userShoes.length > 0 
    ? (userShoes.reduce((acc, shoe) => acc + (shoe.comfortScore || 0), 0) / userShoes.length).toFixed(1)
    : '-';
  const favCount = userShoes.filter(shoe => shoe.isFavourite).length;

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Marquee */}
      <section className="py-4 bg-orange-500/10 backdrop-blur-sm">
        <MarqueeText>DASHBOARD • YOUR STATS • GRIP KICKS • </MarqueeText>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="font-mono text-xs text-orange-500 mb-2 tracking-[0.3em]">[DASHBOARD]</p>
            <h1 className="font-tanker text-5xl md:text-7xl lg:text-8xl">
              Hey {userName.split(' ')[0]},<br />
              <span className="text-orange-500">ready to climb?</span>
            </h1>
          </motion.div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-12 gap-4 auto-rows-[140px] mb-12">
            {/* Total Shoes - Large */}
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
                <div className="font-tanker text-5xl text-white">{userShoes.length}</div>
                <p className="font-sora text-neutral-500 text-sm mt-1">Total Shoes</p>
              </div>
            </motion.div>

            {/* Favorites */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="col-span-6 md:col-span-4 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex items-center justify-between"
            >
              <div>
                <div className="font-tanker text-3xl text-white">{favCount}</div>
                <p className="font-sora text-neutral-500 text-xs">Favorites</p>
              </div>
              <Heart className="w-8 h-8 text-orange-500" />
            </motion.div>

            {/* Avg Comfort */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="col-span-6 md:col-span-4 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex items-center justify-between"
            >
              <div>
                <div className="font-tanker text-3xl text-white">{avgComfort}</div>
                <p className="font-sora text-neutral-500 text-xs">Avg Comfort</p>
              </div>
              <Star className="w-8 h-8 text-orange-500" />
            </motion.div>

            {/* Foot Shape */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-span-6 md:col-span-4 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex items-center justify-between"
            >
              <div>
                <div className="font-tanker text-2xl text-white capitalize">{profile?.footShape || 'Not set'}</div>
                <p className="font-sora text-neutral-500 text-xs">Foot Shape</p>
              </div>
              <Footprints className="w-8 h-8 text-orange-500" />
            </motion.div>

            {/* Match Accuracy */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="col-span-6 md:col-span-4 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex items-center justify-between"
            >
              <div>
                <div className="font-tanker text-3xl text-white">98%</div>
                <p className="font-sora text-neutral-500 text-xs">Match Accuracy</p>
              </div>
              <Zap className="w-8 h-8 text-orange-500" />
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <p className="font-mono text-xs text-orange-500 mb-4 tracking-[0.3em]">[QUICK_ACTIONS]</p>
            <div className="grid grid-cols-12 gap-4">
              {/* Shoe Sanctuary CTA */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/stash')}
                className="col-span-12 md:col-span-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-8 flex flex-col justify-between cursor-pointer group relative overflow-hidden min-h-[180px]"
              >
                <motion.div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, black 10px, black 20px)'
                  }}
                  animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative flex justify-between items-start">
                  <div>
                    <p className="font-mono text-[10px] text-black/60 mb-2">[COLLECTION]</p>
                    <h3 className="font-tanker text-4xl md:text-5xl text-black">Shoe Sanctuary</h3>
                  </div>
                  <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <ArrowUpRight className="w-6 h-6 text-black group-hover:rotate-45 transition-transform" />
                  </div>
                </div>
                <p className="relative font-sora text-black/70 max-w-md">
                  View and manage your climbing shoe collection
                </p>
              </motion.div>

              {/* Find Matches */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                  <h4 className="font-tanker text-xl text-white mb-1">Find Matches</h4>
                  <p className="font-sora text-neutral-500 text-xs">Discover shoes for you</p>
                </div>
              </motion.div>

              {/* Foot Lab */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/footchecker')}
                className="col-span-6 md:col-span-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between cursor-pointer group hover:border-orange-500/30 transition-colors min-h-[180px]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                    <Footprints className="w-6 h-6 text-orange-500" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 group-hover:rotate-45 transition-all" />
                </div>
                <div>
                  <h4 className="font-tanker text-xl text-white mb-1">Foot Profile</h4>
                  <p className="font-sora text-neutral-500 text-xs">Update measurements</p>
                </div>
              </motion.div>

              {/* Profile */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/profile')}
                className="col-span-6 md:col-span-4 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between cursor-pointer group hover:border-orange-500/30 transition-colors min-h-[180px]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-500" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 group-hover:rotate-45 transition-all" />
                </div>
                <div>
                  <h4 className="font-tanker text-xl text-white mb-1">Account</h4>
                  <p className="font-sora text-neutral-500 text-xs">Manage your profile</p>
                </div>
              </motion.div>

              {/* 3D Selector */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/selector')}
                className="col-span-6 md:col-span-4 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-3xl p-6 flex flex-col justify-between cursor-pointer group hover:border-orange-500/50 transition-all min-h-[180px]"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-orange-500">[INTERACTIVE]</span>
                  <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 group-hover:rotate-45 transition-all" />
                </div>
                <div>
                  <h4 className="font-tanker text-2xl text-white mb-1">3D Selector</h4>
                  <p className="font-sora text-neutral-500 text-xs">Explore shoes in 3D</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Shoes */}
          {userShoes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="font-mono text-xs text-orange-500 mb-4 tracking-[0.3em]">[RECENT_SHOES]</p>
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                <div className="space-y-4">
                  {userShoes.slice(0, 3).map((shoe, index) => (
                    <motion.div
                      key={shoe._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => router.push('/stash')}
                      className="flex items-center justify-between p-4 rounded-2xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-orange-500/20 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-neutral-900 rounded-xl overflow-hidden flex-shrink-0">
                          <ShoeImage
                            brand={shoe.shoe.brand}
                            shoeName={shoe.shoe.name}
                            imageUrl={shoe.shoe.imageUrl}
                            className="w-full h-full object-contain p-2"
                            transformation={[{ height: 56, width: 56, format: "auto", quality: 75 }]}
                          />
                        </div>
                        <div>
                          <h3 className="font-sora font-medium text-white group-hover:text-orange-500 transition-colors">{shoe.shoe.name}</h3>
                          <p className="font-mono text-[10px] text-neutral-600">{shoe.shoe.brand}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                            <span className="font-mono text-xs text-neutral-400">{shoe.comfortScore || 0}</span>
                          </div>
                          <span className="font-mono text-[10px] text-neutral-600">COMFORT</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-orange-500 group-hover:rotate-45 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
                {userShoes.length > 3 && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => router.push('/stash')}
                    className="w-full mt-4 py-3 rounded-2xl border border-neutral-800 hover:border-orange-500/30 text-neutral-400 hover:text-orange-500 font-sora text-sm transition-all flex items-center justify-center gap-2"
                  >
                    View All Shoes
                    <ArrowUpRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {userShoes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Plus className="w-10 h-10 text-orange-500" />
              </motion.div>
              <h3 className="font-tanker text-3xl text-white mb-2">NO SHOES YET</h3>
              <p className="font-sora text-neutral-500 mb-6">
                Start tracking your climbing shoes to get personalized recommendations
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
        </div>
      </section>

      {/* Bottom Marquee */}
      <section className="py-8 bg-orange-500 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap"
        >
          {Array(10).fill(null).map((_, i) => (
            <span key={i} className="font-tanker text-2xl text-black/80">
              TRACK • ANALYZE • CLIMB • REPEAT • 
            </span>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
