import "./globals.css";
import localFont from "next/font/local";
import AppShell from "@/components/AppShell";

const basteleur = localFont({
  src: "../../public/fonts/Basteleur-Bold.otf",
  variable: "--font-basteleur",
});

const sora = localFont({
  src: "../../public/fonts/Sora.ttf",
  variable: "--font-sora",
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
      <body className={`min-h-screen bg-background antialiased ${basteleur.variable} ${sora.variable} ${ballPill.variable} ${soCloudy.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
