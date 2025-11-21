/**
 * Request payload from Twilio ConversationRelay webhook.
 *
 * This interface represents the data structure sent by Twilio when a conversation
 * event occurs. The webhook receives this data as form-urlencoded parameters.
 *
 * @interface ConversationRelayRequest
 * @property {string} ConversationSid - Unique identifier for the conversation session
 * @property {string} CurrentInput - The user's current voice or text input from the call
 * @property {string} CurrentInputType - Type of input: "voice", "text", or "setup"
 * @property {string} Memory - JSON string containing conversation state/memory (must be parsed)
 * @property {string} [CurrentTask] - Optional current task identifier from Twilio's NLU
 * @property {string} [CurrentTaskConfidence] - Optional confidence score for the current task
 */
export interface ConversationRelayRequest {
  ConversationSid: string;
  CurrentInput: string;
  CurrentInputType: string;
  Memory: string;
  CurrentTask?: string;
  CurrentTaskConfidence?: string;
}

/**
 * Response payload for Twilio ConversationRelay webhook.
 *
 * This interface represents the response structure that must be returned to Twilio
 * to control the conversation flow. Actions are executed in order.
 *
 * @interface ConversationRelayResponse
 * @property {Array<ConversationAction>} actions - Array of actions to execute in sequence
 *
 * @interface ConversationAction
 * @property {string} [say] - Text to speak to the user (TTS)
 * @property {boolean} [listen] - Whether to continue listening for user input (false ends the call)
 * @property {Record<string, unknown>} [remember] - Key-value pairs to store in conversation memory
 * @property {HandoffConfig} [handoff] - Optional configuration to hand off to another channel
 *
 * @interface HandoffConfig
 * @property {string} channel - Channel identifier for handoff
 * @property {string} uri - URI for the handoff destination
 */
export interface ConversationRelayResponse {
  actions: Array<{
    say?: string;
    listen?: boolean;
    remember?: Record<string, unknown>;
    handoff?: {
      channel: string;
      uri: string;
    };
  }>;
}

/**
 * Available hotline service types.
 *
 * Represents the different hotline services available in the ARC Line system.
 * Used for routing conversations to the appropriate handler.
 *
 * @typedef {("extraction" | "loot" | "chicken" | "intel")} HotlineType
 * @readonly
 *
 * @property {"extraction"} extraction - Extraction Request Hotline: Request extractions by location
 * @property {"loot"} loot - Loot Locator Hotline: Search for valuable items in the ARC universe
 * @property {"chicken"} chicken - Scrappy's Chicken Line: Fun sound clips and randomizers
 * @property {"intel"} intel - Intel Hub: View latest rumors or submit gossip
 */
export type HotlineType = "extraction" | "loot" | "chicken" | "intel";
