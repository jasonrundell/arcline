/**
 * Centralized routing logic for hotline handlers
 * This eliminates duplication across server.ts, route.ts, and webhook.ts
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
 * Routes a request to the appropriate hotline handler based on hotlineType and step
 * @param request - The conversation relay request
 * @param memory - The current memory state
 * @returns The response from the appropriate handler
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
