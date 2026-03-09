import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

// Define schema for validation
export const footProfileSchema = z.object({
  shape: z.enum(['Egyptian', 'Roman', 'Greek', 'Germanic', 'Celtic']),
  volume: z.enum(['Low', 'Medium', 'High'])
});

export type FootProfile = z.infer<typeof footProfileSchema>;

type BackendFootShape = 'egyptian' | 'roman' | 'greek' | 'germanic' | 'celtic';
type BackendFootVolume = 'low' | 'medium' | 'high';

const shapeMap: Record<BackendFootShape, FootProfile['shape']> = {
  egyptian: 'Egyptian',
  roman: 'Roman',
  greek: 'Greek',
  germanic: 'Germanic',
  celtic: 'Celtic',
};

const volumeMap: Record<BackendFootVolume, FootProfile['volume']> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function normalizeBackendFootProfile(profile: {
  footShape?: string | null;
  footVolume?: string | null;
}): FootProfile | null {
  if (!profile.footShape || !profile.footVolume) {
    return null;
  }

  const shape = shapeMap[profile.footShape as BackendFootShape];
  const volume = volumeMap[profile.footVolume as BackendFootVolume];

  if (!shape || !volume) {
    return null;
  }

  return { shape, volume };
}

interface FootProfileState {
  profile: FootProfile | null;
  setProfile: (profile: FootProfile) => void;
}

export const useFootProfileStore = create<FootProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
    }),
    { name: 'foot-profile' }
  )
);
