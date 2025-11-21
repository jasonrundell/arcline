/**
 * Sentry Error Monitoring Configuration
 *
 * Initializes Sentry for error tracking and performance monitoring.
 * Sentry will capture unhandled errors, promise rejections, and React errors.
 *
 * Configuration:
 * - DSN: Retrieved from VITE_SENTRY_DSN environment variable
 * - Environment: Set based on build mode (development/production)
 * - TracesSampleRate: 1.0 in development, 0.1 in production (10% of transactions)
 * - BeforeSend: Filters out known non-critical errors
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/react/
 */

import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error monitoring and performance tracking.
 *
 * Should be called before React renders the application (in main.tsx).
 * If VITE_SENTRY_DSN is not set, Sentry will not be initialized (graceful degradation).
 *
 * @example
 * ```ts
 * import { initSentry } from "./lib/sentry";
 * initSentry();
 * // ... rest of app initialization
 * ```
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || "development";
  const isDevelopment = environment === "development";

  // Don't initialize Sentry if DSN is not provided (graceful degradation)
  if (!dsn) {
    if (isDevelopment) {
      console.warn(
        "Sentry DSN not configured. Set VITE_SENTRY_DSN to enable error monitoring."
      );
    }
    return;
  }

  Sentry.init({
    dsn,
    environment,
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: isDevelopment ? 1.0 : 0.1, // 100% in dev, 10% in prod
    // Session Replay
    replaysSessionSampleRate: isDevelopment ? 1.0 : 0.1, // 100% in dev, 10% in prod
    replaysOnErrorSampleRate: 1.0, // 100% for sessions with errors
    // Filter out known non-critical errors
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly configured
      if (
        isDevelopment &&
        import.meta.env.VITE_SENTRY_ENABLE_IN_DEV !== "true"
      ) {
        return null;
      }

      // Filter out network errors for failed requests (unless they're critical)
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't send validation errors (they're expected and handled)
        if (error.name === "AppError" && error.message.includes("Missing")) {
          return null;
        }
        // Don't send network errors from Supabase (they're often expected)
        if (error.message.includes("Failed to fetch")) {
          return null;
        }
      }

      return event;
    },
  });

  // Set user context if available (can be enhanced later with auth user info)
  // Sentry.setUser({ id: user?.id, email: user?.email });
}

/**
 * Capture an exception manually
 *
 * Use this when you want to explicitly report an error to Sentry.
 * For automatic error capture, ensure Sentry is initialized and ErrorBoundary is used.
 * This function is safe to call even if Sentry is not initialized (graceful no-op).
 *
 * @param error - The error to capture
 * @param context - Optional additional context
 *
 * @example
 * ```ts
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureException(error, { extra: { operation: "riskyOperation" } });
 * }
 * ```
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
) {
  // Safe to call even if Sentry is not initialized
  try {
    Sentry.captureException(error, {
      tags: context?.tags,
      extra: context?.extra,
    });
  } catch (err) {
    // Silently fail if Sentry is not initialized
    console.warn("Failed to capture exception to Sentry:", err);
  }
}

/**
 * Capture a message manually
 *
 * Use this to log messages to Sentry (useful for tracking events or warnings).
 * This function is safe to call even if Sentry is not initialized (graceful no-op).
 *
 * @param message - The message to capture
 * @param level - The severity level (default: 'info')
 * @param context - Optional additional context
 *
 * @example
 * ```ts
 * captureMessage("User completed onboarding", "info", {
 *   tags: { feature: "onboarding" },
 * });
 * ```
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
) {
  // Safe to call even if Sentry is not initialized
  try {
    Sentry.captureMessage(message, level, {
      tags: context?.tags,
      extra: context?.extra,
    });
  } catch (err) {
    // Silently fail if Sentry is not initialized
    console.warn("Failed to capture message to Sentry:", err);
  }
}
