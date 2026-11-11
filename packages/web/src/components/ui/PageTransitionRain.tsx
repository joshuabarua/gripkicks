"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";
import { RAIN_IMAGE_URLS, RAIN_PIECES, RAIN_TRANSITION_CSS } from "@/lib/transition-rain";

export default function PageTransitionRain() {
  const pathname = usePathname();
  return (
    <>
      <style>{RAIN_TRANSITION_CSS}</style>
      {Object.values(RAIN_IMAGE_URLS).map((href) => (
        <link
          key={href}
          rel="preload"
          as="image"
          type="image/webp"
          href={href}
          media="(prefers-reduced-motion: no-preference)"
          fetchPriority="low"
        />
      ))}
      {RAIN_PIECES.map((_, index) => (
        <ViewTransition
          key={`page-rain-${index}`}
          name={`page-rain-${index}`}
          default="none"
          update={{ "page-nav": "page-rain", default: "none" }}
        >
          <span aria-hidden="true" className="absolute size-0 overflow-hidden">
            {pathname}
          </span>
        </ViewTransition>
      ))}
    </>
  );
}
