"use client";

import React, { useState, useEffect, useRef } from "react";
import Link, { PAGE_NAVIGATION_EVENT, type PageNavigationRequest } from "@/components/ui/NavLink";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth";
import AuthButton from "@/components/auth-button";
import NavButton from "@/components/ui/nav-button";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import NavLinks from "@/components/ui/nav-links";
import { menuCloseTransition } from "@/lib/motion";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SignOutButton } from "@/components/signout-button";
import { User } from "lucide-react";
import { useOrientationScale } from "@/hooks/useOrientationScale";
import dynamic from "next/dynamic";

const NavLogo = dynamic(() => import("@/components/3d/NavLogo"), {
  ssr: false,
  loading: () => (
    <span className="font-mono text-fluid-2xl whitespace-nowrap">GripKicks</span>
  ),
});

const menu = {
  open: {
    width: "360px",
    height: "400px",
    top: "-4px",
    right: "-15px",
    transition: { duration: 0.75, type: "tween", ease: [0.76, 0, 0.24, 1] },
  },
  closed: {
    width: "72px",
    height: "28px",
    top: "0px",
    right: "-0px",
    transition: menuCloseTransition,
  },
  closedText: {
    width: "72px",
    height: "28px",
    top: "-0px",
    right: "-0px",
    transition: menuCloseTransition,
  },
};

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const [isActive, setIsActive] = useState(false);
  const [showLogo, setShowLogo] = useState(!isHomePage);
  const [previousPathname, setPreviousPathname] = useState(pathname);
  const navRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pendingNavigation = useRef<{
    request: PageNavigationRequest;
    sourceUrl: string;
    startWidth: number;
  } | null>(null);

  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setIsActive(false);
    setShowLogo(!isHomePage);
  }
  const { orientation, screenWidth } = useOrientationScale();
  const reduceMotion = useReducedMotion();

  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user;
  const isPhonePortrait =
    orientation === "portrait" && screenWidth > 0 && screenWidth < 768;
  const menuVariants = {
    open: isPhonePortrait
      ? {
        width: "min(92vw, 320px)",
        height: "370px",
        top: "-4px",
        right: "-10px",
        transition: {
          duration: 0.75,
          type: "tween",
          ease: [0.76, 0, 0.24, 1],
        },
      }
      : menu.open,
    closed: reduceMotion
      ? { ...menu.closed, transition: { ...menuCloseTransition, duration: 0, delay: 0 } }
      : menu.closed,
    closedText: reduceMotion
      ? { ...menu.closedText, transition: { ...menuCloseTransition, duration: 0, delay: 0 } }
      : menu.closedText,
  };

  useEffect(() => {
    if (!isHomePage) return;

    const hero = document.getElementById("home-hero");
    if (!hero) {
      const frameId = requestAnimationFrame(() => setShowLogo(true));
      return () => cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowLogo(!(entry?.isIntersecting ?? false));
      },
      { threshold: 0.1 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHomePage]);

  const closeMenu = () => setIsActive(false);

  useEffect(() => {
    const holdNavigationForMenuClose = (event: Event) => {
      const menu = menuRef.current;
      if (!menu) {
        pendingNavigation.current = null;
        return;
      }
      event.preventDefault();
      pendingNavigation.current = {
        request: (event as CustomEvent<PageNavigationRequest>).detail,
        sourceUrl: window.location.href,
        startWidth: menu.getBoundingClientRect().width,
      };
      setIsActive(false);
    };
    window.addEventListener(PAGE_NAVIGATION_EVENT, holdNavigationForMenuClose);
    return () => window.removeEventListener(PAGE_NAVIGATION_EVENT, holdNavigationForMenuClose);
  }, []);

  const resumePendingNavigation = () => {
    const pending = pendingNavigation.current;
    if (!pending) return;
    pendingNavigation.current = null;
    if (pending.sourceUrl !== window.location.href) return;
    const { request } = pending;
    const options = { scroll: request.scroll, transitionTypes: request.transitionTypes };
    if (request.replace) {
      router.replace(request.href, options);
    } else {
      router.push(request.href, options);
    }
  };

  const handleMenuUpdate = (latest: { width?: unknown }) => {
    const pending = pendingNavigation.current;
    if (!pending) return;
    const width = Number.parseFloat(String(latest.width));
    if (!Number.isFinite(width)) return;
    const closedWidth = Number.parseFloat(String(menu.closed.width));
    const handoffWidth = closedWidth + Math.max(0, pending.startWidth - closedWidth) * 0.25;
    if (width <= handoffWidth) {
      resumePendingNavigation();
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      pendingNavigation.current = null;
    }
  }, [isAuthenticated]);

  useEffect(() => () => {
    pendingNavigation.current = null;
  }, []);

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
      className="fixed top-0 left-0 right-0 z-50 px-6 py-2 border-b border-white/20 bg-brand-base/55 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,0,0,0.18)] h-12 flex items-center justify-between"
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
        {!isPending && (isAuthenticated ? (
          <div key="menu" className="lab-fade relative flex translate-y-[0.5px] items-center">
            <AnimatePresence
              mode="wait"
              onExitComplete={() => queueMicrotask(resumePendingNavigation)}
            >
              {isActive && (
                <motion.div
                  ref={menuRef}
                  className="nav-menu"
                  variants={menuVariants}
                  animate={isActive ? "open" : "closed"}
                  initial="closed"
                  exit="closed"
                  onUpdate={handleMenuUpdate}
                >
                  <div className="flex h-full flex-col p-4 pt-12">
                    <div className="min-h-0 flex-1">
                      <NavLinks
                        profileSlot={
                          session?.user ? (
                            <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 p-1.5 pl-1 text-white">
                              <Link
                                href="/profile"
                                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
                              >
                                <User className="h-3.5 w-3.5" />
                                <span>Profile</span>
                              </Link>
                              <div className="min-w-0 flex-1 text-right">
                                <p className="truncate font-mono text-xs font-semibold leading-none text-white">
                                  {session.user.name}
                                </p>
                                <p className="truncate pt-1 font-mono text-[10px] leading-none text-white/60">
                                  {session.user.email}
                                </p>
                              </div>
                              <UserAvatar
                                userId={session.user.id}
                                name={session.user.name}
                                email={session.user.email}
                                className="h-8 w-8 shrink-0 rounded-full border border-white/20"
                              />
                            </div>
                          ) : undefined
                        }
                        footerAction={
                          session?.user ? (
                            <SignOutButton
                              variant="ghost"
                              className="h-auto rounded-xl px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-white/10 hover:text-white"
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
              toggleMenu={() => {
                if (!pendingNavigation.current) setIsActive(!isActive);
              }}
            />
          </div>
        ) : (
          <div key="signin" className="lab-fade">
            <AuthButton />
          </div>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navigation;
