import posthog from "posthog-js";

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsValue>;

const canTrack = (): boolean => {
  return typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_POSTHOG_KEY;
};

export const analyticsEvents = {
  signupStarted: "signup_started",
  signupSucceeded: "signup_succeeded",
  signupFailed: "signup_failed",
  stashShoeAdded: "stash_shoe_added",
  stashShoeRemoved: "stash_shoe_removed",
  stashFavouriteToggled: "stash_favourite_toggled",
  checkoutStarted: "checkout_started",
  checkoutRedirected: "checkout_redirected",
  checkoutFailed: "checkout_failed",
  checkoutSucceeded: "checkout_succeeded",
  founderGranted: "founder_granted",
} as const;

export function track(event: string, properties?: AnalyticsProperties): void {
  if (!canTrack()) return;
  posthog.capture(event, properties);
}

export function identify(
  userId: string,
  properties?: AnalyticsProperties,
): void {
  if (!canTrack()) return;
  posthog.identify(userId, properties);
}

export function resetAnalytics(): void {
  if (!canTrack()) return;
  posthog.reset();
}

export function captureError(
  error: unknown,
  context?: AnalyticsProperties,
): void {
  const message = error instanceof Error ? error.message : "Unknown error";
  track("client_error", {
    message,
    ...(context || {}),
  });
}
