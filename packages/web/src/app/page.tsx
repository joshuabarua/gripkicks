"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User } from "../../types/user";
import useSessionStore from "@/store/sessionStore";
import dynamic from "next/dynamic";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const sessionData = useSessionStore((state) => state.sessionData);
  console.log("Session Data:", sessionData);
  const Scene = dynamic(() => import("@/components/3d/Scene"), { ssr: false });

  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  return (
    <main className="flex flex-col items-center dark:bg-dark-background dark:text-dark-foreground">
      {/* Hero Section - Original hero section */}
      <div className="relative h-screen w-screen flex items-center justify-center flex-col dark:bg-dark-background dark:text-dark-foreground">
        <Scene />
      </div>

      {/* Split Section - The new 50/50 "character selection" section */}
      <div className="w-screen min-h-screen flex flex-col md:flex-row">
        {/* Find My Foot Section */}
        <Link
          href="/footchecker"
          className="block w-full md:w-1/2 min-h-[50vh] md:min-h-screen"
        >
          <motion.div
            className="w-full h-full flex items-center justify-center p-8 relative overflow-hidden"
            style={{
              backgroundColor:
                hoveredSection === "foot"
                  ? "hsl(17, 93%, 59%)"
                  : "hsl(17, 83%, 54%)",
            }}
            onHoverStart={() => setHoveredSection("foot")}
            onHoverEnd={() => setHoveredSection(null)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
          >
            <motion.div
              className="relative z-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white font-sora">
                Find My Foot
              </h2>
              <p className="text-xl md:text-2xl text-white max-w-md">
                Discover your perfect fit with our advanced foot scanning
                technology
              </p>
            </motion.div>

            {/* Placeholder for a foot icon or illustration */}
            <div className="absolute bottom-10 right-10">
              {/* Foot icon or illustration would go here */}
            </div>
          </motion.div>
        </Link>

        {/* My Favorite Shoe Section */}
        <Link
          href="/stash"
          className="block w-full md:w-1/2 min-h-[50vh] md:min-h-screen"
        >
          <motion.div
            className="w-full h-full flex items-center justify-center p-8 relative overflow-hidden"
            style={{
              backgroundColor:
                hoveredSection === "shoe"
                  ? "hsl(46, 100%, 92%)"
                  : "hsl(46, 100%, 97%)",
            }}
            onHoverStart={() => setHoveredSection("shoe")}
            onHoverEnd={() => setHoveredSection(null)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
          >
            <motion.div
              className="relative z-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-accent font-sora">
                My Favorite Shoe
              </h2>
              <p className="text-xl md:text-2xl text-accent max-w-md">
                Browse your collection and manage your favorite kicks
              </p>
            </motion.div>

            {/* Placeholder for a shoe icon or illustration */}
            <div className="absolute bottom-10 left-10">
              {/* Shoe icon or illustration would go here */}
            </div>
          </motion.div>
        </Link>
      </div>
    </main>
  );
}
