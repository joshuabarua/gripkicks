"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth";
import AuthButton from "@/components/auth-button";
import NavButton from "@/components/ui/nav-button";
import { motion, AnimatePresence } from "framer-motion";
import NavLinks from "@/components/ui/nav-links";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SignOutButton } from "@/components/signout-button";
import { User } from "lucide-react";
import { useOrientation } from "@/hooks/useOrientationScale";

const menu = {
  open: {
    width: "420px",
    height: "540px",
    top: "-25px",
    right: "-25px",
    transition: { duration: 0.75, type: "tween", ease: [0.76, 0, 0.24, 1] },
  },
  closed: {
    width: "80px",
    height: " 35px",
    top: "-0px",
    right: "-0px",
    transition: {
      duration: 0.75,
      delay: 0.35,
      type: "tween",
      ease: [0.76, 0, 0.24, 1],
    },
  },
  closedText: {
    width: "80px",
    height: " 35px",
    top: "-0px",
    right: "-0px",
    transition: {
      duration: 0.25,
      delay: 0.25,
      type: "tween",
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const Navigation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { orientation, screenWidth } = useOrientation();

  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const isPhonePortrait =
    orientation === "portrait" && screenWidth > 0 && screenWidth < 768;
  const menuVariants = isPhonePortrait
    ? {
        open: {
          width: "min(92vw, 360px)",
          height: "500px",
          top: "-18px",
          right: "-12px",
          transition: {
            duration: 0.75,
            type: "tween",
            ease: [0.76, 0, 0.24, 1],
          },
        },
        closed: menu.closed,
        closedText: menu.closedText,
      }
    : menu;

  const closeMenu = () => setIsActive(false);

  useEffect(() => {
    setIsActive(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    if (isActive) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActive]);

  return (
    <motion.nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-black/90 backdrop-blur-md border-b border-white/[0.06]"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <ul className="flex justify-between items-center text-foreground w-full">
        <li className="flex-1">
          <Link href="/" className="inline-block">
            <h1 className="font-ball-pill text-fluid-2xl whitespace-nowrap transition-transform duration-700 ease-in-out hover:scale-105">
              Grip Kicks
            </h1>
          </Link>
        </li>

        <li className="flex items-center justify-end">
          {isAuthenticated ? (
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
                    <div className="flex h-full flex-col p-4 pt-16">
                      {session?.user && (
                        <div className="mb-4 rounded-2xl border border-black/10 bg-black/10 p-3 text-black">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              userId={session.user.id}
                              name={session.user.name}
                              email={session.user.email}
                              className="h-11 w-11 rounded-full border border-black/10"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-sora text-sm font-semibold leading-none">
                                {session.user.name}
                              </p>
                              <p className="truncate pt-1 font-sora text-[11px] leading-none text-black/55">
                                {session.user.email}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1.5 border-t border-black/10 pt-3">
                            <Link
                              href="/profile"
                              onClick={closeMenu}
                              className="flex w-full items-center gap-2 rounded-xl px-2 py-2 font-sora text-sm text-black transition-colors hover:bg-black/10"
                            >
                              <User className="h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                            <SignOutButton
                              variant="ghost"
                              className="h-auto w-full justify-start rounded-xl px-2 py-2 font-sora text-sm text-black hover:bg-black/10 hover:text-black"
                              onClick={closeMenu}
                            />
                          </div>
                        </div>
                      )}
                      <div className="min-h-0 flex-1">
                        <NavLinks />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <NavButton
                isActive={isActive}
                toggleMenu={() => setIsActive(!isActive)}
              />
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
