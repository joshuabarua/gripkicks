import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { normalizeVolume } from 'convex/utils/scoring';
import { isFootShape, type FootShape, type FootVolume } from '@/components/lab/FootGlyphs';
import type { PreviewShoe } from './ToolPreviews';

// Rated shoes the Matcher needs before it has learned your preferences.
export const RATINGS_NEEDED = 3;

export type ToolKey = 'matcher' | 'footLab' | 'stash' | 'soleMate';

export interface ToolStatus {
  footProfile: { shape: FootShape; volume: FootVolume } | null;
  stashShoes: PreviewShoe[];
  ratedCount: number;
  labels: Record<ToolKey, string>;
}

type User = { _id: string; footShape?: string; footVolume?: string } | null | undefined;

// Same as the web useToolStatus: null for visitors and while loading, so the
// tool cards keep their demo loops.
export function useToolStatus(user: User): ToolStatus | null {
  const shape = user?.footShape?.toLowerCase();
  const volume = normalizeVolume(user?.footVolume) as FootVolume | undefined;
  const hasProfile = isFootShape(shape) && !!volume;

  const stash = useQuery(api.stash.getUserStash, user ? { userId: user._id as never } : 'skip');
  const soleMateCount = useQuery(
    api.stash.getSoleMateUserCount,
    user?.footShape && user.footVolume ? { footShape: user.footShape, footVolume: user.footVolume } : 'skip',
  );

  if (!user || !Array.isArray(stash)) return null;

  const entries = stash as Array<{ comfortScore?: number; performanceRating?: number; durabilityRating?: number; shoe?: { brand: string; name: string; imageUrl?: string } | null }>;
  const rated = entries.filter((e) => e.comfortScore && e.performanceRating && e.durabilityRating).length;
  const climbers = Math.max(0, (typeof soleMateCount === 'number' ? soleMateCount : 1) - 1);

  return {
    footProfile: hasProfile ? { shape: shape as FootShape, volume: volume! } : null,
    ratedCount: rated,
    stashShoes: entries
      .flatMap((e) => (e.shoe ? [{ brand: e.shoe.brand, name: e.shoe.name, ...(e.shoe.imageUrl ? { imageUrl: e.shoe.imageUrl } : {}) }] : []))
      .slice(0, 3),
    labels: {
      matcher: !hasProfile ? 'Needs foot profile' : rated >= RATINGS_NEEDED ? 'Preferences learned' : `${rated}/${RATINGS_NEEDED} shoes rated`,
      footLab: hasProfile ? `${shape} · ${volume}` : 'Not set',
      stash: `${entries.length} ${entries.length === 1 ? 'shoe' : 'shoes'}`,
      soleMate: !hasProfile ? 'Needs foot profile' : `${climbers} ${climbers === 1 ? 'climber' : 'climbers'} with your profile`,
    },
  };
}
