import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function PageSurface({ className, ...props }: ComponentPropsWithoutRef<"main">) {
  return <main className={cn("min-h-svh overflow-x-clip bg-black text-brand-chalk", className)} {...props} />;
}
