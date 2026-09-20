'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Check, Footprints } from 'lucide-react';
import { useSession } from '@/lib/auth';
import { fetchApi } from '@/lib/api-client';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FootShape = 'egyptian' | 'roman' | 'greek' | 'germanic' | 'celtic';
type FootVolume = 'low' | 'medium' | 'high';

// Zod schema for foot profile validation
const footProfileSchema = z.object({
  footShape: z.enum(['egyptian', 'roman', 'greek', 'germanic', 'celtic']),
  footVolume: z.enum(['low', 'medium', 'high']),
});

const footShapeInfo: Record<FootShape, { name: string; description: string; fit: string }> = {
  egyptian: {
    name: 'Egyptian',
    description: 'Big toe longest, toes descend in a clean slope',
    fit: 'Best in asymmetric shoes',
  },
  roman: {
    name: 'Roman',
    description: 'First three toes roughly equal length',
    fit: 'Best in symmetric shoes',
  },
  greek: {
    name: 'Greek',
    description: 'Second toe longer than the big toe',
    fit: 'Best with a roomy toe box',
  },
  germanic: {
    name: 'Germanic',
    description: 'Big toe dominant, rest similar length',
    fit: 'Best in wide-fit shoes',
  },
  celtic: {
    name: 'Celtic',
    description: 'Second and third toes longest',
    fit: 'Best in asymmetric with extra room',
  },
};

const footVolumeInfo: Record<FootVolume, { name: string; description: string; fit: string }> = {
  low: {
    name: 'Low',
    description: 'Narrow foot, low instep — looks slim from the side',
    fit: 'Performance shoes with a snug fit',
  },
  medium: {
    name: 'Medium',
    description: 'Average width and height — most standard shoes work',
    fit: 'All-around climbing shoes',
  },
  high: {
    name: 'High',
    description: 'Wide foot with high instep — looks full from the side',
    fit: 'Comfort or wide-fit shoes',
  },
};

const TOE_HEIGHTS: Record<FootShape, number[]> = {
  egyptian: [12, 10, 8, 6, 4],
  roman: [10, 10, 9, 7, 5],
  greek: [10, 12, 9, 7, 5],
  germanic: [11, 8, 8, 8, 7],
  celtic: [10, 11, 11, 8, 6],
};

const VOLUME_ARCH: Record<FootVolume, string> = {
  low: 'M 8,44 C 30,37 50,37 72,44',
  medium: 'M 8,44 C 22,18 58,18 72,44',
  high: 'M 8,44 C 15,2 65,2 72,44',
};

function ToeProfile({ shape, active }: { shape: FootShape; active: boolean }) {
  const heights = TOE_HEIGHTS[shape];
  return (
    <svg viewBox="0 0 100 66" className="w-full" style={{ height: 72 }}>
      {heights.map((h, i) => {
        const barH = (h / 12) * 58;
        return (
          <rect
            key={i}
            x={i * 19 + 4}
            y={62 - barH}
            width={14}
            height={barH}
            rx={7}
            className={`transition-colors duration-300 ${active ? 'fill-brand-red' : 'fill-neutral-700'
              }`}
          />
        );
      })}
    </svg>
  );
}

function VolumeArch({ volume, active }: { volume: FootVolume; active: boolean }) {
  return (
    <svg viewBox="0 0 80 52" className="w-full" style={{ height: 56 }}>
      <line
        x1="8" y1="46" x2="72" y2="46"
        strokeWidth="1"
        className={active ? 'stroke-brand-red/30' : 'stroke-neutral-800'}
      />
      <path
        d={VOLUME_ARCH[volume]}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className={`transition-colors duration-300 ${active ? 'stroke-brand-red' : 'stroke-neutral-600'
          }`}
      />
    </svg>
  );
}

export default function FootLabPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedFootShape, setSelectedFootShape] = useState<FootShape | null>(null);
  const [selectedFootVolume, setSelectedFootVolume] = useState<FootVolume | null>(null);
  const [savedFootShape, setSavedFootShape] = useState<FootShape | null>(null);
  const [savedFootVolume, setSavedFootVolume] = useState<FootVolume | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(true);

  const loadUserFootProfile = useCallback(async () => {
    try {
      const response = await fetchApi<{ footShape?: string; footVolume?: string; onboardingComplete?: boolean }>('/api/v1/profile');
      if (response.isOk()) {
        const data = response.value;
        setOnboardingComplete(Boolean(data.onboardingComplete));

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
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    const loadTimer = window.setTimeout(loadUserFootProfile, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadUserFootProfile, session]);

  const saveFootProfile = async () => {
    if (!selectedFootShape || !selectedFootVolume || !session?.user) {
      setError('Please select both foot shape and volume');
      return;
    }

    const validationResult = footProfileSchema.safeParse({
      footShape: selectedFootShape,
      footVolume: selectedFootVolume,
    });

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setError(firstIssue?.message || "Invalid foot profile");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await fetchApi<{ footShape?: string; footVolume?: string }>('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({ footShape: selectedFootShape, footVolume: selectedFootVolume }),
      });

      if (result.isErr()) {
        const error = result.error;
        const msg = (error as { userMessage?: string }).userMessage || error.message || 'Failed to save foot profile';
        console.error('Save foot profile error:', error);
        if (error.category === 'authentication') {
          setError('Your session expired. Please log in again.');
          setTimeout(() => router.push('/auth/login?callbackUrl=%2Ffootlab'), 2000);
        } else {
          setError(msg);
        }
        return;
      }

      setSavedFootShape((result.value.footShape as FootShape) || selectedFootShape);
      setSavedFootVolume((result.value.footVolume as FootVolume) || selectedFootVolume);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push('/dashboard');
      }, 1200);
    } catch (err) {
      console.error('Failed to save foot profile:', err);
      setError('Failed to save foot profile');
    } finally {
      setSaving(false);
    }
  };

  const isAlreadySaved =
    !!savedFootShape &&
    selectedFootShape === savedFootShape &&
    selectedFootVolume === savedFootVolume;
  const hasFootProfile = !!savedFootShape && !!savedFootVolume;
  const showOnboardingPrompt = !onboardingComplete && !hasFootProfile;

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-red/10 rounded-lg flex items-center justify-center mx-auto mb-6 hal-glow-animate">
            <Footprints className="w-8 h-8 text-brand-red" />
          </div>
          <h1 className="font-ball-pill text-5xl mb-3">FOOT PROFILE</h1>
          <p className="font-sora text-neutral-500 mb-6">Log in to discover your foot shape</p>
          <Link
            href="/auth/login?callbackUrl=%2Ffootlab"
            className="inline-flex items-center justify-center rounded-lg bg-brand-red px-8 py-3 font-ball-pill text-lg text-black"
          >
            LOG IN
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden pb-32">
      <section className="px-6 md:px-12 lg:px-16 py-14 max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="font-ball-pill text-6xl md:text-8xl leading-none mb-4">
            KNOW YOUR<br /><span className="text-brand-red">FOOT</span>
          </h1>
          <p className="font-sora text-neutral-400 text-lg max-w-lg">
            Two questions. Better shoes. Tell us about your foot and we&apos;ll match you to the right rubber.
          </p>
        </motion.div>

        {showOnboardingPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className="mb-10 rounded-lg border border-brand-red/20 bg-brand-red/5 p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-ball-pill text-2xl text-brand-chalk mb-2">Foot Lab is ready — finish setup when you want</h2>
                <p className="font-sora text-sm text-brand-putty/70 max-w-2xl">
                  You can use Foot Lab right now, or jump back into onboarding to finish your guided setup and add your first shoe.
                </p>
              </div>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center rounded-lg border border-brand-red/30 bg-brand-red px-5 py-3 font-ball-pill text-sm text-black transition-colors duration-500 hover:bg-brand-red/80"
              >
                CONTINUE ONBOARDING
              </Link>
            </div>
          </motion.div>
        )}

        {/* Step 1: Shape */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="mb-8">
            <h2 className="font-ball-pill text-2xl">Which toe is longest?</h2>
            <p className="font-sora text-neutral-500 text-sm mt-0.5">Look at your bare foot from above and pick the closest match</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.keys(footShapeInfo) as FootShape[]).map((shape, i) => {
              const isSelected = selectedFootShape === shape;
              return (
                <motion.button
                  key={shape}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedFootShape(shape)}
                  className={`monolith-card rounded-lg p-4 text-left transition-all duration-500 border ${isSelected
                      ? 'border-brand-red/40 bg-brand-red/10 hal-glow'
                      : 'border-white/[0.06] bg-brand-charcoal hover:border-white/10'
                    }`}
                >
                  <div className="mb-4 pt-2">
                    <ToeProfile shape={shape} active={isSelected} />
                  </div>
                  <h3 className="font-ball-pill text-xl leading-none mb-1">{footShapeInfo[shape].name}</h3>
                  <p className="font-sora text-[11px] text-neutral-500 leading-snug">{footShapeInfo[shape].description}</p>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="font-sora text-[10px] text-brand-red mt-2 overflow-hidden"
                      >
                        {footShapeInfo[shape].fit}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Step 2: Volume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="mb-8">
            <h2 className="font-ball-pill text-2xl">How full is your foot?</h2>
            <p className="font-sora text-neutral-500 text-sm mt-0.5">Think about your foot width and instep height</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(footVolumeInfo) as FootVolume[]).map((volume, i) => {
              const isSelected = selectedFootVolume === volume;
              return (
                <motion.button
                  key={volume}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedFootVolume(volume)}
                  className={`monolith-card rounded-lg p-6 text-left transition-all duration-500 border ${isSelected
                      ? 'border-brand-red/40 bg-brand-red/10 hal-glow'
                      : 'border-white/[0.06] bg-brand-charcoal hover:border-white/10'
                    }`}
                >
                  <div className="mb-5">
                    <VolumeArch volume={volume} active={isSelected} />
                  </div>
                  <h3 className="font-ball-pill text-2xl leading-none mb-2">{footVolumeInfo[volume].name} Volume</h3>
                  <p className="font-sora text-sm text-neutral-500 leading-snug mb-2">{footVolumeInfo[volume].description}</p>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="font-sora text-[10px] text-brand-red overflow-hidden"
                      >
                        {footVolumeInfo[volume].fit}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {error && (
          <div className="text-red-400 text-sm font-sora bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">{error}</div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-brand-charcoal/50 border border-white/[0.06] rounded-lg p-6 md:p-8"
        >
          <h2 className="font-ball-pill text-2xl mb-5">Your foot shape changes everything</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Toes fit without pressure or pain',
              'Optimal power transfer on every hold',
              'Prevents common climbing foot injuries',
              'Personalised to how you actually climb',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 flex-shrink-0" />
                <span className="font-sora text-sm text-neutral-400">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </section>

      <AnimatePresence>
        {selectedFootShape && selectedFootVolume && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-md border-t border-white/[0.06] px-6 py-4"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="font-ball-pill text-xl capitalize">
                  {selectedFootShape} <span className="text-brand-red">·</span> {selectedFootVolume} volume
                </p>
                <p className="font-sora text-xs text-neutral-500">
                  {isAlreadySaved ? 'Profile already saved' : 'Ready to save your profile'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveFootProfile}
                disabled={saving || isAlreadySaved}
                className={`font-ball-pill text-lg px-8 py-3 rounded-lg transition-all duration-500 flex items-center gap-2 disabled:opacity-60 ${saved || isAlreadySaved
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-brand-red hover:bg-brand-red/80 text-black'
                  }`}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : saved || isAlreadySaved ? (
                  <><Check className="w-4 h-4" /> SAVED</>
                ) : (
                  'SAVE PROFILE'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
