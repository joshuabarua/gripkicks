"use client"

import "./globals.css";
import Footer from "./footer/page";
import Navigation from "./navigation/page";
import localFont from 'next/font/local'
import Providers from '@/components/providers';
import { useUserSync } from '@/hooks/useUserSync';

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
        className={`min-h-screen bg-background antialiased ${basteleur.variable} ${sora.variable} ${tanker.variable}`}
      >
        <Providers>
          <Navigation />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
