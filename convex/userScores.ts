import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Score history entry schema
const scoreHistoryEntryValidator = v.object({
  timestamp: v.number(),
  previousScore: v.number(),
  newScore: v.number(),
  changeReason: v.union(
    v.literal('shoe_added'),
    v.literal('shoe_updated'),
    v.literal('shoe_removed'),
    v.literal('profile_updated'),
    v.literal('recalculation')
  ),
  affectedShoes: v.array(v.string()),
});

// Update or create user score profile
export const updateScoreProfile = mutation({
  args: {
    userId: v.id('users'),
    overallScore: v.number(),
    preferenceProfile: v.object({
      comfort: v.number(),
      performance: v.number(),
      durability: v.number(),
      aggressiveness: v.number(),
      versatility: v.number(),
    }),
    learnedPreferences: v.object({
      preferredBrands: v.array(v.string()),
      preferredVolumes: v.array(v.string()),
      preferredDisciplines: v.array(v.string()),
      confidence: v.number(),
      sampleSize: v.number(),
    }),
    footProfile: v.optional(v.object({
      shape: v.string(),
      volume: v.string(),
    })),
    lastUpdated: v.number(),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, ...profileData } = args;

    // Check if score profile already exists
    const existing = await ctx.db
      .query('userScoreProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, profileData);
    } else {
      await ctx.db.insert('userScoreProfiles', {
        userId,
        ...profileData,
        history: [],
      });
    }

    return { userId, ...profileData };
  },
});

// Get user score profile
export const getScoreProfile = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userScoreProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();
  },
});

// Add entry to score history
export const addScoreHistory = mutation({
  args: {
    userId: v.id('users'),
    history: scoreHistoryEntryValidator,
  },
  handler: async (ctx, args) => {
    const scoreProfile = await ctx.db
      .query('userScoreProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (!scoreProfile) {
      throw new Error('Score profile not found');
    }

    // Add new history entry (keep last 50 entries)
    const updatedHistory = [args.history, ...(scoreProfile.history || [])].slice(0, 50);

    await ctx.db.patch(scoreProfile._id, {
      history: updatedHistory,
    });

    return args.history;
  },
});

// Get top users by score (for leaderboards)
export const getTopUsers = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const offset = args.offset || 0;

    const allByScore = await ctx.db
      .query('userScoreProfiles')
      .withIndex('by_overallScore')
      .order("desc")
      .collect();

    const topUsers = allByScore.slice(offset, offset + limit);

    const usersWithDetails = await Promise.all(
      topUsers.map(async (scoreProfile) => {
        const user = await ctx.db.get(scoreProfile.userId);
        return {
          ...scoreProfile,
          user,
        };
      })
    );

    return usersWithDetails.filter(Boolean);
  },
});

// Get users within 1% score range (for sole mate matching)
export const getUsersWithinScoreRange = query({
  args: {
    targetScore: v.number(),
    rangePercentage: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rangePercentage = args.rangePercentage || 1;
    const limit = args.limit || 20;

    const scoreRange = args.targetScore * (rangePercentage / 100);
    const minScore = Math.max(0, args.targetScore - scoreRange);
    const maxScore = Math.min(100, args.targetScore + scoreRange);

    const nearbyUsers = await ctx.db
      .query('userScoreProfiles')
      .withIndex('by_overallScore', (q) =>
        q.gte('overallScore', minScore).lte('overallScore', maxScore)
      )
      .take(limit);

    const usersWithDetails = await Promise.all(
      nearbyUsers.map(async (scoreProfile) => {
        const user = await ctx.db.get(scoreProfile.userId);
        return {
          ...scoreProfile,
          user,
        };
      })
    );

    return usersWithDetails.filter(Boolean);
  },
});

// Get user's score progression over time
export const getScoreProgression = query({
  args: {
    userId: v.id('users'),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    const scoreProfile = await ctx.db
      .query('userScoreProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (!scoreProfile || !scoreProfile.history) {
      return null;
    }

    const recentHistory = scoreProfile.history
      .filter(entry => entry.timestamp >= cutoffTime)
      .sort((a, b) => a.timestamp - b.timestamp);

    return {
      currentScore: scoreProfile.overallScore,
      history: recentHistory,
      trend: calculateTrend(recentHistory),
    };
  },
});

// Calculate global statistics
export const getGlobalScoreStats = query({
  args: {},
  handler: async (ctx) => {
    const allScoreProfiles = await ctx.db.query('userScoreProfiles').collect();

    if (allScoreProfiles.length === 0) {
      return {
        totalUsers: 0,
        averageScore: 0,
        medianScore: 0,
        topScore: 0,
        bottomScore: 0,
        distribution: {
          elite: 0,
          expert: 0,
          advanced: 0,
          intermediate: 0,
          beginner: 0,
          novice: 0,
        },
      };
    }

    const scores = allScoreProfiles.map(profile => profile.overallScore);
    scores.sort((a, b) => a - b);

    const totalUsers = allScoreProfiles.length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalUsers;
    const medianScore = scores[Math.floor(totalUsers / 2)];
    const topScore = Math.max(...scores);
    const bottomScore = Math.min(...scores);

    const distribution = {
      elite: allScoreProfiles.filter(p => p.overallScore >= 90).length,
      expert: allScoreProfiles.filter(p => p.overallScore >= 80 && p.overallScore < 90).length,
      advanced: allScoreProfiles.filter(p => p.overallScore >= 70 && p.overallScore < 80).length,
      intermediate: allScoreProfiles.filter(p => p.overallScore >= 60 && p.overallScore < 70).length,
      beginner: allScoreProfiles.filter(p => p.overallScore >= 50 && p.overallScore < 60).length,
      novice: allScoreProfiles.filter(p => p.overallScore < 50).length,
    };

    return {
      totalUsers,
      averageScore,
      medianScore,
      topScore,
      bottomScore,
      distribution,
    };
  },
});

// Helper function to calculate trend
function calculateTrend(
  history: { newScore: number }[]
): 'improving' | 'stable' | 'declining' {
  if (history.length < 2) return 'stable';

  const recent = history.slice(-5);
  if (recent.length < 2) return 'stable';

  const firstEntry = recent[0];
  const lastEntry = recent[recent.length - 1];
  if (!firstEntry || !lastEntry) return 'stable';

  const firstScore = firstEntry.newScore;
  const lastScore = lastEntry.newScore;
  const change = lastScore - firstScore;

  if (change > 2) return 'improving';
  if (change < -2) return 'declining';
  return 'stable';
}
