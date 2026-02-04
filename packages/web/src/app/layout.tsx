"use client"

import "./globals.css";
import Footer from "./footer/page";
import Navigation from "./navigation/page";
import localFont from 'next/font/local'
import Providers from '@/components/providers';
import ImageKitProvider from '@/components/ImageKitProvider';
import { ToastProvider } from '@/components/ui/toast';
import { ToastContainer } from '@/components/ui/toast-container';
import { useUserSync } from '@/hooks/useUserSync';
import { OrientationInitializer } from '@/components/OrientationInitializer';
import { OnboardingGuard } from '@/components/OnboardingGuard';

const basteleur = localFont({
  src: '../../public/fonts/Basteleur-Bold.otf',
  variable: '--font-basteleur',
})

const sora = localFont({
  src: '../../public/fonts/Sora.ttf',
  variable: '--font-sora',
})

const tanker = localFont({
  src: '../../public/fonts/Tanker-Regular.ttf',
  variable: '--font-tanker',
})

const soCloudy = localFont({
  src: '../../public/fonts/SoCloudy.otf',
  variable: '--font-so-cloudy',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sync user to Convex when authenticated
  useUserSync();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`min-h-screen bg-background antialiased ${basteleur.variable} ${sora.variable} ${tanker.variable} ${soCloudy.variable}`}
      >
        <Providers>
          <OrientationInitializer />
          <ToastProvider>
            <ImageKitProvider>
              <OnboardingGuard>
                <Navigation />
                {children}
                <Footer />
              </OnboardingGuard>
              <ToastContainer />
            </ImageKitProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
