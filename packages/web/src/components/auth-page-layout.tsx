"use client";

import dynamic from "next/dynamic";
import { PageSurface } from "@/components/ui/PageSurface";
import { riseDelay } from "@/lib/motion";

const ShoeField = dynamic(() => import("@/components/3d/ShoeField"), {
  ssr: false,
});

interface AuthPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AuthPageLayout({ title, children }: AuthPageLayoutProps) {
  return (
    <PageSurface className="relative isolate overflow-hidden">
      <ShoeField />
      <div className="flex min-h-[calc(100svh-3rem)] flex-1 items-center justify-center px-6 py-12 relative">
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r border-b border-white/6" />

        <div className="w-full max-w-md">
          <div className="lab-rise text-center mb-8" style={riseDelay(0)}>
            <h1 className="lab-title text-fluid-4xl">
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
