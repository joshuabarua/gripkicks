import { posthog } from '@/lib/posthog';

type AuthenticationAction = 'sign_in' | 'sign_up' | 'sign_out';

export const posthogLogger = {
  authenticationCompleted(action: AuthenticationAction) {
    posthog?.logger.info('authentication_completed', {
      logger_name: 'gripkicks_posthog',
      action,
    });
  },

  footProfileSaved() {
    posthog?.logger.info('foot_profile_saved', {
      logger_name: 'gripkicks_posthog',
    });
  },
};
