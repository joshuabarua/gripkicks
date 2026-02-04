"use client";

import React from "react";
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Footprints, Plus, Star, ArrowRight, Sparkles } from 'lucide-react';

// Dynamically import the 3D scene for better performance
const Scene = dynamic(() => import("@/components/3d/Scene"), { 
  ssr: false,
  loading: () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
});

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - Show landing page
  if (!session?.user) {
    return (
      <main className="flex flex-col items-center dark:bg-dark-background dark:text-dark-foreground">
        {/* Hero Section */}
        <section className="relative h-[150vh] w-screen flex items-end justify-center overflow-hidden dark:bg-dark-background dark:text-dark-foreground">
          <div className="absolute inset-0 mb-[50vh]">
            <Scene />
          </div>
          
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mb-20">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 ">
                Find Your Perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                  Climbing Shoe
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
                Your personal climbing shoe companion. Track your feet, rate your shoes, 
                and discover your perfect match with AI-powered recommendations.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push('/auth/signup')} className="text-lg px-8 py-4 bg-orange-500 hover:bg-orange-600">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/selector')} className="text-lg px-8 py-4 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                Try 3D Selector
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 dark:bg-dark-background dark:text-dark-foreground">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Everything You Need for the Perfect Fit
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6 dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Footprints className="w-8 h-8 text-orange-500" />
                  </div>
                  <CardTitle className="dark:text-white">Foot Lab</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Analyze your foot shape and volume for personalized recommendations
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center p-6 dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-amber-500" />
                  </div>
                  <CardTitle className="dark:text-white">Rate & Track</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Keep detailed records of comfort and performance for each shoe
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center p-6 dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-blue-500" />
                  </div>
                  <CardTitle className="dark:text-white">Find Matches</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Get AI-powered recommendations based on your unique profile
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 dark:bg-gray-900 dark:text-dark-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Perfect Shoe?
            </h2>
            <p className="text-xl mb-8 dark:text-gray-400">
              Join thousands of climbers who&apos;ve found their ideal match
            </p>
            <Button size="lg" onClick={() => router.push('/auth/signup')} className="text-lg px-8 py-4 bg-orange-500 hover:bg-orange-600">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>
    );
  }

  // Authenticated users will be redirected by OnboardingGuard
  // This page won't show for authenticated users
  return null;
}
