interface BaseError {
  code: string;
  message: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

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

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super('DATABASE_ERROR', message, 500);
  }
}

export class InvalidDataError extends AppError {
  constructor(message: string = 'Invalid data provided') {
    super('INVALID_DATA', message, 400);
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHENTICATED', message, 401);
  }
}

export class UnexpectedError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    super('UNEXPECTED_ERROR', message, 500);
  }
}

type ErrorType =
  | 'VALIDATION_ERROR'
  | 'INVALID_DATA'
  | 'UNAUTHENTICATED'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNEXPECTED_ERROR';
