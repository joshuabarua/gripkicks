import "./globals.css";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import AppShell from "@/components/AppShell";

const dmMono = localFont({
  src: [
    { path: "../../public/fonts/DMMono-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/DMMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/DMMono-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-dm-mono",
});

const amatic = localFont({
  src: "../../public/fonts/Amatic-Bold.ttf",
  variable: "--font-amatic",
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
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`min-h-screen bg-background antialiased ${dmMono.variable} ${amatic.variable} ${soCloudy.variable}`}>
        <ViewTransition name="vt-trigger" update={{ "page-nav": "page-wipe", default: "none" }}>
          <span aria-hidden="true" className="absolute size-0 overflow-hidden" />
        </ViewTransition>
        <ViewTransition default="none">
          <AppShell>{children}</AppShell>
        </ViewTransition>
      </body>
    </html>
  );
}
