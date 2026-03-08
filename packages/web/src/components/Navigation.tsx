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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menu = {
  open: {
    width: "520px",
    height: "520px",
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
      className="fixed top-0 left-0 right-0 z-50 p-fluid-md bg-background/99 backdrop-blur-sm border-b border-white"
      style={{ borderImage: 'none', borderColor: 'rgba(255, 255, 255, 0.8)' }}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="transition-transform hover:scale-105 outline-none rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <UserAvatar 
                    userId={session.user.id}
                    name={session.user.name}
                    email={session.user.email}
                    className="h-10 w-10 border-2 border-white/20"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 mt-2 z-[1000] border-white/10 bg-background/95 backdrop-blur-md">
                <DropdownMenuLabel className="font-sora">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild className="cursor-pointer font-sora focus:bg-accent/50">
                  <Link href="/profile" className="w-full flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild className="cursor-pointer font-sora focus:bg-accent/50 p-0">
                  <SignOutButton
                    variant="ghost"
                    className="w-full flex justify-start px-2 py-1.5 h-auto font-sora text-sm hover:bg-transparent"
                    onClick={closeMenu}
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                    variants={menu}
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