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
import { handleIntelHotline } from "../hotlines/intel";

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
      case "intel":
        return await handleIntelHotline(request, memory);
      default:
        // Fallback to menu if unknown hotline type
        return await handleMainMenu(request, memory);
    }
  }

  // If no hotline selected yet, or explicitly at menu, route to menu handler
  // The menu handler will detect hotline types from voice input and route internally
  if (!hotlineType || hotlineType === "menu" || step === "greeting") {
    console.log("Router - routing to menu handler, input:", request.CurrentInput, "step:", step);
    return await handleMainMenu(request, memory);
  }

  // This should never be reached due to the check above, but keeping as fallback
  return await handleMainMenu(request, memory);
}

/**
 * Handles DTMF input for menu selection
 * Returns a response if DTMF was processed, or null if it should be handled normally
 */
export function handleDTMFSelection(
  input: string,
  step: string | undefined,
  memory: Record<string, unknown>
): ConversationRelayResponse | null {
  const dtmfMatch = input.match(/[1-4]/);
  
  // Only process DTMF if we're at the menu step
  if (!dtmfMatch || step !== "menu") {
    return null;
  }

  const selection = dtmfMatch[0];
  const hotlineMap: Record<string, string> = {
    "1": "extraction",
    "2": "loot",
    "3": "chicken",
    "4": "intel",
  };

  const hotlineType = hotlineMap[selection];
  if (!hotlineType) {
    return null;
  }

  // Update memory with selected hotline
  memory.hotlineType = hotlineType;
  delete memory.step; // Clear step so handler starts fresh

  const confirmations: Record<string, string> = {
    "1": "You selected Extraction Request. Please provide your location for extraction.",
    "2": "You selected Loot Locator. What are you looking for?",
    "3": "You selected Scrappy's Chicken Line. Welcome!",
    "4": "You selected Faction News. Say 'latest' for intel or 'submit' to share intel.",
  };

  return {
    actions: [
      {
        say: confirmations[selection],
        listen: true,
        remember: memory,
      },
    ],
  };
}

