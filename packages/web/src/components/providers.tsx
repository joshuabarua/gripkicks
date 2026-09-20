"use client";

import React, { useEffect } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { useBetterAuthForConvex } from "@/lib/auth";

const convexUrl =
  process.env["NEXT_PUBLIC_CONVEX_URL"] || "http://127.0.0.1:3210";
const convex = new ConvexReactClient(convexUrl);

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
        <ConvexProviderWithAuth client={convex} useAuth={useBetterAuthForConvex}>
          {children}
        </ConvexProviderWithAuth>
      </LoadingProvider>
    </PostHogProvider>
  );
}
