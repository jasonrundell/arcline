/**
 * Application error codes for consistent error handling.
 *
 * These codes are used throughout the application to identify and categorize
 * different types of errors. Each code corresponds to a specific error category.
 *
 * @enum {string}
 * @readonly
 */
export const ERROR_CODES = {
  DATABASE_ERROR: "DATABASE_ERROR",
  MISSING_DATA: "MISSING_DATA",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

/**
 * Custom application error class with error codes and status codes.
 *
 * Extends the native Error class to provide structured error handling with
 * error codes and HTTP status codes. Maintains proper stack traces for debugging.
 *
 * @class
 * @extends {Error}
 *
 * @property {string} code - Application-specific error code (from ERROR_CODES)
 * @property {number} statusCode - HTTP status code (default: 500)
 *
 * @example
 * ```ts
 * throw new AppError("Database connection failed", ERROR_CODES.DATABASE_ERROR, 503);
 * ```
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Normalizes unknown errors into AppError instances for consistent error handling.
 *
 * Takes any error type (Error, AppError, or unknown) and converts it to an
 * AppError instance. If the error is already an AppError, it returns it unchanged.
 * If it's a standard Error, it wraps it with UNKNOWN_ERROR code. Otherwise,
 * it creates a new AppError with a generic message.
 *
 * @param {unknown} error - The error to handle (can be any type)
 * @returns {AppError} An AppError instance
 *
 * @example
 * ```ts
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const appError = handleError(error);
 *   console.error(appError.code, appError.message);
 * }
 * ```
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof Error) {
    return new AppError(error.message, ERROR_CODES.UNKNOWN_ERROR);
  }
  return new AppError("An unknown error occurred", ERROR_CODES.UNKNOWN_ERROR);
}
