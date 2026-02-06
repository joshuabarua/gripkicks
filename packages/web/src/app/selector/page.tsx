"use client";

import React from "react";
import dynamic from "next/dynamic";
import CharacterSelector from "@/components/3d/CharacterSelector";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from "next/link";
import { motion } from "framer-motion";

export default function SelectorPage() {
  const router = useRouter();

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
    <main className="flex flex-col items-center bg-black text-white">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-neutral-700 hover:border-orange-500/30 text-neutral-400 font-sora text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        </Link>
      </div>

      {/* Hero Section - 3D Scene */}
      <div className="relative h-[100vh] w-screen flex items-center justify-center flex-col bg-black">
        <Scene />
      </div>

      <div className="h-16 md:h-24"></div>

      {/* Character Selector Section */}
      <div className="w-full px-4 md:px-8 pb-16 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-tanker text-orange-500/5 select-none leading-none">
            SELECTOR
          </h1>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <CharacterSelector onSelectCharacter={handleCharacterSelect} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12 max-w-2xl mx-auto"
        >
          <p className="font-mono text-xs text-orange-500 mb-2 tracking-[0.3em]">[CHOOSE_YOUR_PATH]</p>
          <h2 className="font-tanker text-3xl mb-4">EXPLORE & DISCOVER</h2>
          <p className="font-sora text-neutral-500 mb-8">
            Use our interactive 3D selector to discover your foot profile or manage your shoe collection.
          </p>
          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg px-8 py-3 rounded-2xl transition-colors inline-flex items-center gap-2"
            >
              NEW TO GRIPKICKS? SIGN UP
              <Sparkles className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
