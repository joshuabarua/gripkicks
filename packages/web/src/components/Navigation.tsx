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
import { UserAvatar } from '@/components/ui/UserAvatar';
import { SignOutButton } from '@/components/signout-button';
import { User } from 'lucide-react';
import { useOrientation } from "@/hooks/useOrientationScale";

const menu = {
  open: {
    width: "420px",
    height: "460px",
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { orientation, screenWidth } = useOrientation();

  // Use Better Auth session hook to check if user is authenticated
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user;
  const isPhonePortrait =
    orientation === "portrait" && screenWidth > 0 && screenWidth < 768;
  const menuVariants = isPhonePortrait
    ? {
      open: {
        width: "min(92vw, 360px)",
        height: "430px",
        top: "-18px",
        right: "-12px",
        transition: { duration: 0.75, type: "tween", ease: [0.76, 0, 0.24, 1] }
      },
      closed: menu.closed,
      closedText: menu.closedText
    }
    : menu;

  // Function to close menu (used after logout)
  const closeMenu = () => setIsActive(false);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);

  // Handle mouse movement and scroll to show navigation
  const handleUserActivity = useCallback(() => {
    setIsVisible(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to hide navigation after 3 seconds of inactivity
    // Only hide if the menu is NOT active
    if (!isActive) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  }, [isActive]);

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
    setIsProfileMenuOpen(false);
  }, [pathname]);

  // Add click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsActive(false);
        setIsProfileMenuOpen(false);
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
      className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-black/90 backdrop-blur-md border-b border-white/[0.06]"
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <ul className="flex justify-between items-center text-foreground w-full">
        <li className="flex-1">
          <GlowArea className="w-[120px] z-4">
            <Glow color="whitesmoke" className="rounded-sm flex justify-center items-center">
              <Link href="/">
                <h1 className="font-tanker text-fluid-2xl hover:scale-105 duration-1000 ease-in-out whitespace-nowrap">Grip Kicks</h1>
              </Link>
            </Glow>
          </GlowArea>
        </li>

        {/* Center element - User Avatar */}
        <li className="flex-1 flex justify-center">
          {isAuthenticated && session?.user && (
            <div className="relative flex items-start justify-center w-10">
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -140 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -140 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute left-1/2 top-[-200px] z-0 w-[15rem] -translate-x-1/2"
                  >
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0.35 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0.35 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: 'top center' }}
                      className="flex min-h-[28rem] overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-brand-surface pt-24 shadow-2xl"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.12, duration: 0.18, ease: 'easeOut' }}
                        className="flex w-full flex-col justify-end px-3 pb-3 text-brand-text"
                      >
                        <div className="px-2 pb-3">
                          <div className="flex flex-col space-y-1 font-sora">
                            <p className="text-sm font-medium leading-none">{session.user.name}</p>
                            <p className="text-xs leading-none text-brand-text-secondary">{session.user.email}</p>
                          </div>
                        </div>
                        <div className="h-px bg-brand-border" />
                        <div className="pt-2">
                          <Link
                            href="/profile"
                            onClick={closeProfileMenu}
                            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 font-sora text-sm text-brand-text transition-colors hover:bg-brand-soft-surface"
                          >
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </div>
                        <div className="mt-2 h-px bg-brand-border" />
                        <div className="pt-2">
                          <SignOutButton
                            variant="ghost"
                            className="h-auto w-full justify-start rounded-xl px-2 py-2 font-sora text-sm text-brand-text hover:bg-brand-soft-surface"
                            onClick={() => {
                              closeProfileMenu();
                              closeMenu();
                            }}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setIsProfileMenuOpen((open) => !open)}
                className="relative z-10 transition-transform hover:scale-105 outline-none rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <UserAvatar
                  userId={session.user.id}
                  name={session.user.name}
                  email={session.user.email}
                  className="h-10 w-10"
                />
              </button>
            </div>
          )}
        </li>

        <li className="flex-1 flex justify-end items-center">
          {isPending ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded" />
          ) : isAuthenticated ? (
            <div className="relative flex items-center ">
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    className="nav-menu"
                    variants={menuVariants}
                    animate={isActive ? "open" : "closed"}
                    initial="closed"
                    exit="closed"
                  >
                    <NavLinks />
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