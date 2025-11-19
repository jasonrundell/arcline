import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { handleExtractionHotline } from "./extraction";
import { handleLootHotline } from "./loot";
import { handleChickenHotline } from "./chicken";
import { handleIntelHotline } from "./intel";
import { isRepeatRequest } from "../utils/repeat";
import { isEndCallRequest, createEndCallResponse } from "../utils/exit";

export async function handleMainMenu(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const input = request.CurrentInput.toLowerCase().trim();
  const step = (memory.step as string) || "greeting";
  const updatedMemory: Record<string, unknown> = { ...memory };

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
          listen: true,
          remember: updatedMemory,
        },
      ],
    };
  }

  switch (step) {
    case "greeting":
      // First time caller - present menu
      updatedMemory.step = "menu";
      const greetingResponse =
        "Speranze Security: Shani here. What do you need, raider? I can help you with getting an extraction.. locating resources.. speaking with Scrappy.. or getting Speranza intel. Go ahead.";
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
      let hotlineType: string | undefined;

      if (input.includes("extraction") || input.includes("extract")) {
        hotlineType = "extraction";
      } else if (
        input.includes("loot") ||
        input.includes("loots") ||
        input.includes("loop") ||
        input.includes("loops") ||
        input.includes("lou") ||
        input.includes("lous") ||
        input.includes("item") ||
        input.includes("items") ||
        input.includes("resource") ||
        input.includes("resources") ||
        input.includes("material") ||
        input.includes("materials") ||
        input.includes("What's the latest news?") ||
        input.includes("What's the latest intel?")
      ) {
        hotlineType = "loot";
      } else if (input.includes("scrappy") || input.includes("chicken")) {
        hotlineType = "chicken";
      } else if (
        input.includes("news") ||
        input.includes("rumors") ||
        input.includes("faction") ||
        input.includes("intel") ||
        input.includes("gossip")
      ) {
        hotlineType = "intel";
      }

      if (!hotlineType) {
        // Invalid selection, repeat menu
        const errorResponse =
          "Didn't catch that, Raider. Speak clearly. Say 'extraction' for an extraction point, 'loot' for resource locations, 'scrappy' for material updates, or 'news' for Speranza intel.";
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
        case "intel":
          return await handleIntelHotline(hotlineRequest, updatedMemory);
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
}
