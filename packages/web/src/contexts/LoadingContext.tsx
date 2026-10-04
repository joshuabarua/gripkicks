"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface LoadingContextType {
  isLoading: boolean;
  showLoader: (source?: string) => void;
  hideLoader: (source?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingSources, setLoadingSources] = useState<Set<string>>(new Set());

  const showLoader = useCallback((source = "unknown") => {
    setLoadingSources((prev) => prev.has(source) ? prev : new Set(prev).add(source));
  }, []);

  const hideLoader = useCallback((source = "unknown") => {
    setLoadingSources((prev) => {
      if (!prev.has(source)) return prev;
      const next = new Set(prev);
      next.delete(source);
      return next;
    });
  }, []);

  // Handle navigation-based loading
  const isLoading = loadingSources.size > 0;

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
