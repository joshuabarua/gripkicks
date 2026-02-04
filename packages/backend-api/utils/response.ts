import { Context } from 'hono';
import { Result } from 'neverthrow';
import { AppError } from '../src/lib/errors';

export function resultToHonoResponse<T>(
  c: Context,
  result: Result<T, AppError>
): Response {
  return result.match(
    (data) => {
      return c.json({
        success: true,
        data,
      });
    },
    (error) => {
      console.error('API Error:', error);
      
      return c.json(
        {
          success: false,
          error: {
            type: error.code,
            message: error.message,
            details: error,
          },
        },
        (error.statusCode || 500) as any
      );
    }
  );
}

export async function resultAsyncToHonoResponse<T>(
  c: Context,
  resultPromise: Promise<Result<T, AppError>>
): Promise<Response> {
  const result = await resultPromise;
  return resultToHonoResponse(c, result);
}
