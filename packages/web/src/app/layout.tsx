"use client"

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { queryClient } from "@/lib/queryClient";
import {  QueryClientProvider } from "@tanstack/react-query";
import Footer from "./footer/page";
import Navigation from "./navigation/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
