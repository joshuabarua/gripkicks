"use client";

import React from "react";
import dynamic from "next/dynamic";
import CharacterSelector from "@/components/3d/CharacterSelector";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from "next/link";

export default function SelectorPage() {
  const router = useRouter();

  // Dynamically import the Scene component to prevent SSR issues
  const Scene = React.useMemo(() => 
    dynamic(() => import("@/components/3d/Scene"), { ssr: false }), 
    []
  );

  const handleCharacterSelect = (character: string) => {
    if (character === 'foot') {
      router.push('/footchecker');
    } else if (character === 'shoe') {
      router.push('/stash');
    }
  };

  return (
    <main className="flex flex-col items-center dark:bg-dark-background dark:text-dark-foreground">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Hero Section - 3D Scene */}
      <div className="relative h-[100vh] w-screen flex items-center justify-center flex-col dark:bg-dark-background dark:text-dark-foreground">
        <Scene />
      </div>

      {/* Spacer between hero and selection cards */}
      <div className="h-16 md:h-24"></div>

      {/* Character Selector Section */}
      <div className="w-full px-4 md:px-8 pb-16 relative">
        {/* Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-bold text-orange-500/10 font-sora select-none leading-none">
            SELECTOR
          </h1>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <CharacterSelector onSelectCharacter={handleCharacterSelect} />
        </div>

        {/* Description */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Choose Your Path</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Explore our interactive 3D selector to discover your foot profile or manage your shoe collection.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button>
                New to GripKicks? Sign Up
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
