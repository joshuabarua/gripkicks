"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import localFont from "next/font/local";
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

const basteleur = localFont({
  src: "../../public/fonts/Basteleur-Bold.otf",
  variable: "--font-basteleur",
});

const sora = localFont({
  src: "../../public/fonts/Sora.ttf",
  variable: "--font-sora",
});

const tanker = localFont({
  src: "../../public/fonts/Tanker-Regular.ttf",
  variable: "--font-tanker",
});

const soCloudy = localFont({
  src: "../../public/fonts/SoCloudy.otf",
  variable: "--font-so-cloudy",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sync user to Convex when authenticated
  useUserSync();
  const [showBootLoader, setShowBootLoader] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const cloudflareBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  const cloudflareBeaconSrc =
    process.env.NEXT_PUBLIC_CF_BEACON_SRC ||
    "https://static.cloudflareinsights.com/beacon.min.js";

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    const warmBackend = async () => {
      try {
        await fetch(`${apiUrl}/health`, {
          method: "GET",
          cache: "no-store",
        });
      } catch {
        // Ignore warm-up failures.
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

  useEffect(() => {
    if (!isHydrated) return;

    const minTimer = setTimeout(() => {
      setShowBootLoader(false);
    }, 1200);

    return () => {
      clearTimeout(minTimer);
    };
  }, [isHydrated]);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`min-h-screen bg-background antialiased ${basteleur.variable} ${sora.variable} ${tanker.variable} ${soCloudy.variable}`}
      >
        <BootLoader visible={showBootLoader} />
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
                <OnboardingGuard>
                  <Navigation />
                  <div className="mt-16">{children}</div>
                  <Footer />
                  <KonamiGrippy />
                  <RunningGrippy />
                </OnboardingGuard>
              </PageTransition>
            </ImageKitProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
