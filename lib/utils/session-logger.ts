/**
 * Session Logger
 * 
 * Captures console.log, console.error, console.warn, and console.debug messages
 * for each session and stores them in memory. Logs are saved to the database
 * when the session ends.
 */

type LogLevel = "log" | "error" | "warn" | "debug" | "info";

export interface LogEntry {
  message: string;
  level: LogLevel;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// Store logs per session (session_id -> array of log entries)
const sessionLogs = new Map<string, LogEntry[]>();

// Store original console methods
const originalConsole = {
  log: console.log.bind(console),
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  debug: console.debug.bind(console),
  info: console.info.bind(console),
};

// Global session ID for the current async context
// Using AsyncLocalStorage would be better, but for simplicity we'll use a Map
// that associates each async operation with a session ID
const asyncContextSessionId = new Map<number, string>();

/**
 * Formats a log message and metadata into a string
 */
function formatLogMessage(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === "string") {
        return arg;
      }
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");
}

/**
 * Extracts metadata from log arguments (objects are treated as metadata)
 */
function extractMetadata(args: unknown[]): Record<string, unknown> | undefined {
  const objects = args.filter(
    (arg) => typeof arg === "object" && arg !== null && !Array.isArray(arg)
  ) as Record<string, unknown>[];

  if (objects.length === 0) {
    return undefined;
  }

  // Merge all objects into a single metadata object
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
}

/**
 * Gets the current session ID from the async context
 * This is a simplified approach - in production you might want to use AsyncLocalStorage
 */
function getCurrentSessionId(): string | null {
  // Try to get from the most recent async context
  // This is a simplified approach - we'll pass sessionId explicitly in practice
  return null;
}

/**
 * Creates a wrapped console method that captures logs for a session
 */
function createWrappedConsoleMethod(
  level: LogLevel,
  originalMethod: typeof console.log
): typeof console.log {
  return function (this: typeof console, ...args: unknown[]) {
    // Call original console method first
    originalMethod.apply(console, args);

    // Try to get current session ID
    const sessionId = getCurrentSessionId();
    if (sessionId) {
      const message = formatLogMessage(args);
      const metadata = extractMetadata(args);

      addLogToSession(sessionId, {
        message,
        level,
        metadata,
        timestamp: new Date(),
      });
    }
  };
}

/**
 * Adds a log entry to a specific session
 */
export function addLogToSession(sessionId: string, entry: LogEntry): void {
  if (!sessionLogs.has(sessionId)) {
    sessionLogs.set(sessionId, []);
  }
  sessionLogs.get(sessionId)!.push(entry);
}

/**
 * Gets all logs for a session
 */
export function getSessionLogs(sessionId: string): LogEntry[] {
  return sessionLogs.get(sessionId) || [];
}

/**
 * Clears logs for a session (after saving)
 */
export function clearSessionLogs(sessionId: string): void {
  sessionLogs.delete(sessionId);
}

/**
 * Manually log a message for a session
 * This is the primary way to log messages for a specific session
 */
export function logForSession(
  sessionId: string,
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>
): void {
  // Also call the original console method
  const consoleMethod = originalConsole[level] || originalConsole.log;
  if (metadata) {
    consoleMethod(message, metadata);
  } else {
    consoleMethod(message);
  }

  addLogToSession(sessionId, {
    message,
    level,
    metadata,
    timestamp: new Date(),
  });
}

/**
 * Wraps console methods to capture logs when a session is active
 * This creates session-aware console methods
 */
export function createSessionAwareLogger(sessionId: string) {
  return {
    log: (...args: unknown[]) => {
      originalConsole.log(...args);
      const message = formatLogMessage(args);
      const metadata = extractMetadata(args);
      addLogToSession(sessionId, {
        message,
        level: "log",
        metadata,
        timestamp: new Date(),
      });
    },
    error: (...args: unknown[]) => {
      originalConsole.error(...args);
      const message = formatLogMessage(args);
      const metadata = extractMetadata(args);
      addLogToSession(sessionId, {
        message,
        level: "error",
        metadata,
        timestamp: new Date(),
      });
    },
    warn: (...args: unknown[]) => {
      originalConsole.warn(...args);
      const message = formatLogMessage(args);
      const metadata = extractMetadata(args);
      addLogToSession(sessionId, {
        message,
        level: "warn",
        metadata,
        timestamp: new Date(),
      });
    },
    debug: (...args: unknown[]) => {
      originalConsole.debug(...args);
      const message = formatLogMessage(args);
      const metadata = extractMetadata(args);
      addLogToSession(sessionId, {
        message,
        level: "debug",
        metadata,
        timestamp: new Date(),
      });
    },
    info: (...args: unknown[]) => {
      originalConsole.info(...args);
      const message = formatLogMessage(args);
      const metadata = extractMetadata(args);
      addLogToSession(sessionId, {
        message,
        level: "info",
        metadata,
        timestamp: new Date(),
      });
    },
  };
}

