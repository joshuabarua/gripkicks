'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import FootModelViewer from '@/components/FootModelViewer';
import { Footprints, Sparkles, X } from 'lucide-react';

export default function FootLabPage() {
  const [selectedShape, setSelectedShape] = useState('medium');
  const [selectedVolume, setSelectedVolume] = useState('medium');
  const [showModel, setShowModel] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <section className="px-6 md:px-12 lg:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-mono text-xs text-orange-500 mb-2 tracking-[0.3em]">[FOOT_LAB]</p>
          <h1 className="font-tanker text-6xl md:text-8xl mb-4">
            FOOT<br /><span className="text-orange-500">LAB</span>
          </h1>
          <p className="font-sora text-lg text-neutral-400 max-w-2xl mx-auto">
            Interactive 3D foot modeling with real-time morphing technology
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10">
          {!showModel ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 max-w-md text-center">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="font-tanker text-3xl mb-3">3D FOOT MODEL</h2>
                <p className="font-sora text-neutral-400 text-sm mb-8">
                  Explore different foot shapes and volumes with our interactive 3D model
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModel(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black font-tanker text-xl py-4 rounded-2xl transition-colors"
                >
                  LAUNCH 3D VIEWER
                </motion.button>
              </div>
            </motion.div>
          ) : (
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
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowModel(false)}
                className="absolute top-6 right-6 z-40 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 text-white p-3 rounded-2xl hover:border-orange-500/30 transition-all"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Real-time Morphing', desc: 'See instant changes as you select different foot shapes and volumes' },
              { title: '5 Foot Shapes', desc: 'Egyptian, Roman, Greek, Germanic, and Celtic foot types' },
              { title: '3 Volume Levels', desc: 'Low, medium, and high volume options for perfect fit' },
            ].map((card) => (
              <div key={card.title} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 group hover:border-orange-500/30 transition-colors">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Footprints className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="font-tanker text-lg text-white mb-1">{card.title}</h3>
                <p className="font-sora text-neutral-500 text-xs">{card.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
