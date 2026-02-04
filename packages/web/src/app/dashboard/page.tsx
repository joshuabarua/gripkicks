"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Footprints, 
  Plus, 
  Star, 
  ArrowRight, 
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import type { UserShoe } from '@/types/api';

interface Profile {
  name?: string;
  footShape?: string;
  footVolume?: string;
  onboardingComplete?: boolean;
}

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [userShoes, setUserShoes] = useState<UserShoe[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && session?.user) {
      loadUserData();
    }
  }, [session, isPending]);

  const loadUserData = async () => {
    try {
      // Load user profile
      const profileResult = await fetchApi<Profile>('/api/v1/profile');
      if (profileResult.isOk()) {
        setProfile(profileResult.value);
      }

      // Load user shoes
      const shoesResult = await fetchApi<UserShoe[]>('/api/v1/stash');
      if (shoesResult.isOk()) {
        setUserShoes(shoesResult.value);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <main className="min-h-svh dark:bg-dark-background dark:text-dark-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {profile?.name || session.user.name || 'Climber'}! 👋
          </h1>
          <p className="text-xl dark:text-gray-400">
            Ready to climb? Here&apos;s what&apos;s happening with your shoes.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-gray-400">Total Shoes</p>
                  <p className="text-2xl font-bold dark:text-white">{userShoes.length}</p>
                </div>
                <Plus className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-gray-400">Favorites</p>
                  <p className="text-2xl font-bold dark:text-white">
                    {userShoes.filter(shoe => shoe.isFavourite).length}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-gray-400">Avg Comfort</p>
                  <p className="text-2xl font-bold dark:text-white">
                    {userShoes.length > 0 
                      ? (userShoes.reduce((acc, shoe) => acc + (shoe.comfortScore || 0), 0) / userShoes.length).toFixed(1)
                      : '-'
                    }
                  </p>
                </div>
                <Star className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-gray-400">Foot Shape</p>
                  <p className="text-lg font-bold capitalize dark:text-white">
                    {profile?.footShape || 'Not set'}
                  </p>
                </div>
                <Footprints className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-700" onClick={() => router.push('/stash')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Plus className="w-5 h-5" />
                Add New Shoe
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Track another climbing shoe in your collection
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-700" onClick={() => router.push('/findmyshoe')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <TrendingUp className="w-5 h-5" />
                Find Matches
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Discover new shoes based on your preferences
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-700" onClick={() => router.push('/footchecker')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Activity className="w-5 h-5" />
                Update Foot Profile
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Refine your foot measurements for better recommendations
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Shoes */}
        {userShoes.length > 0 && (
          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Shoes</CardTitle>
              <CardDescription className="dark:text-gray-400">Your latest climbing shoe additions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {userShoes.slice(0, 3).map((shoe) => (
                  <div key={shoe._id} className="flex items-center justify-between p-4 rounded-lg border dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {/* Shoe image placeholder */}
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium dark:text-white">{shoe.shoe.name}</h3>
                        <p className="text-sm dark:text-gray-400">{shoe.shoe.brand}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm dark:text-gray-400">Comfort: {shoe.comfortScore || 0}/5</span>
                      <span className="text-sm dark:text-gray-400">Performance: {shoe.performanceRating || 0}/5</span>
                    </div>
                  </div>
                ))}
              </div>
              {userShoes.length > 3 && (
                <Button variant="outline" className="w-full mt-4 dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800" onClick={() => router.push('/stash')}>
                  View All Shoes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {userShoes.length === 0 && (
          <Card className="text-center p-12 dark:bg-gray-900 dark:border-gray-700">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">No shoes yet</h3>
              <p className="dark:text-gray-400 mb-4">
                Start tracking your climbing shoes to get personalized recommendations
              </p>
              <Button onClick={() => router.push('/stash')} className="bg-orange-500 hover:bg-orange-600">
                Add Your First Shoe
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
