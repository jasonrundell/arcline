/**
 * Application Error Codes Reference
 *
 * Standardized error codes used throughout the application for consistent error
 * handling and identification. Each code represents a specific error category
 * and can be used for logging, monitoring, and user-facing error messages.
 *
 * @enum {string}
 * @readonly
 *
 * @property {string} DATABASE_ERROR - Database operation failures (queries, connections, etc.)
 *   - Used when: Supabase queries fail, database connections are lost, or data operations error
 *   - Example: "Failed to fetch messages: connection timeout"
 *   - Status Code: Typically 503 (Service Unavailable) or 500 (Internal Server Error)
 *
 * @property {string} MISSING_DATA - Required data is missing or null
 *   - Used when: Expected data from API/database is null or undefined
 *   - Example: "No messages data returned from query"
 *   - Status Code: Typically 404 (Not Found) or 500 (Internal Server Error)
 *
 * @property {string} UNKNOWN_ERROR - Unhandled or unexpected errors
 *   - Used when: An error occurs that doesn't fit other categories, or when wrapping unknown errors
 *   - Example: "An unknown error occurred" (from handleError function)
 *   - Status Code: Typically 500 (Internal Server Error)
 *
 * @property {string} NETWORK_ERROR - Network-related failures
 *   - Used when: API requests fail, network timeouts, or connection issues
 *   - Example: "Failed to connect to server"
 *   - Status Code: Typically 503 (Service Unavailable) or 504 (Gateway Timeout)
 *
 * @property {string} VALIDATION_ERROR - Input validation failures
 *   - Used when: User input is invalid, required fields are missing, or data format is incorrect
 *   - Example: "Root element not found. Make sure index.html has a #root element."
 *   - Status Code: Typically 400 (Bad Request) or 422 (Unprocessable Entity)
 *
 * @example
 * ```ts
 * // Using error codes in error handling
 * try {
 *   const data = await fetchData();
 *   if (!data) {
 *     throw new AppError(
 *       "No data returned from server",
 *       ERROR_CODES.MISSING_DATA,
 *       404
 *     );
 *   }
 * } catch (error) {
 *   if (error instanceof AppError) {
 *     console.error(`Error [${error.code}]: ${error.message}`);
 *   }
 * }
 * ```
 *
 * @see {@link AppError} - Custom error class that uses these codes
 * @see {@link handleError} - Function that normalizes errors to AppError with these codes
 */
export const ERROR_CODES = {
  /** Database operation failures (queries, connections, etc.) */
  DATABASE_ERROR: "DATABASE_ERROR",
  /** Required data is missing or null */
  MISSING_DATA: "MISSING_DATA",
  /** Unhandled or unexpected errors */
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  /** Network-related failures */
  NETWORK_ERROR: "NETWORK_ERROR",
  /** Input validation failures */
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

/**
 * Type for error codes - ensures type safety when using ERROR_CODES
 *
 * @typedef {typeof ERROR_CODES[keyof typeof ERROR_CODES]} ErrorCode
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Custom application error class with error codes and status codes.
 *
 * Extends the native Error class to provide structured error handling with
 * error codes and HTTP status codes. Maintains proper stack traces for debugging.
 *
 * @class
 * @extends {Error}
 *
 * @property {ErrorCode} code - Application-specific error code (from ERROR_CODES)
 * @property {number} statusCode - HTTP status code (default: 500)
 *
 * @example
 * ```ts
 * // Basic usage
 * throw new AppError(
 *   "Database connection failed",
 *   ERROR_CODES.DATABASE_ERROR,
 *   503
 * );
 *
 * // With validation error
 * throw new AppError(
 *   "Invalid input provided",
 *   ERROR_CODES.VALIDATION_ERROR,
 *   400
 * );
 * ```
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
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
