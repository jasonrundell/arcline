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
} from "../utils/exit";

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
      // Check if user wants to search for something else or go back to menu
      if (
        input.includes("menu") ||
        input.includes("back") ||
        input.includes("main") ||
        input.includes("other") ||
        input.includes("different") ||
        input.includes("extraction") ||
        input.includes("scrappy") ||
        input.includes("intel") ||
        input.includes("news")
      ) {
        // Return to main menu
        delete updatedMemory.hotlineType;
        updatedMemory.step = "menu";
        const menuResponse =
          "Copy that. What else do you need? I can help with extraction, resources, Scrappy, or Speranza intel.";
        updatedMemory.lastResponse = menuResponse;
        return {
          actions: [
            {
              say: menuResponse,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
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
