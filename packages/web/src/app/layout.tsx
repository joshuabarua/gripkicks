"use client"

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Footer from "./footer/page";
import Navigation from "./navigation/page";
import localFont from 'next/font/local'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

const metadata: Metadata = {
  title: "Grip Kicks App",
  description: "Find your new climbing shoes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`min-h-screen bg-background antialiased  ${basteleur.variable} ${sora.variable} ${tanker.variable}`}
      >
        <QueryClientProvider client={queryClient}>
          <Navigation />
          {children}
          <Footer />
        </QueryClientProvider>
      </body>
    </html>
  );
}
