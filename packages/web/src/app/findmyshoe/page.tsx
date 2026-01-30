'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/lib/auth';
import { fetchApi } from '@/lib/api-client';
import { motion } from 'framer-motion';
import { Search, Star, Users, TrendingUp, Footprints } from 'lucide-react';

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

export default function SoleMatePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'comfort' | 'performance' | 'durability'>('all');

  useEffect(() => {
    if (session?.user) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    try {
      const response = await fetchApi<{ success: boolean; data: UserProfile }>('/api/v1/profile');
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock aggregated data - in real app, this would come from an API
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
    // Add more mock data as needed
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
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Footprints className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle>Sole Mate</CardTitle>
            <CardDescription>Find your perfect climbing shoe match</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Please log in to find your sole mate</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile?.onboardingComplete) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Footprints className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle>Complete Your Profile First</CardTitle>
            <CardDescription>
              Set up your foot profile and add at least one shoe to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <a href="/footchecker">Go to Foot Lab</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/stash">Add Shoes to Collection</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Footprints className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">Sole Mate</h1>
          <p className="text-muted-foreground text-lg">
            Find your perfect climbing shoe based on community insights
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search shoes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                >
                  Overall Match
                </Button>
                <Button
                  variant={selectedCategory === 'comfort' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('comfort')}
                >
                  Comfort
                </Button>
                <Button
                  variant={selectedCategory === 'performance' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('performance')}
                >
                  Performance
                </Button>
                <Button
                  variant={selectedCategory === 'durability' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('durability')}
                >
                  Durability
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sole Sibling Spotlight */}
        {filteredRatings.some(r => r.isSoleSibling) && (
          <Card className="mb-6 border-2 border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Sole Sibling Spotlight
              </CardTitle>
              <CardDescription>
                Climbers with your exact foot profile love these shoes!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredRatings.filter(r => r.isSoleSibling).map((rating) => (
                  <motion.div
                    key={rating.shoe._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Footprints className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{rating.shoe.name}</h3>
                        <p className="text-sm text-muted-foreground">{rating.shoe.brand}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            <Star className="w-3 h-3 mr-1" />
                            {rating.matchScore}% Match
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {rating.totalRatings} reviews
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Avg Ratings</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs">C:{rating.avgComfortScore.toFixed(1)}</span>
                        <span className="text-xs">P:{rating.avgPerformanceRating.toFixed(1)}</span>
                        <span className="text-xs">D:{rating.avgDurabilityRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Recommendations Grid */}
        <div className="grid gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            All Recommendations
          </h2>
          <div className="grid gap-4">
            {filteredRatings.filter(r => !r.isSoleSibling).map((rating, index) => (
              <motion.div
                key={rating.shoe._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-background rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Footprints className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{rating.shoe.name}</h3>
                    <p className="text-sm text-muted-foreground">{rating.shoe.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        <Star className="w-3 h-3 mr-1" />
                        {rating.matchScore}% Match
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {rating.totalRatings} reviews
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Avg Ratings</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs">C:{rating.avgComfortScore.toFixed(1)}</span>
                    <span className="text-xs">P:{rating.avgPerformanceRating.toFixed(1)}</span>
                    <span className="text-xs">D:{rating.avgDurabilityRating.toFixed(1)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
