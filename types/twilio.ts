export interface ConversationRelayRequest {
  ConversationSid: string;
  CurrentInput: string;
  CurrentInputType: string;
  Memory: string;
  CurrentTask?: string;
  CurrentTaskConfidence?: string;
}

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

export type HotlineType =
  | "extraction"
  | "loot"
  | "chicken"
  | "intel";

