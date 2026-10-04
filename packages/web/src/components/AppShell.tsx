"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Providers from "@/components/providers";
import ImageKitProvider from "@/components/ImageKitProvider";
import { ToastProvider } from "@/components/ui/toast";
import { useUserSync } from "@/hooks/useUserSync";
import { OrientationInitializer } from "@/components/OrientationInitializer";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { PageTransition } from "@/components/PageTransition";
import { KonamiGrippy, RunningGrippy } from "@/components/GrippyKickkyy";
import BootLoader from "@/components/BootLoader";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  useUserSync();
  const [isHydrated, setIsHydrated] = useState(false);
  const cloudflareBeaconToken = process.env["NEXT_PUBLIC_CF_BEACON_TOKEN"];
  const cloudflareBeaconSrc =
    process.env["NEXT_PUBLIC_CF_BEACON_SRC"] ||
    "https://static.cloudflareinsights.com/beacon.min.js";

  useEffect(() => {
    const apiUrl = process.env["NEXT_PUBLIC_API_URL"];
    if (!apiUrl) return;
    if (sessionStorage.getItem("backend-warmed")) return;

    const warmBackend = async () => {
      try {
        await fetch(`${apiUrl}/health`, {
          method: "GET",
          cache: "no-store",
        });
        sessionStorage.setItem("backend-warmed", "1");
      } catch {
        return;
      }
    };

    void warmBackend();
  }, []);

  useEffect(() => {
    const hydrationFrame = requestAnimationFrame(() => {
      setIsHydrated(true);
    });

    return () => {
      cancelAnimationFrame(hydrationFrame);
    };
  }, []);

  return (
    <>
      <div>
        <BootLoader visible={!isHydrated} />
        {cloudflareBeaconToken ? (
          <Script
            src={cloudflareBeaconSrc}
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({ token: cloudflareBeaconToken })}
          />
        ) : null}
        <Providers>
          <OrientationInitializer />
          <ToastProvider>
            <ImageKitProvider>
              <PageTransition>
                <Navigation />
                <OnboardingGuard>
                  <div className="pt-14">{children}</div>
                  <Footer />
                  <KonamiGrippy />
                  <RunningGrippy />
                </OnboardingGuard>
              </PageTransition>
            </ImageKitProvider>
          </ToastProvider>
        </Providers>
      </div>
    </>
  );
}
