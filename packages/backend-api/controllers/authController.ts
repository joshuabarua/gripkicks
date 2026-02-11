import { Context } from 'hono';
import { auth } from '../config/auth.config';
import { logApiError, createErrorResponse } from '../utils/errorLogger';

export const changeEmail = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized', error: 'User not found in context' }, 401);
  }

  try {
    const body = await c.req.json();
    const { newEmail, password } = body;

    if (!newEmail || !password) {
      return c.json({ 
        success: false, 
        message: 'New email and password are required' 
      }, 400);
    }

    // Improved email validation
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(newEmail)) {
      return c.json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      }, 400);
    }

    let response;
    try {
      // Use Better Auth's internal API to change email
      response = await auth.api.changeEmail({
        body: {
          newEmail,
        },
        // Pass the user session from the request
        headers: c.req.raw.headers,
      });
    } catch (authError) {
      logApiError('Better Auth changeEmail failed', authError, {
        method: 'POST',
        url: '/api/v1/auth/change-email',
        userId: user.id,
      });
      return c.json({ 
        success: false, 
        message: 'Failed to process email change request' 
      }, 500);
    }

    if (typeof response === 'object' && response !== null) {
      if ('success' in response && !response.success) {
        return c.json({ 
          success: false, 
          message: (response as any).message || 'Failed to change email' 
        }, 400);
      }
      // Success case
      return c.json({
        success: true,
        message: 'Verification email sent to your new email address',
      });
    }

    // Fallback for unexpected response format
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
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized', error: 'User not found in context' }, 401);
  }

  try {
    const body = await c.req.json();
    const { password } = body;

    if (!password) {
      return c.json({ 
        success: false, 
        message: 'Password is required to delete account' 
      }, 400);
    }

    let response;
    try {
      // Use Better Auth's internal API to delete user
      response = await auth.api.deleteUser({
        body: {
          password,
        },
        // Pass the user session from the request
        headers: c.req.raw.headers,
      });
    } catch (authError) {
      logApiError('Better Auth deleteUser failed', authError, {
        method: 'DELETE',
        url: '/api/v1/auth/delete-account',
        userId: user.id,
      });
      return c.json({ 
        success: false, 
        message: 'Failed to process account deletion request' 
      }, 500);
    }

    if (typeof response === 'object' && response !== null) {
      if ('success' in response && !response.success) {
        return c.json({ 
          success: false, 
          message: (response as any).message || 'Failed to delete account' 
        }, 400);
      }
      // Success case - clear session if available
      if ('headers' in response && (response as any).headers?.get) {
        const sessionCookie = (response as any).headers.get('set-cookie');
        if (sessionCookie) {
          c.header('set-cookie', sessionCookie);
        }
      }
      return c.json({
        success: true,
        message: 'Account deleted successfully',
      });
    }

    // Fallback for unexpected response format
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
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized', error: 'User not found in context' }, 401);
  }

  try {
    const body = await c.req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return c.json({ 
        success: false, 
        message: 'Current password and new password are required' 
      }, 400);
    }

    if (newPassword.length < 8) {
      return c.json({ 
        success: false, 
        message: 'New password must be at least 8 characters long' 
      }, 400);
    }

    // Improved password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return c.json({ 
        success: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      }, 400);
    }

    let response;
    try {
      // Use Better Auth's internal API to change password
      response = await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        // Pass the user session from the request
        headers: c.req.raw.headers,
      });
    } catch (authError) {
      logApiError('Better Auth changePassword failed', authError, {
        method: 'POST',
        url: '/api/v1/auth/change-password',
        userId: user.id,
      });
      return c.json({ 
        success: false, 
        message: 'Failed to process password change request' 
      }, 500);
    }

    if (typeof response === 'object' && response !== null) {
      if ('success' in response && !response.success) {
        return c.json({ 
          success: false, 
          message: (response as any).message || 'Failed to change password' 
        }, 400);
      }
      // Success case
      return c.json({
        success: true,
        message: 'Password changed successfully',
      });
    }

    // Fallback for unexpected response format
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
