# Error Handling with Neverthrow

This document explains how error handling is implemented using the `neverthrow` library in the Gripkicks project.

## Overview

We use `neverthrow` to implement type-safe error handling throughout the application:
- Backend services return `Result<T, E>` types
- Frontend API calls return `ResultAsync<T, E>` types
- Errors are explicitly typed and handled

## Backend Implementation

### Error Types

All custom errors extend `AppError` and include:
- `code`: Error code for identification
- `statusCode`: HTTP status code
- `message`: Human-readable message

```typescript
// Example error classes
export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super('NOT_FOUND', message, 404);
  }
}
```

### Service Layer Pattern

Services return `Result<T, AppError>`:

```typescript
class UserService {
  async getUserById(id: string): Promise<Result<User, AppError>> {
    if (!id) {
      return Result.err(new ValidationError('User ID is required'));
    }

    try {
      const user = await this.findUserById(id);
      if (!user) {
        return Result.err(new NotFoundError('User not found'));
      }
      return Result.ok(user);
    } catch (error) {
      return Result.err(new AppError('DATABASE_ERROR', 'Failed to fetch user'));
    }
  }
}
```

### Controller Pattern

Controllers use the service layer and convert Results to Hono responses:

```typescript
export const getProfile = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    const result = userService.getUserById('');
    return resultToHonoResponse(c, result);
  }

  const result = await userService.getUserById(user.id);
  return resultToHonoResponse(c, result);
};
```

## Frontend Implementation

### API Client

The `fetchApi` function returns `ResultAsync<T, ApiError>`:

```typescript
export async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<ResultAsync<T, ApiError>> {
  return ResultAsync.fromPromise(
    // Fetch logic
    (async () => {
      const res = await fetch(`${apiBaseUrl}${path}`, options);
      
      if (!res.ok) {
        throw new ApiError({
          type: getErrorTypeFromStatus(res.status),
          message: errorData.message || `API error: ${res.status}`,
          details: errorData.details,
        });
      }
      
      return res.json();
    })(),
    (error) => {
      if (error instanceof ApiError) {
        return error;
      }
      return new ApiError({
        type: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown network error',
      });
    }
  );
}
```

### React Query Integration

Query functions unwrap Results:

```typescript
export function useProfile() {
  return useQuery<ProfileResponse, ApiError>({
    queryKey: ['profile'],
    queryFn: async () => {
      const result = await fetchApi<ProfileResponse>('/api/v1/profile');
      return result.match(
        (data) => data,
        (error) => {
          throw error;
        }
      );
    },
  });
}
```

### Custom Hooks for Async Operations

`useMutation` hook for handling mutations:

```typescript
const { data, error, isLoading, isSuccess, isError, mutate } = useMutation(
  (data: ProfileData) => fetchApi<void>('/api/v1/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
);

// Usage
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const result = await mutate(formData);
  
  if (result.isOk()) {
    console.log('Success!');
  }
};
```

## Error Display

### Error Component

```typescript
function ErrorDisplay({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const getErrorMessage = (error: ApiError) => {
    switch (error.type) {
      case 'UNAUTHORIZED':
        return 'Please sign in to view your profile';
      case 'NOT_FOUND':
        return 'Profile not found';
      case 'VALIDATION_ERROR':
        return 'Invalid request';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection';
      default:
        return error.message || 'An error occurred';
    }
  };

  return (
    <div className="p-4 border border-red-300 rounded-lg bg-red-50">
      <h3 className="text-red-800 font-semibold">Error</h3>
      <p className="text-red-600">{getErrorMessage(error)}</p>
      {canRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  );
}
```

### Error Boundary

Wrap components in ErrorBoundary to catch unexpected errors:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Best Practices

1. **Always handle both cases**: When working with Results, always handle both success and error cases using `.match()` or similar methods.

2. **Use specific error types**: Create specific error classes for different error scenarios instead of generic errors.

3. **Don't throw from services**: Services should return Results, not throw errors. Only wrap external APIs in `ResultAsync.fromPromise`.

4. **Consistent error responses**: Backend should return consistent error format with type, message, and optional details.

5. **User-friendly messages**: Map technical error types to user-friendly messages in the UI.

6. **Retry mechanisms**: For transient errors (network, timeout), provide retry functionality.

7. **Log errors**: Always log errors for debugging while showing user-friendly messages.

## Migration Guide

To migrate existing code to use neverthrow:

1. Identify functions that throw errors
2. Change return type to `Result<T, E>` or `ResultAsync<T, E>`
3. Replace `throw` statements with `Result.err(new Error(...))`
4. Update callers to handle Results with `.match()`
5. Convert Results to appropriate HTTP responses in controllers
6. Update UI to handle error states explicitly

## Benefits

- **Type safety**: TypeScript ensures all error cases are handled
- **Explicit error handling**: No more try/catch blocks for expected errors
- **Better error information**: Structured error data with types and details
- **Composable**: Results can be mapped and chained safely
- **No exceptions**: Predictable control flow without unexpected throws

---

## Import Guide

### Canonical sources

| Context | Import from |
|---|---|
| Backend | `packages/backend-api/src/lib/errors.ts` |
| Frontend | `packages/web/src/lib/errors.ts` |

**Deprecated** (backward compat only): `packages/backend-api/lib/errors.ts` — avoid new imports here.

### Backend
```typescript
import { AppError, ValidationError, NotFoundError } from '../src/lib/errors';
```

### Frontend
```typescript
import { ApiError, AppError } from '@/lib/errors';
```

### Available error types (backend)
`AppError`, `ValidationError` (400), `NotFoundError` (404), `UnauthorizedError` (401), `UnauthenticatedError` (401), `DatabaseError` (500), `InvalidDataError` (400), `UnexpectedError` (500)

### Migration checklist
- [x] Re-export file for backward compatibility
- [x] Document canonical source location
- [ ] Update all imports to use canonical source
- [ ] Remove legacy re-export file
- [ ] Consider shared error package for monorepo
