"use client";

import { usePathname } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import { LoadingBar } from "@/components/ui/loading";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading();
  const pathname = usePathname();

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-9999 h-0.5 overflow-hidden" aria-hidden="true">
        {isLoading ? (
          <LoadingBar size="full" />
        ) : (
          <div key={pathname} className="route-trail h-full w-full origin-left bg-brand-red" />
        )}
      </div>
      {children}
    </>
  );
}
