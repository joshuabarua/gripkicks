/**
 * Error Types Re-export
 * 
 * This file re-exports all error types from src/lib/errors.ts for backward compatibility.
 * 
 * IMPORTANT: The canonical error definitions are in src/lib/errors.ts
 * All new imports should use '../src/lib/errors' instead of '../lib/errors'
 * This file exists only to support legacy imports and will be deprecated in the future.
 * 
 * @deprecated Use '../src/lib/errors' instead
 */
export * from '../src/lib/errors';
