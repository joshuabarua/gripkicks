"use client";

import Link from "next/link";
import { useRef, type ComponentProps } from "react";

export const PAGE_NAVIGATION_EVENT = "gripkicks:page-navigation";

export interface PageNavigationRequest {
  href: string;
  replace: boolean;
  scroll: boolean;
  transitionTypes: string[];
}

export default function NavLink({ onClick, onNavigate, ...props }: ComponentProps<typeof Link>) {
  const capturedHref = useRef<string | null>(null);
  return (
    <Link
      transitionTypes={["page-nav"]}
      {...props}
      onClick={(event) => {
        capturedHref.current = event.currentTarget.href;
        onClick?.(event);
      }}
      onNavigate={(event) => {
        let prevented = false;
        onNavigate?.({
          preventDefault: () => {
            prevented = true;
            event.preventDefault();
          },
        });
        if (prevented) return;
        const resolved = new URL(capturedHref.current ?? String(props.href), window.location.href);
        const proceed = window.dispatchEvent(
          new CustomEvent<PageNavigationRequest>(PAGE_NAVIGATION_EVENT, {
            cancelable: true,
            detail: {
              href:
                resolved.origin === window.location.origin
                  ? resolved.pathname + resolved.search + resolved.hash
                  : resolved.href,
              replace: props.replace ?? false,
              scroll: props.scroll ?? true,
              transitionTypes: props.transitionTypes ?? ["page-nav"],
            },
          }),
        );
        if (!proceed) {
          event.preventDefault();
        }
      }}
    />
  );
}
