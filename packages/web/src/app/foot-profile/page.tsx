"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { footProfileSchema, useFootProfileStore, FootProfile } from "@/stores/footProfileStore";
import { motion, AnimatePresence } from "framer-motion";
import InteractiveCard from "./interactive-card";
import CloudBackground from "@/components/CloudBackground";
import { Footprints, Sparkles } from "lucide-react";

const footShapes = [
  { 
    id: "Egyptian", 
    name: "Egyptian", 
    description: "Big toe is longest, toes taper downward",
    icon: "🦶"
  },
  { 
    id: "Roman", 
    name: "Roman", 
    description: "First two toes are same length",
    icon: "👣"
  },
  { 
    id: "Greek", 
    name: "Greek", 
    description: "Second toe is longest than big toe",
    icon: "🦶"
  },
  { 
    id: "Germanic", 
    name: "Germanic", 
    description: "Big toe and other toes similar length",
    icon: "👣"
  },
  { 
    id: "Celtic", 
    name: "Celtic", 
    description: "Wide forefoot with even toe length",
    icon: "🦶"
  }
] as const;

const volumes = [
  { 
    id: "Low", 
    name: "Low Volume", 
    description: "Narrow foot, low instep",
    icon: "⬇️"
  },
  { 
    id: "Medium", 
    name: "Medium Volume", 
    description: "Standard foot width and height",
    icon: "↔️"
  },
  { 
    id: "High", 
    name: "High Volume", 
    description: "Wide foot, high instep",
    icon: "⬆️"
  }
] as const;

export default function FootProfilePage() {
  const router = useRouter();
  const { profile, setProfile } = useFootProfileStore();
  const [selectedShape, setSelectedShape] = useState<string>(profile?.shape || "");
  const [selectedVolume, setSelectedVolume] = useState<string>(profile?.volume || "");
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    const result = footProfileSchema.safeParse({ shape: selectedShape, volume: selectedVolume });
    if (!result.success) {
      setError("Please select both a valid foot shape and volume.");
      return;
    }
    setError("");
    setProfile(result.data as FootProfile);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CloudBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Footprints className="w-12 h-12" />
            Foot Lab
            <Sparkles className="w-12 h-12" />
          </h1>
          <p className="text-xl text-white/80">
            Map your feet so we can match you to the right shoes
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2">
              {[1, 2].map((s) => (
                <motion.div
                  key={s}
                  className={`h-2 w-24 rounded-full transition-all ${
                    s <= step ? "bg-white" : "bg-white/20"
                  }`}
                  initial={{ width: s <= step ? 96 : 48 }}
                  animate={{ width: s <= step ? 96 : 48 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="shape"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white text-center mb-6">
                  Select Your Foot Shape
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {footShapes.map((shape) => (
                    <InteractiveCard
                      key={shape.id}
                      isSelected={selectedShape === shape.id}
                      onClick={() => setSelectedShape(shape.id)}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{shape.icon}</div>
                        <h3 className="text-lg font-semibold text-white">
                          {shape.name}
                        </h3>
                        <p className="text-sm text-white/70 mt-1">
                          {shape.description}
                        </p>
                      </div>
                    </InteractiveCard>
                  ))}
                </div>
                <div className="flex justify-center mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(2)}
                    disabled={!selectedShape}
                    className={`px-8 py-3 rounded-full font-semibold transition-all ${
                      selectedShape
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-white/20 text-white/50 cursor-not-allowed"
                    }`}
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="volume"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-white text-center mb-6">
                  Select Your Foot Volume
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {volumes.map((volume) => (
                    <InteractiveCard
                      key={volume.id}
                      isSelected={selectedVolume === volume.id}
                      onClick={() => setSelectedVolume(volume.id)}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{volume.icon}</div>
                        <h3 className="text-lg font-semibold text-white">
                          {volume.name}
                        </h3>
                        <p className="text-sm text-white/70 mt-1">
                          {volume.description}
                        </p>
                      </div>
                    </InteractiveCard>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(1)}
                    className="px-8 py-3 rounded-full font-semibold bg-white/20 text-white hover:bg-white/30 transition-all"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleSubmit();
                      if (selectedShape && selectedVolume) {
                        // Show success animation
                        router.push('/foot-lab');
                      }
                    }}
                    disabled={!selectedVolume}
                    className={`px-8 py-3 rounded-full font-semibold transition-all ${
                      selectedVolume
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-white/20"
                        : "bg-white/20 text-white/50 cursor-not-allowed"
                    }`}
                  >
                    View in 3D
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-400 mt-4"
            >
              {error}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
