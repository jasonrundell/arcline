import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { handleExtractionHotline } from "./extraction";
import { handleLootHotline } from "./loot";
import { handleChickenHotline } from "./chicken";
import { handleIntelHotline } from "./intel";

export async function handleMainMenu(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const input = request.CurrentInput.toLowerCase().trim();
  const step = (memory.step as string) || "greeting";
  const updatedMemory: Record<string, unknown> = { ...memory };

  switch (step) {
    case "greeting":
      // First time caller - present menu
      updatedMemory.step = "menu";
      return {
        actions: [
          {
            say: "Speranze Security: Shani here. What do you need, raider? I can help you with getting an extraction, locating resources, speaking with Scrappy, or getting Speranza intel. Go ahead.",
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
        input.includes("resource") ||
        input.includes("material")
      ) {
        hotlineType = "loot";
      } else if (input.includes("scrappy") || input.includes("chicken")) {
        hotlineType = "chicken";
      } else if (
        input.includes("news") ||
        input.includes("faction") ||
        input.includes("intel") ||
        input.includes("gossip")
      ) {
        hotlineType = "intel";
      }

      if (!hotlineType) {
        // Invalid selection, repeat menu
        return {
          actions: [
            {
              say: "Didn't catch that, Raider. Speak clearly. Say 'extraction' for an extraction point, 'loot' for resource locations, 'scrappy' for material updates, or 'news' for Speranza intel.",
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
