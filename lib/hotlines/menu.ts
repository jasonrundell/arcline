/**
 * Main Menu Hotline Handler
 *
 * Architecture: Entry Point and Hotline Router
 *
 * This module serves as the entry point for all conversations and implements
 * hotline detection and routing. It acts as a state machine that transitions
 * users between the main menu and specific hotline handlers.
 *
 * State Machine Flow:
 * 1. greeting: Initial greeting, presents menu options
 * 2. listening: Waits for user to select a hotline
 * 3. routing: Detects hotline type from voice input and routes to handler
 * 4. menu: Returns to menu after hotline completion
 *
 * Hotline Detection:
 * - Uses `detectHotlineType()` to parse voice input
 * - Supports natural language (e.g., "I need an extract", "extraction request")
 * - Sets memory.hotlineType to route to specific handler
 * - Falls back to menu if detection fails
 *
 * Special Commands:
 * - "repeat": Replays the last message
 * - End call phrases: Terminates the conversation
 *
 * @module lib/hotlines/menu
 */

import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { handleExtractionHotline } from "./extraction";
import { handleLootHotline } from "./loot";
import { handleChickenHotline } from "./chicken";
import { handleSubmitIntelHotline } from "./submit-intel";
import { handleListenIntelHotline } from "./listen-intel";
import { isRepeatRequest } from "../utils/repeat";
import { isEndCallRequest, createEndCallResponse } from "../utils/exit";
import { detectHotlineType } from "../utils/hotline-detection";

/**
 * Main menu handler - entry point for all conversations.
 *
 * Handles the main menu state machine and routes users to specific hotlines
 * based on voice input. Manages conversation flow and state transitions.
 *
 * @param {ConversationRelayRequest} request - The conversation relay request
 * @param {Record<string, unknown>} memory - Current conversation state
 * @returns {Promise<ConversationRelayResponse>} Response with menu or routing actions
 */
export async function handleMainMenu(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  try {
    const input = (request.CurrentInput || "").toLowerCase().trim();
    const step = (memory.step as string) || "greeting";
    console.log(
      "handleMainMenu called - input:",
      input,
      "step:",
      step,
      "step type:",
      typeof step,
      "step === 'menu':",
      step === "menu",
      "step === 'greeting':",
      step === "greeting",
      "hotlineType:",
      memory.hotlineType,
      "full memory:",
      JSON.stringify(memory)
    );
    const updatedMemory: Record<string, unknown> = {
      ...memory,
      // Don't set hotlineType here - it will be set when a hotline is selected
    };

    // Check for end call request
    if (isEndCallRequest(request.CurrentInput)) {
      return createEndCallResponse(updatedMemory);
    }

    // Check for repeat request
    if (isRepeatRequest(request.CurrentInput) && memory.lastResponse) {
      console.log(
        "Menu handler - repeat request detected, returning last response"
      );
      return {
        actions: [
          {
            say: memory.lastResponse as string,
            listen: true,
            remember: updatedMemory,
          },
        ],
      };
    }

    console.log(
      "Menu handler - about to enter switch, step:",
      step,
      "type:",
      typeof step
    );
    switch (step) {
      case "greeting":
        // First time caller - present menu
        updatedMemory.step = "menu";
        const greetingResponse =
          "Speranza Security: Shani here. What do you need, raider? I can help you with getting an extraction.. locating resources.. speaking with Scrappy.. submitting intel.. or listening to intel. Go ahead.";
        updatedMemory.lastResponse = greetingResponse;
        return {
          actions: [
            {
              say: greetingResponse,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };

      case "menu":
        // User has selected an option - check for voice commands
        console.log("Menu handler - checking input:", input);
        const hotlineType = detectHotlineType(input);
        console.log("Menu handler - detected hotline type:", hotlineType);

        if (!hotlineType) {
          // Invalid selection, repeat menu
          const errorResponse =
            "Didn't catch that, Raider. Speak clearly. Say 'extraction' for an extraction point, 'loot' for resource locations, 'scrappy' for material updates, 'submit intel' to share intel, or 'listen to intel' for the latest news.";
          updatedMemory.lastResponse = errorResponse;
          return {
            actions: [
              {
                say: errorResponse,
                listen: true,
                remember: updatedMemory,
              },
            ],
          };
        }

        // Set hotline type and clear step so handler starts fresh
        updatedMemory.hotlineType = hotlineType;
        delete updatedMemory.step;

        // Immediately route to the selected hotline handler with empty input to trigger greeting
        const hotlineRequest: ConversationRelayRequest = {
          ...request,
          CurrentInput: "", // Empty input triggers greeting in handler
          Memory: JSON.stringify(updatedMemory),
        };

        switch (hotlineType) {
          case "extraction":
            return await handleExtractionHotline(hotlineRequest, updatedMemory);
          case "loot":
            return await handleLootHotline(hotlineRequest, updatedMemory);
          case "chicken":
            return await handleChickenHotline(hotlineRequest, updatedMemory);
          case "submit-intel":
            console.log("Menu handler - routing to submit intel handler");
            return await handleSubmitIntelHotline(
              hotlineRequest,
              updatedMemory
            );
          case "listen-intel":
            console.log("Menu handler - routing to listen intel handler");
            return await handleListenIntelHotline(
              hotlineRequest,
              updatedMemory
            );
          default:
            // Fallback - shouldn't happen
            updatedMemory.step = "greeting";
            return {
              actions: [
                {
                  say: "Speranza Security hotline. Shani here. What do you need, Raider?",
                  listen: true,
                  remember: updatedMemory,
                },
              ],
            };
        }

      default:
        updatedMemory.step = "greeting";
        return {
          actions: [
            {
              say: "Speranza Security hotline. Shani here. What do you need, Raider?",
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
    }
  } catch (error) {
    console.error("Error in handleMainMenu:", error);
    throw error;
  }
}
