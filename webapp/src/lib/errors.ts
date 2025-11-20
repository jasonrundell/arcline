/**
 * Application error codes
 */
export const ERROR_CODES = {
  DATABASE_ERROR: "DATABASE_ERROR",
  MISSING_DATA: "MISSING_DATA",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

/**
 * Custom application error class with error codes and status codes
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
 * Handles unknown errors and converts them to AppError instances
 * @param error - The error to handle (can be any type)
 * @returns An AppError instance
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
