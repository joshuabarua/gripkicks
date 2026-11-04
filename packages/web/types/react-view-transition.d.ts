import type { ExoticComponent, ReactNode } from "react";

type ViewTransitionClass = "none" | (string & {});
type ViewTransitionClassByType = ViewTransitionClass | Record<string, string>;

declare module "react" {
  export const ViewTransition: ExoticComponent<{
    children?: ReactNode | undefined;
    className?: string | undefined;
    name?: "auto" | (string & {}) | undefined;
    default?: ViewTransitionClassByType | undefined;
    enter?: ViewTransitionClassByType | undefined;
    exit?: ViewTransitionClassByType | undefined;
    share?: ViewTransitionClassByType | undefined;
    update?: ViewTransitionClassByType | undefined;
    layout?: ViewTransitionClassByType | undefined;
  }>;
}
