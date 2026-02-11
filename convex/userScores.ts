import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { validateSession } from './auth';

// User score profile schema
const userScoreProfileSchema = {
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
};

// Score history entry schema
const scoreHistorySchema = {
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
};

// Update or create user score profile
export const updateScoreProfile = mutation({
  args: {
    userId: v.id('users'),
    scoreProfile: userScoreProfileSchema,
  },
  handler: async (ctx, args) => {
    // Note: Authentication is handled at the HTTP layer via Better Auth
    // This mutation assumes the caller has proper authorization

    // Check if score profile already exists
    const existing = await ctx.db
      .query('userScoreProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      // Update existing profile
      await ctx.db.patch(existing._id, args.scoreProfile);
      console.log(`Updated score profile for user ${args.userId}: ${args.scoreProfile.overallScore}`);
    } else {
      // Create new profile
      await ctx.db.insert('userScoreProfiles', {
        ...args.scoreProfile,
        history: [], // Initialize empty history
      });
      console.log(`Created score profile for user ${args.userId}: ${args.scoreProfile.overallScore}`);
    }

    return args.scoreProfile;
  },
});

// Get user score profile
export const getScoreProfile = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Note: Authentication is handled at the HTTP layer via Better Auth

    const scoreProfile = await ctx.db
      .query('userScoreProfiles')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    return scoreProfile;
  },
});

// Add entry to score history
export const addScoreHistory = mutation({
  args: {
    userId: v.id('users'),
    history: scoreHistorySchema,
  },
  handler: async (ctx, args) => {
    // Note: Authentication is handled at the HTTP layer via Better Auth

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

    console.log(`Added score history for user ${args.userId}: ${args.history.newScore} (${args.history.changeReason})`);
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

    const topUsers = await ctx.db
      .query('userScoreProfiles')
      .withIndex('by_overallScore', (q) => q.desc('overallScore'))
      .range(offset, offset + limit - 1)
      .collect();

    // Get user details for each score profile
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

// Get users within 1% score range (for soul mate matching)
export const getUsersWithinScoreRange = query({
  args: {
    targetScore: v.number(),
    rangePercentage: v.optional(v.number()), // Default to 1%
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

    // Get user details for each score profile
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
    days: v.optional(v.number()), // Default to 30 days
  },
  handler: async (ctx, args) => {
    // Note: Authentication is handled at the HTTP layer via Better Auth

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
          elite: 0,      // 90-100
          expert: 0,     // 80-89
          advanced: 0,   // 70-79
          intermediate: 0, // 60-69
          beginner: 0,   // 50-59
          novice: 0,     // 0-49
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
function calculateTrend(history: any[]): 'improving' | 'stable' | 'declining' {
  if (history.length < 2) return 'stable';

  const recent = history.slice(-5); // Last 5 entries
  if (recent.length < 2) return 'stable';

  const firstScore = recent[0].newScore;
  const lastScore = recent[recent.length - 1].newScore;
  const change = lastScore - firstScore;

  if (change > 2) return 'improving';
  if (change < -2) return 'declining';
  return 'stable';
}
