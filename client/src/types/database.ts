/**
 * Scrappy Message entity from the database.
 *
 * Represents a message left for Scrappy in the `scrappy_messages` table.
 * Messages are user-submitted content that can be displayed on the website
 * after verification.
 *
 * @interface ScrappyMessage
 * @property {string} id - Unique identifier for the message (UUID)
 * @property {string} content - The message content text (user-submitted)
 * @property {string} [faction] - Optional faction identifier associated with the message
 * @property {string} created_at - ISO 8601 timestamp of when the message was created
 * @property {boolean} verified - Whether the message has been verified for display
 */
export interface ScrappyMessage {
  id: string;
  content: string;
  faction?: string;
  created_at: string;
  verified: boolean;
}

/**
 * Intel Report entity from the database.
 *
 * Represents an intelligence report submitted through the hotline system.
 * Intel reports contain information from the field and can be associated
 * with specific factions and priority levels.
 *
 * @interface Intel
 * @property {string} id - Unique identifier for the intel report (UUID)
 * @property {string} content - The intel report content text (user-submitted)
 * @property {string} [faction] - Optional faction identifier (e.g., "Raider Report")
 * @property {string} [priority] - Optional priority level (e.g., "High", "Medium", "Low")
 * @property {string} created_at - ISO 8601 timestamp of when the report was created
 * @property {boolean} verified - Whether the report has been verified for display
 */
export interface Intel {
  id: string;
  content: string;
  faction?: string;
  priority?: string;
  created_at: string;
  verified: boolean;
}
