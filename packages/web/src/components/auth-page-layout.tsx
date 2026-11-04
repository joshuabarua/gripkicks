"use client";

import { PageSurface } from "@/components/ui/PageSurface";
import { riseDelay } from "@/lib/motion";

interface AuthPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AuthPageLayout({ title, children }: AuthPageLayoutProps) {
  return (
    <PageSurface>
      <div className="flex min-h-screen flex-1 items-center justify-center px-6 py-12 relative">
        <div className="absolute top-6 left-6 w-16 h-16 border-l border-t border-white/6" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r border-b border-white/6" />

        <div className="w-full max-w-md">
          <div className="lab-rise text-center mb-8" style={riseDelay(0)}>
            <h1 className="font-amatic text-fluid-6xl uppercase">
              {title}
            </h1>
          </div>

          <div className="lab-rise" style={riseDelay(1)}>
            {children}
          </div>
        </div>
      </div>
    </PageSurface>
  );
}
