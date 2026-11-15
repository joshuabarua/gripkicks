import Constants from 'expo-constants';
import PostHog from 'posthog-react-native';

const extra = Constants.expoConfig?.extra;
const projectToken = extra?.posthogProjectToken as string | undefined;
const host = extra?.posthogHost as string | undefined;
const isConfigured = Boolean(projectToken && host);

// Analytics are optional: without a token the app runs with PostHog off.
if (!isConfigured && __DEV__) {
  console.warn('PostHog is off: set POSTHOG_PROJECT_TOKEN and POSTHOG_HOST to enable it.');
}

export const posthog =
  projectToken && host
    ? new PostHog(projectToken, {
        host,
        captureAppLifecycleEvents: true,
        logs: {
          serviceName: 'gripkicks-mobile',
          serviceVersion: Constants.expoConfig?.version,
          environment: __DEV__ ? 'development' : 'production',
        },
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
            console: [],
          },
        },
      })
    : null;
