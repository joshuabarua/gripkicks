'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const [isVisible, setIsVisible] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Use Better Auth session hook to check if user is authenticated
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user;

  // Function to close menu (used after logout)
  const closeMenu = () => setIsActive(false);

  // Handle mouse movement and scroll to show navigation
  const handleUserActivity = useCallback(() => {
    setIsVisible(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to hide navigation after 3 seconds of inactivity
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }, []);

  // Set up mouse movement and scroll listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleUserActivity]);

  // Close menu when route changes
  useEffect(() => {
    setIsActive(false);
  }, [pathname]);

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
    <motion.nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 p-4 bg-background/99 backdrop-blur-sm border-b-2 border-white"
      style={{ borderImage: 'none', borderColor: 'rgba(255, 255, 255, 0.8)' }}
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <ul className="flex justify-between items-center text-foreground">
        <GlowArea className="w-[120px] z-4">
          <Glow color="whitesmoke" className="rounded-sm flex justify-center items-center">
            <li>
              <Link href="/">
                <h1 className="font-tanker text-2xl hover:scale-105 duration-1000 ease-in-out whitespace-nowrap">Grip Kicks</h1>
              </Link>
            </li>
          </Glow>
        </GlowArea>
        <li className="flex items-center">
          {isPending ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded" />
          ) : isAuthenticated ? (
            <div className="relative flex items-center gap-2">
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    className="nav-menu"
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
    </motion.nav>
  );
};

export default Navigation;