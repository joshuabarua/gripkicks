import { Context } from 'hono';
import { auth } from '../config/auth.config';
import { logApiError, createErrorResponse } from '../utils/errorLogger';

function checkAuth(c: Context) {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized', error: 'User not found in context' }, 401);
  }
  return null;
}

function validateRequiredFields(body: any, fields: string[]) {
  const missing = fields.filter(field => !body[field]);
  if (missing.length > 0) {
    return { valid: false, message: `${fields.join(' and ')} are required` };
  }
  return { valid: true };
}

async function callAuthApi(apiCall: Promise<any>, operation: string, userId: string, url: string, method: string) {
  try {
    const response = await apiCall;
    if (typeof response === 'object' && response !== null) {
      if ('success' in response && !response.success) {
        return { success: false, message: (response as any).message || `Failed to ${operation}` };
      }
      return { success: true, response };
    }
    return { success: true, response };
  } catch (authError) {
    logApiError(`Better Auth ${operation} failed`, authError, { method, url, userId });
    return { success: false, message: `Failed to process ${operation} request` };
  }
}

export const changeEmail = async (c: Context): Promise<Response> => {
  const authError = checkAuth(c);
  if (authError) return authError;

  const user = c.get('user');

  try {
    const body = await c.req.json();
    const { newEmail, password } = body;

    const validation = validateRequiredFields(body, ['newEmail', 'password']);
    if (!validation.valid) {
      return c.json({ success: false, message: validation.message }, 400);
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(newEmail)) {
      return c.json({ success: false, message: 'Please enter a valid email address' }, 400);
    }

    const result = await callAuthApi(
      auth.api.changeEmail({
        body: { newEmail },
        headers: c.req.raw.headers,
      }),
      'changeEmail',
      user.id,
      '/api/v1/auth/change-email',
      'POST'
    );

    if (!result.success) {
      return c.json({ success: false, message: result.message }, 500);
    }

    return c.json({
      success: true,
      message: 'Verification email sent to your new email address',
    });
  } catch (error) {
    logApiError('Failed to change email', error, {
      method: 'POST',
      url: '/api/v1/auth/change-email',
      userId: user.id,
    });
    return c.json(createErrorResponse(error, 'Failed to change email'), 500);
  }
};

export const deleteAccount = async (c: Context): Promise<Response> => {
  const authError = checkAuth(c);
  if (authError) return authError;

  const user = c.get('user');

  try {
    const body = await c.req.json();
    const { password } = body;

    const validation = validateRequiredFields(body, ['password']);
    if (!validation.valid) {
      return c.json({ success: false, message: 'Password is required to delete account' }, 400);
    }

    const result = await callAuthApi(
      auth.api.deleteUser({
        body: { password },
        headers: c.req.raw.headers,
      }),
      'deleteUser',
      user.id,
      '/api/v1/auth/delete-account',
      'DELETE'
    );

    if (!result.success) {
      return c.json({ success: false, message: result.message }, 500);
    }

    if (result.response?.headers?.get) {
      const sessionCookie = result.response.headers.get('set-cookie');
      if (sessionCookie) {
        c.header('set-cookie', sessionCookie);
      }
    }

    return c.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    logApiError('Failed to delete account', error, {
      method: 'DELETE',
      url: '/api/v1/auth/delete-account',
      userId: user.id,
    });
    return c.json(createErrorResponse(error, 'Failed to delete account'), 500);
  }
};

export const changePassword = async (c: Context): Promise<Response> => {
  const authError = checkAuth(c);
  if (authError) return authError;

  const user = c.get('user');

  try {
    const body = await c.req.json();
    const { currentPassword, newPassword } = body;

    const validation = validateRequiredFields(body, ['currentPassword', 'newPassword']);
    if (!validation.valid) {
      return c.json({ success: false, message: 'Current password and new password are required' }, 400);
    }

    if (newPassword.length < 8) {
      return c.json({ success: false, message: 'New password must be at least 8 characters long' }, 400);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return c.json({ success: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }, 400);
    }

    const result = await callAuthApi(
      auth.api.changePassword({
        body: { currentPassword, newPassword },
        headers: c.req.raw.headers,
      }),
      'changePassword',
      user.id,
      '/api/v1/auth/change-password',
      'POST'
    );

    if (!result.success) {
      return c.json({ success: false, message: result.message }, 500);
    }

    return c.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logApiError('Failed to change password', error, {
      method: 'POST',
      url: '/api/v1/auth/change-password',
      userId: user.id,
    });
    return c.json(createErrorResponse(error, 'Failed to change password'), 500);
  }
};
