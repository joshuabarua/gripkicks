"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

export default function WipeTrigger() {
  const pathname = usePathname();
  return (
    <ViewTransition
      name="vt-trigger"
      update={{ "page-nav": "page-wipe", default: "none" }}
    >
      <span aria-hidden="true" className="absolute size-0 overflow-hidden">
        {pathname}
      </span>
    </ViewTransition>
  );
}
