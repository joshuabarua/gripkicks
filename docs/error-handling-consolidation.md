# Error Handling Consolidation Guide

## Current State

The project has error type definitions in two locations:

### Backend API
- **Primary Location**: `packages/backend-api/src/lib/errors.ts` (canonical source)
- **Legacy Location**: `packages/backend-api/lib/errors.ts` (re-export for backward compatibility)

### Frontend
- **Location**: `packages/web/src/lib/errors.ts`

## Import Guidelines

### Backend Code
**Recommended**: Always import from the canonical source:
```typescript
import { AppError, ValidationError, NotFoundError } from '../src/lib/errors';
```

**Deprecated**: Avoid importing from the legacy location:
```typescript
// DON'T USE - deprecated
import { AppError } from '../lib/errors';
```

### Frontend Code
```typescript
import { ApiError, AppError } from '@/lib/errors';
```

## Error Types Available

### Backend (`src/lib/errors.ts`)
- `AppError` - Base error class
- `ValidationError` - 400 status
- `NotFoundError` - 404 status
- `UnauthorizedError` - 401 status (authorization)
- `UnauthenticatedError` - 401 status (authentication)
- `DatabaseError` - 500 status
- `InvalidDataError` - 400 status
- `UnexpectedError` - 500 status
- `RandomError` - 418 status (for testing)

### Frontend (`src/lib/errors.ts`)
- `ApiError` - For API call errors with type discrimination
- All backend error types (duplicated for frontend use)

## Future Consolidation Plan

1. **Phase 1** (Current): Use re-export for backward compatibility
2. **Phase 2**: Update all imports to use canonical source
3. **Phase 3**: Remove `lib/errors.ts` re-export file
4. **Phase 4**: Consider moving shared error types to a shared package

## Migration Checklist

- [x] Create re-export file for backward compatibility
- [x] Document canonical source location
- [x] Add deprecation notice to legacy file
- [ ] Update all imports to use canonical source
- [ ] Remove legacy re-export file
- [ ] Consider creating shared error package for monorepo
