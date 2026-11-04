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

const ballPill = localFont({
  src: "../../public/fonts/BallPill-regular.otf",
  variable: "--font-ball-pill",
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
      <body className={`min-h-screen bg-background antialiased ${dmMono.variable} ${ballPill.variable} ${soCloudy.variable}`}>
        <ViewTransition
          name="page"
          default="none"
          update={{
            "page-nav": "page-wipe",
            "to-sanctuary": "sanctuary-wipe",
            "from-sanctuary": "sanctuary-wipe",
            default: "none",
          }}
        >
          <AppShell>{children}</AppShell>
        </ViewTransition>
      </body>
    </html>
  );
}
