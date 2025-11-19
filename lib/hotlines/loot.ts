import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { lookupLootLocation } from "../ai/lootlookup";
import { isRepeatRequest } from "../utils/repeat";
import {
  createExitResponse,
  isEndCallRequest,
  createEndCallResponse,
  isMenuNavigationRequest,
} from "../utils/exit";
import { handleExtractionHotline } from "./extraction";
import { handleChickenHotline } from "./chicken";
import { handleIntelHotline } from "./intel";
import { detectHotlineType } from "../utils/hotline-detection";

export async function handleLootHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const input = request.CurrentInput.toLowerCase().trim();
  const step = (memory.step as string) || "greeting";

  const updatedMemory: Record<string, unknown> = {
    ...memory,
    hotlineType: "loot",
  };

  // Check for end call request
  if (isEndCallRequest(request.CurrentInput)) {
    return createEndCallResponse(updatedMemory);
  }

  // Check for repeat request
  if (isRepeatRequest(request.CurrentInput) && memory.lastResponse) {
    return {
      actions: [
        {
          say: memory.lastResponse as string,
          listen: false,
          remember: updatedMemory,
        },
      ],
    };
  }

  switch (step) {
    case "greeting":
      updatedMemory.step = "search";
      const greetingResponse = "What are you looking for?";
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

    case "search":
      const searchTerm = request.CurrentInput;

      // First, acknowledge the request with "One sec" and store search term
      updatedMemory.step = "looking_up";
      updatedMemory.searchTerm = searchTerm;
      return {
        actions: [
          {
            say: "One sec.",
            listen: false,
            remember: updatedMemory,
          },
        ],
      };

    case "looking_up":
      // Look up the loot location using Perplexity
      const itemToSearch =
        (updatedMemory.searchTerm as string) || request.CurrentInput;

      try {
        const lootInfo = await lookupLootLocation(itemToSearch);

        updatedMemory.step = "complete";
        // Store just the loot info for repeat functionality
        updatedMemory.lastResponse = lootInfo;
        // After providing loot info, listen for user response to continue or return to menu
        const lootResponseWithPrompt = `${lootInfo} Anything else you need help with?`;
        return {
          actions: [
            {
              say: lootResponseWithPrompt,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      } catch (error) {
        console.error("Error looking up loot:", error);
        updatedMemory.step = "complete";
        const errorResponse =
          "Intel network's down. Can't access loot database right now. Try again after you've made it back to Speranza.";
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
    case "complete":
      // After completing a lookup, allow user to search again or return to main menu
      // Check if user wants to switch to another hotline
      const targetHotline = detectHotlineType(input);
      if (targetHotline && targetHotline !== "loot") {
        // Route to the detected hotline
        updatedMemory.hotlineType = targetHotline;
        delete updatedMemory.step;
        const hotlineRequest: ConversationRelayRequest = {
          ...request,
          CurrentInput: "",
          Memory: JSON.stringify(updatedMemory),
        };

        switch (targetHotline) {
          case "extraction":
            return await handleExtractionHotline(hotlineRequest, updatedMemory);
          case "chicken":
            return await handleChickenHotline(hotlineRequest, updatedMemory);
          case "intel":
            return await handleIntelHotline(hotlineRequest, updatedMemory);
        }
      } else if (isMenuNavigationRequest(input)) {
        // Return to main menu
        return createExitResponse(updatedMemory);
      } else if (
        input.includes("search") ||
        input.includes("look") ||
        input.includes("find") ||
        input.includes("another") ||
        input.includes("more")
      ) {
        // Search for another item
        updatedMemory.step = "search";
        const searchAgainResponse = "What are you looking for?";
        updatedMemory.lastResponse = searchAgainResponse;
        return {
          actions: [
            {
              say: searchAgainResponse,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      } else {
        // Default: offer to help with something else
        updatedMemory.step = "complete";
        const helpResponse =
          "Anything else you need help with? I can search for more loot, or you can ask about extraction, Scrappy, or Speranza intel.";
        updatedMemory.lastResponse = helpResponse;
        return {
          actions: [
            {
              say: helpResponse,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      }

    default:
      // Return to main menu with natural Shani response
      return createExitResponse(updatedMemory);
  }
}
