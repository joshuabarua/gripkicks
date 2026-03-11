"use client";

import React from "react";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function HomeBrutalist() {
  const { data: session } = useSession();
  const router = useRouter();

  const isAuthenticated = !!session?.user;
  const userName = session?.user?.name?.toUpperCase() || "CLIMBER";

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section - Preserved */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Scene />
        </div>

        <motion.div
          className="absolute bottom-8 left-8"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDownRight className="w-8 h-8 text-orange-500" />
        </motion.div>
      </section>

      {/* Brutalist Content Section */}
      <section className="min-h-screen bg-orange-500 relative">
        {/* Large Typography Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="font-tanker text-[20vw] leading-none text-black/5 absolute -top-[5vw] -left-[2vw]">
            GRIP
          </div>
          <div className="font-tanker text-[20vw] leading-none text-black/5 absolute bottom-[10vw] -right-[5vw]">
            KICKS
          </div>
        </div>

        <div className="relative z-10 p-8 md:p-16">
          {/* Header Row */}
          <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-16">
            <div>
              {isAuthenticated && (
                <p className="font-mono text-xs text-black/60 mb-2">
                  [LOGGED_IN: {userName}]
                </p>
              )}
              <h2 className="font-tanker text-6xl md:text-8xl lg:text-9xl text-black leading-[0.85]">
                {isAuthenticated ? "WELCOME" : "FIND"}
                <br />
                {isAuthenticated ? "BACK" : "YOUR"}
                <br />
                <span className="text-white">
                  {isAuthenticated ? "→" : "GRIP"}
                </span>
              </h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-black/60">[EST. 2024]</p>
              <p className="font-mono text-xs text-black/60 mt-1">
                [COMMUNITY_BUILT]
              </p>
            </div>
          </div>

          {/* Action Blocks */}
          <div className="grid md:grid-cols-2 gap-4 mb-16">
            <motion.div
              whileHover={{ x: 8 }}
              onClick={() =>
                router.push(isAuthenticated ? "/dashboard" : "/auth/signup")
              }
              className="bg-black text-white p-8 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-16">
                <span className="font-mono text-xs">[01]</span>
                <ArrowUpRight className="w-6 h-6 group-hover:rotate-45 transition-transform" />
              </div>
              <h3 className="font-tanker text-4xl md:text-5xl mb-4">
                {isAuthenticated ? "DASHBOARD" : "START NOW"}
              </h3>
              <p className="font-mono text-xs text-white/60 max-w-xs">
                {isAuthenticated
                  ? "YOUR STASH, YOUR RATINGS, YOUR NEXT PAIR"
                  : "TELL US ABOUT YOUR FEET AND WE'LL HELP YOU FIND THE RIGHT SHOE"}
              </p>
            </motion.div>

          </div>

          {/* Features Grid */}
          <div className="border-t-4 border-black pt-8">
            <p className="font-mono text-xs text-black/60 mb-8">[FEATURES]</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "A1", title: "FOOT LAB", desc: "KNOW YOUR FEET" },
                { id: "A2", title: "SMART MATCH", desc: "FIND YOUR FIT" },
                { id: "A3", title: "TRACK", desc: "PERFORMANCE" },
              ].map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="border-4 border-black bg-transparent hover:bg-black hover:text-orange-500 transition-colors p-6 group"
                >
                  <span className="font-mono text-[10px] text-black/40 group-hover:text-orange-500/60">
                    [{item.id}]
                  </span>
                  <h4 className="font-tanker text-2xl md:text-3xl mt-4 mb-2">
                    {item.title}
                  </h4>
                  <p className="font-mono text-[10px] opacity-60">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-16 pt-8 border-t-4 border-black flex justify-between items-end">
            <div className="flex gap-16">
              {[
                { value: "100%", label: "YOUR DATA" },
                { value: "0%", label: "DATA SOLD" },
                { value: "1", label: "CLIMBER BUILT" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-tanker text-4xl md:text-6xl text-black">
                    {stat.value}
                  </div>
                  <div className="font-mono text-[10px] text-black/60">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="font-mono text-xs text-black/40 text-right">
              <p>GRIP_KICKS™</p>
              <p>V.2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Strip */}
      <section className="bg-black py-4 px-8">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-white/40">
            © 2024 GRIP KICKS
          </span>
          <span className="font-mono text-[10px] text-orange-500">
            BUILT_FOR_CLIMBERS
          </span>
        </div>
      </section>
    </main>
  );
}
