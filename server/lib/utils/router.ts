/**
 * Centralized Routing System
 *
 * This module provides a single entry point for routing conversation requests
 * to the appropriate hotline handler. It implements a state machine pattern
 * where the current hotline type and step are stored in conversation memory.
 *
 * Architecture:
 * - State Machine Pattern: Conversation state is maintained in memory (hotlineType, step)
 * - Centralized Routing: All routing decisions go through this module
 * - Handler Delegation: Each hotline handler manages its own internal state machine
 *
 * Flow:
 * 1. Request arrives with memory containing hotlineType and step
 * 2. If hotlineType is set (and not "menu"), route to that hotline's handler
 * 3. If no hotlineType or explicitly at menu, route to main menu handler
 * 4. Handler processes input and returns response with updated memory
 * 5. Memory is persisted and sent back to Twilio for next request
 *
 * Memory Structure:
 * - hotlineType: Current active hotline ("extraction", "loot", "chicken", "submit-intel", "listen-intel", or "menu")
 * - step: Current step within the hotline (e.g., "greeting", "collecting-location", "confirming")
 * - Additional hotline-specific state (e.g., location, item name, etc.)
 *
 * @module lib/utils/router
 */

import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { handleMainMenu } from "../hotlines/menu";
import { handleExtractionHotline } from "../hotlines/extraction";
import { handleLootHotline } from "../hotlines/loot";
import { handleChickenHotline } from "../hotlines/chicken";
import { handleSubmitIntelHotline } from "../hotlines/submit-intel";
import { handleListenIntelHotline } from "../hotlines/listen-intel";

/**
 * Routes a conversation request to the appropriate hotline handler.
 *
 * Implements the routing logic for the conversation state machine. Determines
 * which hotline handler to invoke based on the current conversation state stored
 * in memory.
 *
 * Routing Logic:
 * 1. If hotlineType is set and not "menu" → Route to specific hotline handler
 * 2. If no hotlineType, hotlineType is "menu", or step is "greeting" → Route to main menu
 * 3. Unknown hotlineType → Fallback to main menu
 *
 * Each hotline handler manages its own internal state machine and can transition
 * between steps, update memory, and return responses with actions (say, listen, remember).
 *
 * @param {ConversationRelayRequest} request - The conversation relay request from Twilio
 * @param {Record<string, unknown>} memory - The current conversation state/memory
 * @returns {Promise<ConversationRelayResponse>} Response with actions for Twilio
 *
 * @example
 * ```ts
 * // Route to extraction hotline (memory.hotlineType = "extraction")
 * const response = await routeToHotline(request, { hotlineType: "extraction", step: "collecting-location" });
 *
 * // Route to main menu (no hotlineType or hotlineType = "menu")
 * const response = await routeToHotline(request, { step: "greeting" });
 * ```
 */
export async function routeToHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const hotlineType = memory.hotlineType as string | undefined;
  const step = memory.step as string | undefined;

  // If a hotline is already selected (and it's not "menu"), route to that handler
  // This allows hotlines to have their own "menu" step without being routed back to main menu
  if (hotlineType && hotlineType !== "menu") {
    // Route to specific hotline handler - it will handle its own menu/step logic
    switch (hotlineType) {
      case "extraction":
        return await handleExtractionHotline(request, memory);
      case "loot":
        return await handleLootHotline(request, memory);
      case "chicken":
        return await handleChickenHotline(request, memory);
      case "submit-intel":
        return await handleSubmitIntelHotline(request, memory);
      case "listen-intel":
        return await handleListenIntelHotline(request, memory);
      default:
        // Fallback to menu if unknown hotline type
        return await handleMainMenu(request, memory);
    }
  }

  // If no hotline selected yet, or explicitly at menu, route to menu handler
  // The menu handler will detect hotline types from voice input and route internally
  if (!hotlineType || hotlineType === "menu" || step === "greeting") {
    console.log(
      "Router - routing to menu handler, input:",
      request.CurrentInput,
      "step:",
      step
    );
    return await handleMainMenu(request, memory);
  }

  // This should never be reached due to the check above, but keeping as fallback
  return await handleMainMenu(request, memory);
}
