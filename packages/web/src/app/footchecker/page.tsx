'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Check, Footprints } from 'lucide-react';
import { useSession } from '@/lib/auth';
import { fetchApi } from '@/lib/api-client';
import { normalizeBackendFootProfile, useFootProfileStore } from '@/stores/footProfileStore';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Link from 'next/link';

type FootShape = 'egyptian' | 'roman' | 'greek' | 'germanic' | 'celtic';
type FootVolume = 'low' | 'medium' | 'high';

// Zod schema for foot profile validation
const footProfileSchema = z.object({
  footShape: z.enum(['egyptian', 'roman', 'greek', 'germanic', 'celtic']),
  footVolume: z.enum(['low', 'medium', 'high']),
});

const footShapeInfo: Record<FootShape, { name: string; description: string; characteristics: string[] }> = {
  egyptian: {
    name: 'Egyptian',
    description: 'Big toe is the longest, toes descend in length',
    characteristics: [
      'Big toe longest',
      'Gradual toe length decrease',
      'Common foot type (70%)',
      'Best for: Asymmetric shoes'
    ]
  },
  roman: {
    name: 'Roman',
    description: 'First three toes are similar length',
    characteristics: [
      'First 2-3 toes equal length',
      'Square foot shape',
      'Common in Europeans',
      'Best for: Symmetric shoes'
    ]
  },
  greek: {
    name: 'Greek',
    description: 'Second toe is longer than the big toe',
    characteristics: [
      'Second toe longest (Morton\'s toe)',
      'Often needs wider shoes',
      'Pressure on second toe',
      'Best for: Shoes with roomier toe box'
    ]
  },
  germanic: {
    name: 'Germanic',
    description: 'Big toe is longest, other toes are similar length',
    characteristics: [
      'Big toe dominant',
      'Other toes similar length',
      'Broad foot shape',
      'Best for: Wide-fit shoes'
    ]
  },
  celtic: {
    name: 'Celtic',
    description: 'Second toe longest, big toe and third toe similar',
    characteristics: [
      'Second and third toes long',
      'Big toe slightly shorter',
      'Unique foot shape',
      'Best for: Asymmetric with extra room'
    ]
  },
};

const footVolumeInfo: Record<FootVolume, { name: string; description: string; characteristics: string[] }> = {
  low: {
    name: 'Low Volume',
    description: 'Narrow foot with minimal height',
    characteristics: [
      'Narrow foot width',
      'Low instep/arch',
      'Often needs tighter shoes',
      'Best for: Performance shoes with snug fit'
    ]
  },
  medium: {
    name: 'Medium Volume',
    description: 'Average foot width and height',
    characteristics: [
      'Average foot width',
      'Moderate instep/arch',
      'Fits most standard shoes',
      'Best for: All-around climbing shoes'
    ]
  },
  high: {
    name: 'High Volume',
    description: 'Wide foot with significant height',
    characteristics: [
      'Wide foot width',
      'High instep/arch',
      'Often needs roomier shoes',
      'Best for: Comfort-focused or wide-fit shoes'
    ]
  },
};

export default function FootLabPage() {
  const { data: session } = useSession();
  const setProfile = useFootProfileStore((state) => state.setProfile);
  const [selectedFootShape, setSelectedFootShape] = useState<FootShape | null>(null);
  const [selectedFootVolume, setSelectedFootVolume] = useState<FootVolume | null>(null);
  const [savedFootShape, setSavedFootShape] = useState<FootShape | null>(null);
  const [savedFootVolume, setSavedFootVolume] = useState<FootVolume | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's current foot shape on mount
  const loadUserFootProfile = useCallback(async () => {
    try {
      const response = await fetchApi<{ footShape?: string; footVolume?: string }>('/api/v1/profile');
      if (response.isOk()) {
        const data = response.value;
        const normalizedProfile = normalizeBackendFootProfile(data);

        if (normalizedProfile) {
          setProfile(normalizedProfile);
        }

        if (data.footShape) {
          setSavedFootShape(data.footShape as FootShape);
          setSelectedFootShape(data.footShape as FootShape);
        }
        if (data.footVolume) {
          setSavedFootVolume(data.footVolume as FootVolume);
          setSelectedFootVolume(data.footVolume as FootVolume);
        }
      }
    } catch (error) {
      console.error('Failed to load foot profile:', error);
    }
  }, [setProfile]);

  useEffect(() => {
    if (session?.user) {
      loadUserFootProfile();
    }
  }, [loadUserFootProfile, session]);

  const saveFootProfile = async () => {
    if (!selectedFootShape || !selectedFootVolume || !session?.user) {
      setError('Please select both foot shape and volume');
      return;
    }

    // Validate with Zod
    const validationResult = footProfileSchema.safeParse({
      footShape: selectedFootShape,
      footVolume: selectedFootVolume,
    });
    
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      setError(firstError.message);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await fetchApi<{ footShape?: string; footVolume?: string }>('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({ 
          footShape: selectedFootShape,
          footVolume: selectedFootVolume,
        }),
      });

      if (result.isErr()) {
        setError(result.error.message || 'Failed to save foot profile');
        return;
      }

      const normalizedProfile = normalizeBackendFootProfile({
        footShape: result.value.footShape || selectedFootShape,
        footVolume: result.value.footVolume || selectedFootVolume,
      });

      if (normalizedProfile) {
        setProfile(normalizedProfile);
      }

      setSavedFootShape((result.value.footShape as FootShape) || selectedFootShape);
      setSavedFootVolume((result.value.footVolume as FootVolume) || selectedFootVolume);
    } catch (error) {
      console.error('Failed to save foot profile:', error);
      setError('Failed to save foot profile');
    } finally {
      setSaving(false);
    }
  };

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Footprints className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="font-tanker text-4xl mb-2">FOOT LAB</h1>
          <p className="font-sora text-neutral-500 mb-6">Log in to discover your foot shape</p>
          <Link href="/auth/login">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg px-8 py-3 rounded-2xl transition-colors">
              LOG IN
            </motion.button>
          </Link>
        </div>
      </main>
    );
  }

  const toeHeights: Record<FootShape, number[]> = {
    egyptian: [12, 10, 8, 6, 4],
    roman: [10, 10, 9, 7, 5],
    greek: [10, 12, 9, 7, 5],
    germanic: [11, 8, 8, 8, 7],
    celtic: [10, 11, 11, 8, 6],
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <p className="font-mono text-xs text-orange-500 mb-2 tracking-[0.3em]">[FOOT_CHECKER]</p>
            <h1 className="font-tanker text-6xl md:text-8xl mb-4">
              FOOT<br /><span className="text-orange-500">LAB</span>
            </h1>
            <p className="font-sora text-lg text-neutral-400">
              Discover your foot shape for better shoe recommendations
            </p>
          </motion.div>

          {/* Foot Shape Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[SELECT_SHAPE]</p>
              {savedFootShape && (
                <span className="font-mono text-[10px] text-green-500 flex items-center gap-1">
                  <Check className="w-3 h-3" /> SAVED: {footShapeInfo[savedFootShape].name}
                </span>
              )}
            </div>
            <h2 className="font-tanker text-2xl mb-1">FOOT SHAPE</h2>
            <p className="font-sora text-neutral-500 text-sm mb-6">
              Look at your foot and compare it to the shapes below.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(footShapeInfo) as FootShape[]).map((shape) => (
                <motion.button
                  key={shape}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedFootShape(shape)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedFootShape === shape
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-sora font-semibold text-white">{footShapeInfo[shape].name}</h3>
                    {selectedFootShape === shape && (
                      <Check className="h-4 w-4 text-orange-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="font-sora text-xs text-neutral-500 mb-3">{footShapeInfo[shape].description}</p>
                  <ul className="space-y-1">
                    {footShapeInfo[shape].characteristics.map((char, idx) => (
                      <li key={idx} className="font-sora text-[10px] text-neutral-600 flex items-start gap-1">
                        <span className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                        {char}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-neutral-700/50">
                    <div className="flex justify-center items-end h-14 gap-0.5">
                      {toeHeights[shape].map((h, i) => (
                        <div
                          key={i}
                          className={`w-3 rounded-t transition-all ${
                            selectedFootShape === shape ? 'bg-orange-500' : 'bg-neutral-600'
                          }`}
                          style={{ height: `${(h / 12) * 100}%`, opacity: 1 - i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Foot Volume Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em]">[SELECT_VOLUME]</p>
              {savedFootVolume && (
                <span className="font-mono text-[10px] text-green-500 flex items-center gap-1">
                  <Check className="w-3 h-3" /> SAVED: {footVolumeInfo[savedFootVolume].name}
                </span>
              )}
            </div>
            <h2 className="font-tanker text-2xl mb-1">FOOT VOLUME</h2>
            <p className="font-sora text-neutral-500 text-sm mb-6">
              Foot volume refers to the overall height and width of your foot, including your instep.
            </p>
            <div className="grid gap-4">
              {Object.entries(footVolumeInfo).map(([volume, info]) => (
                <motion.button
                  key={volume}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedFootVolume(volume as FootVolume)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedFootVolume === volume
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-sora font-semibold text-white">{info.name}</h3>
                      <p className="font-sora text-xs text-neutral-500 mt-1">{info.description}</p>
                    </div>
                    {selectedFootVolume === volume && (
                      <Check className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <ul className="mt-3 space-y-1">
                    {info.characteristics.map((char, idx) => (
                      <li key={idx} className="font-sora text-[10px] text-neutral-600 flex items-center gap-2">
                        <span className="w-1 h-1 bg-orange-500 rounded-full" />
                        {char}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm font-sora bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">{error}</div>
          )}

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveFootProfile}
              disabled={!selectedFootShape || !selectedFootVolume || saving || 
                (selectedFootShape === savedFootShape && selectedFootVolume === savedFootVolume)}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-tanker text-xl px-12 py-4 rounded-2xl transition-colors flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : selectedFootShape === savedFootShape && selectedFootVolume === savedFootVolume ? (
                <>
                  <Check className="w-5 h-5" />
                  SAVED
                </>
              ) : (
                'SAVE PROFILE'
              )}
            </motion.button>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8"
          >
            <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-2">[WHY_IT_MATTERS]</p>
            <h2 className="font-tanker text-2xl mb-4">WHY YOUR FOOT SHAPE MATTERS</h2>
            <p className="font-sora text-neutral-500 text-sm mb-4">
              Understanding your foot shape helps us recommend climbing shoes that will:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Fit your toes comfortably without pressure',
                'Provide optimal power transfer',
                'Prevent toe pain and injuries',
                'Improve climbing performance',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="font-sora text-sm text-neutral-400">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
