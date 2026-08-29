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
    if (pathname !== prevPathname) {
      const shouldShowNavigationLoader = () => {
        const nextTopLevel = pathname.split("/")[1] || "home";
        const prevTopLevel = prevPathname.split("/")[1] || "home";

        // Only show for top-level navigation
        if (nextTopLevel === prevTopLevel) {
          return false;
        }

        // Shorter cooldown for navigation (1.5 seconds instead of 10)
        const now = Date.now();
        const lastNavAt = Number(
          window.sessionStorage.getItem("gk:lastNavigationAt") || 0,
        );

        if (now - lastNavAt < 1500) {
          return false;
        }

        window.sessionStorage.setItem("gk:lastNavigationAt", String(now));
        return true;
      };

      if (shouldShowNavigationLoader()) {
        setIsNavigating(true);
        const timeout = setTimeout(() => {
          setIsNavigating(false);
          setPrevPathname(pathname);
        }, 450);

        return () => clearTimeout(timeout);
      } else {
        setPrevPathname(pathname);
      }
    }
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
