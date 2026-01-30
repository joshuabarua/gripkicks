'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth';
import AuthButton from '@/components/auth-button';
import { Glow, GlowArea } from '@/components/ui/glow';
import NavButton from '@/components/ui/nav-button';
import { motion, AnimatePresence } from 'framer-motion';
import NavLinks from '@/components/ui/nav-links';

const menu = {
  open: {
    width: "480px",
    height: "650px",
    top: "-25px",
    right: "-25px",
    transition: { duration: 0.75, type: "tween", ease: [0.76, 0, 0.24, 1] }
  },
  closed: {
    width: "80px",
    height: " 35px",
    top: "-0px",
    right: "-0px",
    transition: { duration: 0.75, delay: 0.35, type: "tween", ease: [0.76, 0, 0.24, 1] }
  },
  closedText: {
    width: "80px",
    height: " 35px",
    top: "-0px",
    right: "-0px",
    transition: { duration: 0.25, delay: 0.25, type: "tween", ease: [0.76, 0, 0.24, 1] }
  }
}

const Navigation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Use Better Auth session hook to check if user is authenticated
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user;
  
  // Function to close menu (used after logout)
  const closeMenu = () => setIsActive(false);

  // Add click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive]);

  return (
    <nav ref={navRef} className="p-2 mr-2">
      <ul className="flex justify-between text-foreground">
        <GlowArea className="w-[120px] z-4 ">
          <Glow color="whitesmoke" className="rounded-sm flex justify-center align-center">
            <li>
              <Link href="/">
                <h1 className="font-tanker text-2xl hover:scale-105 duration-1000 ease-in-out">Grip Kicks</h1>
              </Link>
            </li>
          </Glow>
        </GlowArea>
        <li>
          {isPending ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded" />
          ) : isAuthenticated ? (
            <div className="relative flex items-center gap-2">
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    className="nav-menu "
                    variants={menu}
                    animate={isActive ? "open" : "closed"}
                    initial="closed"
                    exit="closed"
                  >
                    <NavLinks handleLogout={closeMenu} />
                  </motion.div>
                )}
              </AnimatePresence>
              <NavButton isActive={isActive} toggleMenu={() => setIsActive(!isActive)} />
            </div>
          ) : (
            <AuthButton />
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;