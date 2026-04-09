"use client";

import { SignupForm } from "@/components/signup-form";
import { motion } from "framer-motion";

export default function SignupPageClient() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-6 left-6 w-16 h-16 border-l border-t border-white/[0.06]" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r border-b border-white/[0.06]" />

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-2">
              Create account
            </p>
            <h1 className="font-tanker text-5xl md:text-6xl">
              JOIN THE
              <br />
              <span className="text-brand-red">CREW</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <SignupForm />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
