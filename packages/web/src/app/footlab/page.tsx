'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Check } from 'lucide-react';
import { useRequireAuth } from '@/lib/auth';
import { fetchApi } from '@/lib/api-client';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ToeProfile, VolumeArch, type FootShape, type FootVolume } from '@/components/foot/FootGlyphs';
import { FullPageLoading } from '@/components/ui/loading';
import { PageSurface } from '@/components/ui/PageSurface';
import { LabHeader } from '@/components/ui/LabHeader';
import { riseDelay, expandMotion, slideUpBarMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

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
    fit: 'Best in wide fit shoes',
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
    description: 'Narrow foot with a low instep. It looks slim from the side.',
    fit: 'Performance shoes with a snug fit',
  },
  medium: {
    name: 'Medium',
    description: 'Average width and height. Most standard shoes work.',
    fit: 'All around climbing shoes',
  },
  high: {
    name: 'High',
    description: 'Wide foot with a high instep. It looks full from the side.',
    fit: 'Comfort or wide fit shoes',
  },
};

export default function FootLabPage() {
  const { data: session } = useRequireAuth();
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
    return <FullPageLoading text="Loading foot lab" />;
  }

  return (
    <PageSurface className="pb-32">
      <div className="lab-container">
        <LabHeader title="Foot Lab" description="Set your foot shape and volume." />

        {showOnboardingPrompt && (
          <section aria-labelledby="onboarding-prompt-title" style={riseDelay(1)} className="lab-card lab-card-active lab-rise mb-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="lab-label mb-2">Onboarding</p>
              <h2 id="onboarding-prompt-title" className="font-ball-pill text-2xl leading-tight">Finish setup</h2>
            </div>
            <Link href="/onboarding" className="lab-button shrink-0">Continue onboarding</Link>
          </section>
        )}

        <section className="mb-16">
          <div style={riseDelay(2)} className="lab-rise mb-8">
            <h2 className="font-ball-pill text-2xl">Which toe is longest?</h2>
            <p className="font-mono text-sm text-brand-putty mt-0.5">Look at your bare foot from above and pick the closest match</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.keys(footShapeInfo) as FootShape[]).map((shape, i) => {
              const isSelected = selectedFootShape === shape;
              return (
                <div key={shape} style={riseDelay(3 + i)} className="lab-rise h-full">
                  <motion.button
                    type="button"
                    aria-pressed={isSelected}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedFootShape(shape)}
                    className={cn("lab-card h-full w-full p-4 text-left", isSelected && "lab-card-active hal-glow")}
                  >
                    <div className="mb-4 pt-2">
                      <ToeProfile shape={shape} active={isSelected} />
                    </div>
                    <h3 className="font-ball-pill text-xl leading-none mb-1">{footShapeInfo[shape].name}</h3>
                    <p className="font-mono text-xs text-brand-putty leading-snug">{footShapeInfo[shape].description}</p>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.p
                          {...expandMotion}
                          className="font-mono text-xs text-brand-putty/70 mt-2 overflow-hidden"
                        >
                          {footShapeInfo[shape].fit}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <div style={riseDelay(8)} className="lab-rise mb-8">
            <h2 className="font-ball-pill text-2xl">How full is your foot?</h2>
            <p className="font-mono text-sm text-brand-putty mt-0.5">Think about your foot width and instep height</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(footVolumeInfo) as FootVolume[]).map((volume, i) => {
              const isSelected = selectedFootVolume === volume;
              return (
                <div key={volume} style={riseDelay(9 + i)} className="lab-rise h-full">
                  <motion.button
                    type="button"
                    aria-pressed={isSelected}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedFootVolume(volume)}
                    className={cn("lab-card h-full w-full p-6 text-left", isSelected && "lab-card-active hal-glow")}
                  >
                    <div className="mb-5">
                      <VolumeArch volume={volume} active={isSelected} />
                    </div>
                    <h3 className="font-ball-pill text-2xl leading-none mb-2">{footVolumeInfo[volume].name} Volume</h3>
                    <p className="font-mono text-sm text-brand-putty leading-snug mb-2">{footVolumeInfo[volume].description}</p>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.p
                          {...expandMotion}
                          className="font-mono text-xs text-brand-putty/70 overflow-hidden"
                        >
                          {footVolumeInfo[volume].fit}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              );
            })}
          </div>
        </section>

        {error && (
          <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">{error}</div>
        )}
      </div>

      <AnimatePresence>
        {selectedFootShape && selectedFootVolume && (
          <motion.div
            {...slideUpBarMotion}
            className="fixed bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-md border-t border-white/6 px-6 py-4"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="font-ball-pill text-xl capitalize">
                  {selectedFootShape} <span className="text-brand-putty">·</span> {selectedFootVolume} volume
                </p>
                <p className="font-mono text-xs text-brand-putty">
                  {isAlreadySaved ? 'Profile already saved' : 'Ready to save your profile'}
                </p>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveFootProfile}
                disabled={saving || isAlreadySaved}
                className={cn("flex items-center gap-2 disabled:opacity-60", saved || isAlreadySaved ? "lab-button-ghost" : "lab-button")}
              >
                {saving ? (
                  <Loader2 aria-hidden="true" className="w-5 h-5 animate-spin" />
                ) : saved || isAlreadySaved ? (
                  <><Check aria-hidden="true" className="w-4 h-4" /> SAVED</>
                ) : (
                  'SAVE PROFILE'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageSurface>
  );
}
