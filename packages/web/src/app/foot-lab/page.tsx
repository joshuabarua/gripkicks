'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import FootModelViewer from '@/components/FootModelViewer';
import { useFootProfileStore } from '@/stores/footProfileStore';
import { ArrowUpRight, Footprints, Pencil, Sparkles, X } from 'lucide-react';

const footShapeInfo: Record<string, { description: string; characteristics: string[]; bestFor: string }> = {
  Egyptian: {
    description: 'Big toe is the longest, toes descend gradually in length.',
    characteristics: ['Big toe longest', 'Gradual taper', 'Most common (70%)', 'Asymmetric profile'],
    bestFor: 'Asymmetric shoes with a pointed last',
  },
  Roman: {
    description: 'First two or three toes are similar in length, creating a square front.',
    characteristics: ['First 2–3 toes equal', 'Square forefoot', 'Balanced pressure', 'Common in Europeans'],
    bestFor: 'Symmetric shoes with an even toe box',
  },
  Greek: {
    description: "Second toe is longer than the big toe — Morton's toe.",
    characteristics: ['Second toe longest', 'Needs wider box', 'Pressure on second toe', 'Less common'],
    bestFor: 'Shoes with a roomier, elevated toe box',
  },
  Germanic: {
    description: 'Big toe dominant with other toes at similar length; broad forefoot.',
    characteristics: ['Big toe dominant', 'Other toes similar', 'Broad forefoot', 'Needs width'],
    bestFor: 'Wide-fit shoes with a flat last',
  },
  Celtic: {
    description: 'Wide forefoot with relatively even toe length distribution.',
    characteristics: ['Wide forefoot', 'Even toe lengths', 'High arch common', 'Needs volume'],
    bestFor: 'High-volume, wide-fit shoes',
  },
};

const volumeInfo: Record<string, { description: string; tip: string }> = {
  Low: {
    description: 'Narrow foot with a low instep.',
    tip: 'Look for a tight heel cup and thin lining. Avoid slingbacks.',
  },
  Medium: {
    description: 'Standard foot width and height.',
    tip: 'Wide selection available — focus on shape match over volume.',
  },
  High: {
    description: 'Wide foot or high instep.',
    tip: 'Prioritise high-volume lasts. Avoid narrow slingshot closures.',
  },
};

export default function FootLabPage() {
  const router = useRouter();
  const { profile } = useFootProfileStore();
  const [showModel, setShowModel] = useState(false);

  const soleMateCount = useQuery(
    api.stash.getSoleMateUserCount,
    profile?.shape && profile?.volume
      ? { footShape: profile.shape.toLowerCase(), footVolume: profile.volume.toLowerCase() }
      : 'skip',
  );

  const shapeInfo = profile?.shape ? footShapeInfo[profile.shape] : null;
  const volInfo = profile?.volume ? volumeInfo[profile.volume] : null;

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="px-6 md:px-12 lg:px-16 py-12 max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <p className="font-mono text-xs text-orange-500 mb-3 tracking-[0.3em]">[FOOT_LAB]</p>
          <h1 className="font-tanker text-6xl md:text-8xl leading-none">
            FOOT <span className="text-orange-500">LAB</span>
          </h1>
        </motion.div>

        {profile ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-12 gap-4 mb-6 auto-rows-[140px]"
            >
              <div className="col-span-12 md:col-span-5 row-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between">
                <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[FOOT_SHAPE]</p>
                <div>
                  <div className="font-tanker text-6xl text-white leading-none mb-2">{profile.shape}</div>
                  <p className="font-sora text-sm text-neutral-400 leading-relaxed">{shapeInfo?.description}</p>
                </div>
              </div>

              <div className="col-span-6 md:col-span-4 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between">
                <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[VOLUME]</p>
                <div>
                  <div className="font-tanker text-3xl text-white">{profile.volume}</div>
                  <p className="font-sora text-xs text-neutral-500 mt-1">{volInfo?.description}</p>
                </div>
              </div>

              <div className="col-span-6 md:col-span-3 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between">
                <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[SOLE_MATES]</p>
                <div className="flex items-end gap-2">
                  <div className="font-tanker text-4xl text-white">{soleMateCount ?? '—'}</div>
                  <p className="font-sora text-xs text-neutral-500 mb-1">members</p>
                </div>
              </div>

              <div className="col-span-6 md:col-span-4 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between">
                <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[BEST_FOR]</p>
                <p className="font-sora text-sm text-neutral-300 leading-snug">{shapeInfo?.bestFor}</p>
              </div>

              <div className="col-span-6 md:col-span-3 row-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between">
                <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[FIT_TIP]</p>
                <p className="font-sora text-xs text-neutral-400 leading-relaxed">{volInfo?.tip}</p>
              </div>
            </motion.div>

            {shapeInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6"
              >
                <p className="font-mono text-xs text-orange-500 mb-4 tracking-[0.3em]">[SHAPE_TRAITS]</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {shapeInfo.characteristics.map((trait) => (
                    <div
                      key={trait}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 font-sora text-sm text-neutral-300"
                    >
                      {trait}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/footchecker')}
                className="bg-neutral-900 border border-neutral-800 hover:border-orange-500/40 rounded-3xl p-6 flex items-center justify-between cursor-pointer group transition-colors"
              >
                <div>
                  <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-1">[UPDATE]</p>
                  <h3 className="font-tanker text-xl text-white">Update Profile</h3>
                  <p className="font-sora text-xs text-neutral-500 mt-1">Change shape or volume</p>
                </div>
                <Pencil className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 transition-colors" />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModel(true)}
                className="bg-neutral-900 border border-neutral-800 hover:border-orange-500/40 rounded-3xl p-6 flex items-center justify-between cursor-pointer group transition-colors"
              >
                <div>
                  <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-1">[VISUALISE]</p>
                  <h3 className="font-tanker text-xl text-white">3D Foot Model</h3>
                  <p className="font-sora text-xs text-neutral-500 mt-1">Interactive viewer</p>
                </div>
                <Sparkles className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 transition-colors" />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/findmyshoe')}
                className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 flex items-center justify-between cursor-pointer group relative overflow-hidden"
              >
                <div className="relative">
                  <p className="font-mono text-[10px] text-black/60 tracking-[0.2em] mb-1">[MATCH]</p>
                  <h3 className="font-tanker text-xl text-black">Find My Shoe</h3>
                  <p className="font-sora text-xs text-black/60 mt-1">Shoes for your profile</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-black/70 group-hover:rotate-45 transition-transform" />
              </motion.div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6"
            >
              <Footprints className="w-10 h-10 text-orange-500" />
            </motion.div>
            <h2 className="font-tanker text-4xl mb-3">NO PROFILE SET</h2>
            <p className="font-sora text-neutral-500 max-w-sm mb-8 leading-relaxed">
              Set your foot shape and volume to unlock personalised shoe matching and Sole Mate insights.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/footchecker')}
              className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg px-8 py-3 rounded-2xl transition-colors"
            >
              SET UP FOOT PROFILE
            </motion.button>
          </motion.div>
        )}
      </section>

      {showModel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-30"
        >
          <FootModelViewer
            shape={profile?.shape?.toLowerCase() ?? 'medium'}
            volume={profile?.volume?.toLowerCase() ?? 'medium'}
            onShapeChange={() => {}}
            onVolumeChange={() => {}}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowModel(false)}
            className="absolute top-6 right-6 z-40 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 text-white p-3 rounded-2xl hover:border-orange-500/30 transition-all"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </motion.div>
      )}
    </main>
  );
}
