"use client";

import React from "react";
import useSessionStore from "@/store/sessionStore";
import dynamic from "next/dynamic";
import CharacterSelector from "@/components/3d/CharacterSelector";
import { useRouter } from "next/navigation";

export default function Home() {
  const sessionData = useSessionStore((state) => state.sessionData);
  const router = useRouter();
  console.log("Session Data:", sessionData);
  
  // Memoize Scene component to prevent re-renders
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
      {/* Hero Section - Fixed to fit screen properly */}
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
      </div>
    </main>
  );
}
