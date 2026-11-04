"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

function hrefPathname(href: ComponentProps<typeof Link>["href"]): string {
  if (typeof href === "string") return href.split(/[?#]/)[0] ?? "";
  return href.pathname ?? "";
}

export default function NavLink(props: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const toSanctuary = hrefPathname(props.href) === "/stash";
  const onSanctuary = pathname?.startsWith("/stash") ?? false;
  const transitionTypes =
    toSanctuary && !onSanctuary
      ? ["to-sanctuary"]
      : onSanctuary && !toSanctuary
        ? ["from-sanctuary"]
        : ["page-nav"];
  return <Link transitionTypes={transitionTypes} {...props} />;
}
