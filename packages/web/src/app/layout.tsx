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
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`min-h-screen bg-background antialiased ${basteleur.variable} ${sora.variable} ${tanker.variable} ${soCloudy.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
