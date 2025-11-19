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
import { detectHotlineType } from "../utils/hotline-detection";

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
        console.log("Menu handler - checking input:", input);
        const hotlineType = detectHotlineType(input);
        console.log("Menu handler - detected hotline type:", hotlineType);

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
            console.log("Menu handler - routing to intel handler");
            const intelResponse = await handleIntelHotline(
              hotlineRequest,
              updatedMemory
            );
            console.log(
              "Menu handler - intel handler response:",
              JSON.stringify(intelResponse, null, 2)
            );
            return intelResponse;
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
