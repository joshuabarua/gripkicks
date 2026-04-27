"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { LoadingProvider } from "@/contexts/LoadingContext";
import FootProfileSync from "@/components/FootProfileSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

const convexUrl = process.env["NEXT_PUBLIC_CONVEX_URL"];
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env["NEXT_PUBLIC_POSTHOG_KEY"];
    if (!key) return;

    posthog.init(key, {
      api_host:
        process.env["NEXT_PUBLIC_POSTHOG_HOST"] || "https://eu.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <LoadingProvider>
        {convex ? (
          <ConvexProvider client={convex}>
            <QueryClientProvider client={queryClient}>
              <FootProfileSync />
              {children}
            </QueryClientProvider>
          </ConvexProvider>
        ) : (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )}
      </LoadingProvider>
    </PostHogProvider>
  );
}
