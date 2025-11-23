/**
 * Log entry from the logs table
 */
export interface Log {
  id: string;
  session_id: string;
  message: string;
  level: "log" | "error" | "warn" | "debug" | "info";
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Scrappy Message from the scrappy_messages table
 */
export interface ScrappyMessage {
  id: string;
  content: string;
  faction?: string;
  verified: boolean;
  created_at: string;
}

/**
 * Intel report from the intel table
 */
export interface Intel {
  id: string;
  content: string;
  faction?: string;
  verified: boolean;
  created_at: string;
}

