export const TIMEOUTS = {
  CALL_END_DELAY: 2000,
  LOOT_LOOKUP_DELAY: 1000,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  SESSION_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

export const WEBSOCKET = {
  MAX_CONNECTIONS: 100,
} as const;
