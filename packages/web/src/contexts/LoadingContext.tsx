"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

interface LoadingContextType {
  isLoading: boolean;
  showLoader: (source?: string) => void;
  hideLoader: (source?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingSources, setLoadingSources] = useState<Set<string>>(new Set());
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  const isLoading = loadingSources.size > 0 || isNavigating;

  const showLoader = useCallback((source = "unknown") => {
    setLoadingSources((prev) => new Set(prev).add(source));
  }, []);

  const hideLoader = useCallback((source = "unknown") => {
    setLoadingSources((prev) => {
      const next = new Set(prev);
      next.delete(source);
      return next;
    });
  }, []);

  // Handle navigation-based loading
  useEffect(() => {
    if (pathname === prevPathname) return;

    let navigationTimeout: ReturnType<typeof setTimeout> | undefined;
    const transitionTimeout = setTimeout(() => {
      const nextTopLevel = pathname.split("/")[1] || "home";
      const prevTopLevel = prevPathname.split("/")[1] || "home";

      if (nextTopLevel === prevTopLevel) {
        setPrevPathname(pathname);
        return;
      }

      const now = Date.now();
      const lastNavAt = Number(
        window.sessionStorage.getItem("gk:lastNavigationAt") || 0,
      );

      if (now - lastNavAt < 1500) {
        setPrevPathname(pathname);
        return;
      }

      window.sessionStorage.setItem("gk:lastNavigationAt", String(now));
      setIsNavigating(true);
      navigationTimeout = setTimeout(() => {
        setIsNavigating(false);
        setPrevPathname(pathname);
      }, 450);
    }, 0);

    return () => {
      clearTimeout(transitionTimeout);
      if (navigationTimeout !== undefined) {
        clearTimeout(navigationTimeout);
      }
    };
  }, [pathname, prevPathname]);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
