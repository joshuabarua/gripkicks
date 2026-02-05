"use client";

import React from "react";
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import { Button } from '@/components/ui/button';
import { Footprints, Plus, Star, ArrowRight, Sparkles, Compass, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated background patterns */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl animate-spin-slow" />
          </div>
          
          {/* 3D Scene */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen">
            <Scene />
          </div>
          
          {/* Floating elements */}
          <motion.div 
            className="absolute top-32 left-32 text-cyan-400/30"
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Compass size={120} />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-32 right-32 text-purple-400/30"
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Gauge size={100} />
          </motion.div>
          
          <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <div className="mb-8">
                <motion.span 
                  className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-semibold mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  AI-POWERED CLIMBING ANALYSIS
                </motion.span>
              </div>
              <h1 className="font-so-cloudy text-7xl md:text-9xl lg:text-[10rem] font-normal mb-6 leading-[0.9] tracking-tight">
                <span className="block text-white drop-shadow-2xl">GRIP</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-[length:200%_200%] animate-gradient">
                  KICKS
                </span>
              </h1>
              <p className="font-sora text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-300 leading-relaxed">
                Discover your perfect climbing shoe through advanced foot analysis and AI-driven recommendations tailored to your unique climbing style
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <Button 
                size="lg" 
                onClick={() => router.push('/auth/signup')} 
                className="text-lg px-16 py-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-2xl transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/50 group"
              >
                <span className="mr-2">BEGIN JOURNEY</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => router.push('/selector')} 
                className="text-lg px-16 py-8 border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 font-bold rounded-2xl transition-all duration-500 hover:scale-110 backdrop-blur-sm"
              >
                <Sparkles className="mr-3 w-6 h-6" />
                TRY ANALYZER
              </Button>
            </motion.div>
          </div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-purple-400/60 text-sm font-sora">SCROLL</span>
              <div className="w-px h-16 bg-gradient-to-b from-purple-500/50 to-transparent" />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 bg-gradient-to-b from-slate-900/50 to-slate-900 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="text-center mb-32"
            >
              <h2 className="font-basteleur text-6xl md:text-8xl font-bold mb-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-[length:200%_200%] animate-gradient">
                  THE
                </span>
                <span className="block text-white">EXPERIENCE</span>
              </h2>
              <p className="font-sora text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Advanced technology meets climbing expertise to deliver unparalleled shoe recommendations
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="relative p-1 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-500">
                      <Footprints className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="font-basteleur text-3xl font-bold text-white mb-6">Foot Lab</h3>
                    <p className="font-sora text-gray-400 leading-relaxed text-lg">
                      Precision 3D scanning and AI analysis create your unique foot profile for perfect fit recommendations
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="relative p-1 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-purple-500/20 rounded-3xl p-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-500">
                      <Star className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="font-basteleur text-3xl font-bold text-white mb-6">Performance</h3>
                    <p className="font-sora text-gray-400 leading-relaxed text-lg">
                      Track and analyze your climbing performance across different shoes and conditions
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="relative p-1 bg-gradient-to-br from-pink-500/20 to-cyan-500/20 rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-cyan-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-pink-500/20 rounded-3xl p-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-500">
                      <Plus className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="font-basteleur text-3xl font-bold text-white mb-6">AI Match</h3>
                    <p className="font-sora text-gray-400 leading-relaxed text-lg">
                      Our neural network analyzes thousands of data points to find your perfect climbing shoe
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          <motion.div 
            className="relative max-w-5xl mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            <h2 className="font-basteleur text-6xl md:text-8xl font-bold mb-8">
              <span className="text-white">READY TO</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-[length:200%_200%] animate-gradient">
                ASCEND?
              </span>
            </h2>
            <p className="font-sora text-xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
              Join the community of climbers who&apos;ve discovered their perfect match through our advanced AI technology
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/auth/signup')} 
                className="text-xl px-20 py-10 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-2xl transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/50 group"
              >
                <span className="mr-2">START NOW</span>
                <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
              </Button>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="font-basteleur text-4xl font-bold text-cyan-400">10K+</div>
                  <div className="font-sora text-gray-400">CLIMBERS</div>
                </div>
                <div className="text-center">
                  <div className="font-basteleur text-4xl font-bold text-purple-400">500+</div>
                  <div className="font-sora text-gray-400">SHOES</div>
                </div>
                <div className="text-center">
                  <div className="font-basteleur text-4xl font-bold text-pink-400">98%</div>
                  <div className="font-sora text-gray-400">SATISFACTION</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    );
  }

  // Authenticated users - show dashboard or home content
  // You can choose to show a different view for authenticated users
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      {/* Hero Section - Full screen 3D animation */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl animate-spin-slow" />
        </div>
        
        {/* 3D Scene - Full screen */}
        <div className="absolute inset-0 mix-blend-screen">
          <Scene />
        </div>
        
        {/* Floating elements */}
        <motion.div 
          className="absolute top-32 left-32 text-cyan-400/30"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Compass size={120} />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-32 right-32 text-purple-400/30"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Gauge size={100} />
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-purple-400/60 text-sm font-sora">SCROLL</span>
            <div className="w-px h-16 bg-gradient-to-b from-purple-500/50 to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* Welcome Section - Starts after full page scroll */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <motion.span 
                className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-semibold mb-8"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                WELCOME BACK
              </motion.span>
            </div>
            <h1 className="font-so-cloudy text-7xl md:text-9xl lg:text-[10rem] font-normal mb-6 leading-[0.9] tracking-tight">
              <span className="block text-white drop-shadow-2xl">HELLO</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-[length:200%_200%] animate-gradient">
                {session?.user?.name?.toUpperCase() || 'CLIMBER'}
              </span>
            </h1>
            <p className="font-sora text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-300 leading-relaxed">
              Your climbing journey continues. Discover new shoes and track your performance with AI-powered insights.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Button 
              size="lg" 
              onClick={() => router.push('/dashboard')} 
              className="text-lg px-16 py-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-2xl transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/50 group"
            >
              <span className="mr-2">DASHBOARD</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => router.push('/selector')} 
              className="text-lg px-16 py-8 border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 font-bold rounded-2xl transition-all duration-500 hover:scale-110 backdrop-blur-sm"
            >
              <Sparkles className="mr-3 w-6 h-6" />
              3D SELECTOR
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-slate-900/50 to-slate-900 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="text-center mb-32"
          >
            <h2 className="font-basteleur text-6xl md:text-8xl font-bold mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-[length:200%_200%] animate-gradient">
                YOUR
              </span>
              <span className="block text-white">JOURNEY</span>
            </h2>
            <p className="font-sora text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Track progress, analyze performance, and discover new possibilities
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative p-1 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-500">
                    <Footprints className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-basteleur text-3xl font-bold text-white mb-6">Foot Lab</h3>
                  <p className="font-sora text-gray-400 leading-relaxed text-lg">
                    Advanced foot analysis with AI-powered shape recognition
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative p-1 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-purple-500/20 rounded-3xl p-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-500">
                    <Star className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-basteleur text-3xl font-bold text-white mb-6">Your Shoe Stash</h3>
                  <p className="font-sora text-gray-400 leading-relaxed text-lg">
                    Keep detailed records of comfort and performance
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative p-1 bg-gradient-to-br from-pink-500/20 to-cyan-500/20 rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-cyan-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-pink-500/20 rounded-3xl p-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-500">
                    <Plus className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-basteleur text-3xl font-bold text-white mb-6">AI Match</h3>
                  <p className="font-sora text-gray-400 leading-relaxed text-lg">
                    Intelligent recommendations based on your profile
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
