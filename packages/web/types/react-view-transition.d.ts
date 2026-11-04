import type { ExoticComponent, ReactNode } from "react";

declare module "react" {
  export const ViewTransition: ExoticComponent<{
    children?: ReactNode | undefined;
    className?: string | undefined;
    name?: "auto" | (string & {}) | undefined;
    default?: "none" | (string & {}) | undefined;
    enter?: "none" | (string & {}) | undefined;
    exit?: "none" | (string & {}) | undefined;
    share?: "none" | (string & {}) | undefined;
    update?: "none" | (string & {}) | undefined;
    layout?: "none" | (string & {}) | undefined;
  }>;
}
