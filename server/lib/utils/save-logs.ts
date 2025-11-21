/**
 * Save Logs Utility
 * 
 * Saves session logs to the database when a call ends.
 */

import { supabase } from "../supabase";
import {
  getSessionLogs,
  clearSessionLogs,
  type LogEntry,
} from "./session-logger";

/**
 * Saves all logs for a session to the database
 * @param sessionId - The session ID (callSid)
 * @returns Promise that resolves when logs are saved
 */
export async function saveSessionLogsToDatabase(
  sessionId: string
): Promise<void> {
  const logs = getSessionLogs(sessionId);

  if (logs.length === 0) {
    // No logs to save
    return;
  }

  try {
    // Prepare log entries for database insertion
    const logEntries = logs.map((log: LogEntry) => ({
      session_id: sessionId,
      message: log.message,
      level: log.level,
      metadata: log.metadata || null,
    }));

    // Insert logs in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < logEntries.length; i += batchSize) {
      const batch = logEntries.slice(i, i + batchSize);
      const { error } = await supabase.from("logs").insert(batch);

      if (error) {
        console.error(
          `Error saving logs batch for session ${sessionId}:`,
          error
        );
        // Continue with next batch even if one fails
      }
    }

    // Clear logs from memory after successful save
    clearSessionLogs(sessionId);
  } catch (error) {
    console.error(
      `Error saving logs to database for session ${sessionId}:`,
      error
    );
    // Don't clear logs if save failed - they might be retried later
    throw error;
  }
}

