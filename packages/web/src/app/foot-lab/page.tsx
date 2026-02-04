'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import FootModelViewer from '@/components/FootModelViewer';
import CloudBackground from '@/components/CloudBackground';
import { Footprints, Settings, Sparkles } from 'lucide-react';

export default function FootLabPage() {
  const [selectedShape, setSelectedShape] = useState('medium');
  const [selectedVolume, setSelectedVolume] = useState('medium');
  const [showModel, setShowModel] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 text-center py-8"
      >
        <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Footprints className="w-12 h-12" />
          Foot Lab
          <Settings className="w-12 h-12" />
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto px-4">
          Interactive 3D foot modeling with real-time morphing technology
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10">
        {!showModel ? (
          // Landing screen
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md border border-white/20">
              <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Experience Your Foot in 3D
              </h2>
              <p className="text-white/80 mb-6 text-center">
                Explore different foot shapes and volumes with our interactive 3D model
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModel(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg hover:shadow-white/20 transition-all"
              >
                Launch 3D Viewer
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // 3D Viewer
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-30"
          >
            <FootModelViewer
              shape={selectedShape}
              volume={selectedVolume}
              onShapeChange={setSelectedShape}
              onVolumeChange={setSelectedVolume}
            />
            
            {/* Close button */}
            <button
              onClick={() => setShowModel(false)}
              className="absolute top-4 right-4 z-40 bg-black/50 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/70 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 container mx-auto px-4 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Morphing</h3>
            <p className="text-white/70 text-sm">
              See instant changes as you select different foot shapes and volumes
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">5 Foot Shapes</h3>
            <p className="text-white/70 text-sm">
              Egyptian, Roman, Greek, Germanic, and Celtic foot types
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">3 Volume Levels</h3>
            <p className="text-white/70 text-sm">
              Low, medium, and high volume options for perfect fit
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
