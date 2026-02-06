'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from '@/lib/auth';
import { fetchApi } from '@/lib/api-client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Star, Users, TrendingUp, Footprints, ArrowUpRight } from 'lucide-react';
import { FullPageLoading } from '@/components/ui/loading';

interface UserProfile {
  footShape?: string;
  footVolume?: string;
  onboardingComplete: boolean;
}

interface Shoe {
  _id: string;
  name: string;
  brand: string;
  imageUrl?: string;
}

interface AggregatedRating {
  shoe: Shoe;
  avgComfortScore: number;
  avgPerformanceRating: number;
  avgDurabilityRating: number;
  totalRatings: number;
  matchScore: number;
  isSoleSibling: boolean;
}

const categories = [
  { key: 'all', label: 'Overall' },
  { key: 'comfort', label: 'Comfort' },
  { key: 'performance', label: 'Performance' },
  { key: 'durability', label: 'Durability' },
] as const;

type Category = typeof categories[number]['key'];

export default function SoleMatePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  useEffect(() => {
    if (session?.user) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    try {
      const response = await fetchApi<UserProfile>('/api/v1/profile');
      if (response.isOk()) {
        setProfile(response.value);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockAggregatedRatings: AggregatedRating[] = [
    {
      shoe: { _id: '1', name: 'Testarossa', brand: 'La Sportiva', imageUrl: '/shoes/testarossa.jpg' },
      avgComfortScore: 8.5,
      avgPerformanceRating: 9.2,
      avgDurabilityRating: 7.8,
      totalRatings: 45,
      matchScore: 92,
      isSoleSibling: true
    },
    {
      shoe: { _id: '2', name: 'Solution', brand: 'La Sportiva', imageUrl: '/shoes/solution.jpg' },
      avgComfortScore: 7.2,
      avgPerformanceRating: 9.5,
      avgDurabilityRating: 8.1,
      totalRatings: 38,
      matchScore: 88,
      isSoleSibling: false
    },
  ];

  const filteredRatings = useMemo(() => {
    let filtered = mockAggregatedRatings;

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.shoe.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.sort((a, b) => {
        switch (selectedCategory) {
          case 'comfort':
            return b.avgComfortScore - a.avgComfortScore;
          case 'performance':
            return b.avgPerformanceRating - a.avgPerformanceRating;
          case 'durability':
            return b.avgDurabilityRating - a.avgDurabilityRating;
          default:
            return b.matchScore - a.matchScore;
        }
      });
    }

    return filtered;
  }, [mockAggregatedRatings, searchQuery, selectedCategory]);

  if (loading) {
    return <FullPageLoading text="Finding Matches" />;
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Footprints className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="font-tanker text-4xl mb-2">SOLE MATE</h1>
          <p className="font-sora text-neutral-500 mb-6">Please log in to find your perfect match</p>
          <Link href="/auth/login">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg px-8 py-3 rounded-2xl transition-colors">
              LOG IN
            </motion.button>
          </Link>
        </div>
      </main>
    );
  }

  if (!profile?.onboardingComplete) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Footprints className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="font-tanker text-4xl mb-2">COMPLETE YOUR PROFILE</h1>
          <p className="font-sora text-neutral-500 mb-8">Set up your foot profile and add at least one shoe to get personalized recommendations</p>
          <div className="space-y-3">
            <Link href="/footchecker" className="block">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg py-3 rounded-2xl transition-colors flex items-center justify-center gap-2">
                GO TO FOOT LAB <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/stash" className="block">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full border border-neutral-700 hover:border-orange-500/30 text-neutral-400 hover:text-orange-500 font-sora text-sm py-3 rounded-2xl transition-all">
                Add Shoes to Collection
              </motion.button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <p className="font-mono text-xs text-orange-500 mb-2 tracking-[0.3em]">[SOLE_MATE]</p>
            <h1 className="font-tanker text-6xl md:text-8xl mb-4">
              FIND YOUR<br /><span className="text-orange-500">MATCH</span>
            </h1>
            <p className="font-sora text-lg text-neutral-400 max-w-2xl mx-auto">
              Discover your perfect climbing shoe based on community insights
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search shoes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-sora"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-5 py-3 rounded-xl font-sora text-sm whitespace-nowrap transition-all ${
                      selectedCategory === cat.key
                        ? 'bg-orange-500 text-black font-medium'
                        : 'bg-neutral-800 border border-neutral-700 text-neutral-400 hover:border-orange-500/30'
                    }`}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sole Sibling Spotlight */}
          {filteredRatings.some(r => r.isSoleSibling) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="font-tanker text-xl text-white">SOLE SIBLING SPOTLIGHT</h2>
                    <p className="font-sora text-xs text-neutral-400">Climbers with your exact foot profile love these shoes!</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredRatings.filter(r => r.isSoleSibling).map((rating) => (
                    <motion.div
                      key={rating.shoe._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-neutral-800 rounded-xl flex items-center justify-center">
                          <Footprints className="w-7 h-7 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-sora font-semibold text-white">{rating.shoe.name}</h3>
                          <p className="font-mono text-[10px] text-neutral-500">{rating.shoe.brand}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-orange-500/20 text-orange-500 font-mono text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-orange-500" /> {rating.matchScore}% MATCH
                            </span>
                            <span className="font-mono text-[10px] text-neutral-600">{rating.totalRatings} reviews</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="font-mono text-[10px] text-neutral-600 mb-1">AVG RATINGS</p>
                        <div className="flex gap-3">
                          <div><span className="font-tanker text-lg text-white">{rating.avgComfortScore.toFixed(1)}</span><span className="font-mono text-[10px] text-neutral-600 ml-1">C</span></div>
                          <div><span className="font-tanker text-lg text-white">{rating.avgPerformanceRating.toFixed(1)}</span><span className="font-mono text-[10px] text-neutral-600 ml-1">P</span></div>
                          <div><span className="font-tanker text-lg text-white">{rating.avgDurabilityRating.toFixed(1)}</span><span className="font-mono text-[10px] text-neutral-600 ml-1">D</span></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* All Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="font-tanker text-2xl text-white">ALL RECOMMENDATIONS</h2>
            </div>
            <div className="space-y-3">
              {filteredRatings.filter(r => !r.isSoleSibling).map((rating, index) => (
                <motion.div
                  key={rating.shoe._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-orange-500/20 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-neutral-800 rounded-xl flex items-center justify-center">
                      <Footprints className="w-7 h-7 text-neutral-600 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-sora font-semibold text-white group-hover:text-orange-500 transition-colors">{rating.shoe.name}</h3>
                      <p className="font-mono text-[10px] text-neutral-500">{rating.shoe.brand}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-neutral-800 text-neutral-400 font-mono text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> {rating.matchScore}% MATCH
                        </span>
                        <span className="font-mono text-[10px] text-neutral-600">{rating.totalRatings} reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="font-mono text-[10px] text-neutral-600 mb-1">AVG RATINGS</p>
                    <div className="flex gap-3">
                      <div><span className="font-tanker text-lg text-white">{rating.avgComfortScore.toFixed(1)}</span><span className="font-mono text-[10px] text-neutral-600 ml-1">C</span></div>
                      <div><span className="font-tanker text-lg text-white">{rating.avgPerformanceRating.toFixed(1)}</span><span className="font-mono text-[10px] text-neutral-600 ml-1">P</span></div>
                      <div><span className="font-tanker text-lg text-white">{rating.avgDurabilityRating.toFixed(1)}</span><span className="font-mono text-[10px] text-neutral-600 ml-1">D</span></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
