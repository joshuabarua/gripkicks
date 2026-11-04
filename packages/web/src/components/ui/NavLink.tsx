"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

export default function NavLink(props: ComponentProps<typeof Link>) {
  return <Link transitionTypes={["page-nav"]} {...props} />;
}
