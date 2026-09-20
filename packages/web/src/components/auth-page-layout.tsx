"use client";

import { motion } from "framer-motion";

interface AuthPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AuthPageLayout({ title, children }: AuthPageLayoutProps) {
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
            <h1 className="font-ball-pill text-5xl md:text-6xl">
              {title}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
