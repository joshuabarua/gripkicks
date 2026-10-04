import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function PageSurface({ className, ...props }: ComponentPropsWithoutRef<"main">) {
  return <main className={cn("min-h-svh bg-brand-base text-brand-chalk [--brand-base-rgb:24_26_29] [--brand-surface-rgb:48_51_56] [--brand-charcoal-rgb:68_72_79]", className)} {...props} />;
}
