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
import { useOrientationScale } from "@/hooks/useOrientationScale";
import dynamic from "next/dynamic";

const NavLogo = dynamic(() => import("@/components/3d/NavLogo"), {
  ssr: false,
  loading: () => (
    <span className="font-ball-pill text-fluid-2xl whitespace-nowrap">GripKicks</span>
  ),
});

const menu = {
  open: {
    width: "360px",
    height: "440px",
    top: "-15px",
    right: "-15px",
    transition: { duration: 0.75, type: "tween", ease: [0.76, 0, 0.24, 1] },
  },
  closed: {
    width: "72px",
    height: "28px",
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
    width: "72px",
    height: "28px",
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
  const [showLogo, setShowLogo] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { orientation, screenWidth } = useOrientationScale();

  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const isPhonePortrait =
    orientation === "portrait" && screenWidth > 0 && screenWidth < 768;
  const isHomePage = pathname === "/";
  const menuVariants = isPhonePortrait
    ? {
        open: {
          width: "min(92vw, 320px)",
          height: "400px",
          top: "-12px",
          right: "-10px",
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

  useEffect(() => {
    if (!isHomePage) {
      setShowLogo(true);
      return;
    }

    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setShowLogo(window.scrollY > heroHeight * 0.5);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

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
      className="fixed top-0 left-0 right-0 z-50 px-6 py-2 bg-black/90 backdrop-blur-md h-12 flex items-center justify-between"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className="flex items-center justify-start z-10">
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center"
            >
              <Link href="/" className="flex items-center">
                <NavLogo />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 flex justify-end items-center z-20">
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
                      <motion.div
                        custom={-1}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        variants={{
                          initial: {
                            opacity: 0,
                            rotateX: 90,
                            translateY: 80,
                            translateX: 10,
                          },
                          enter: {
                            opacity: 1,
                            rotateX: 0,
                            translateY: 0,
                            translateX: 0,
                            transition: {
                              duration: 0.65,
                              delay: 0.4,
                              ease: [0.215, 0.61, 0.355, 1],
                              opacity: { duration: 2 }
                            }
                          },
                          exit: {
                            opacity: 0,
                            transition: { duration: 0.6, type: "linear", ease: [0.76, 0, 0.24, 1] }
                          }
                        }}
                      >
                        <div className="mb-4 rounded-2xl border border-black/10 bg-black/10 p-3 text-black">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              userId={session.user.id}
                              name={session.user.name}
                              email={session.user.email}
                              className="h-11 w-11 rounded-full border border-black/10 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-sora text-sm font-semibold leading-none">
                                {session.user.name}
                              </p>
                              <p className="truncate pt-1 font-sora text-[11px] leading-none text-black/55">
                                {session.user.email}
                              </p>
                            </div>
                            <Link
                              href="/profile"
                              onClick={closeMenu}
                              className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-sora text-[10px] font-semibold uppercase tracking-wider text-black transition-colors hover:bg-black/10 shrink-0"
                            >
                              <User className="h-3.5 w-3.5" />
                              <span>Profile</span>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div className="min-h-0 flex-1">
                      <NavLinks
                        footerAction={
                          session?.user ? (
                            <SignOutButton
                              variant="ghost"
                              className="h-auto rounded-xl px-3 py-2 font-sora text-[10px] font-semibold uppercase tracking-wider text-black hover:bg-black/10 hover:text-black"
                              onClick={closeMenu}
                            />
                          ) : undefined
                        }
                      />
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
      </div>
    </motion.nav>
  );
};

export default Navigation;
