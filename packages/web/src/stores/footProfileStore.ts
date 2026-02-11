import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

// Define schema for validation
export const footProfileSchema = z.object({
  shape: z.enum(['Egyptian', 'Roman', 'Greek', 'Germanic', 'Celtic']),
  volume: z.enum(['Low', 'Medium', 'High'])
});

export type FootProfile = z.infer<typeof footProfileSchema>;

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
