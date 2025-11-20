import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { isRepeatRequest } from "../utils/repeat";
import {
  createExitResponse,
  createContinueOrExitResponse,
  isEndCallRequest,
  createEndCallResponse,
  isMenuNavigationRequest,
} from "../utils/exit";
import { handleLootHotline } from "./loot";
import { handleChickenHotline } from "./chicken";
import { handleSubmitIntelHotline } from "./submit-intel";
import { handleListenIntelHotline } from "./listen-intel";
import { detectHotlineType } from "../utils/hotline-detection";

export async function handleExtractionHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const input = request.CurrentInput.toLowerCase().trim();
  const step = (memory.step as string) || "greeting";

  // Initialize hotline type in memory
  const updatedMemory: Record<string, unknown> = {
    ...memory,
    hotlineType: "extraction",
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
      updatedMemory.step = "location";
      const greetingResponse =
        "Where are you topside? Give me your location and I'll help you get back to Speranza.";
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

    case "location":
      const location = request.CurrentInput;
      updatedMemory.location = location;
      updatedMemory.step = "complete";

      const locationResponse = `Copy that - extraction sequence initiated. Elevator departing in 5 seconds. Stay low, stay fast, and make it back to Speranza.`;
      updatedMemory.step = "complete";
      updatedMemory.lastResponse = locationResponse;
      return createContinueOrExitResponse(
        updatedMemory,
        locationResponse,
        "Anything else you need help with while you're topside? I can help you get in touch with  Scrappy, or share intel."
      );

    case "complete":
      // Check for end call request first
      if (isEndCallRequest(input)) {
        return createEndCallResponse(updatedMemory);
      } else if (isMenuNavigationRequest(input)) {
        // Return to main menu
        return createExitResponse(updatedMemory);
      }

      // Check if user wants to switch to another hotline
      const targetHotline = detectHotlineType(input);
      if (targetHotline && targetHotline !== "extraction") {
        // Route to the detected hotline
        updatedMemory.hotlineType = targetHotline;
        delete updatedMemory.step;
        const hotlineRequest: ConversationRelayRequest = {
          ...request,
          CurrentInput: "",
          Memory: JSON.stringify(updatedMemory),
        };

        switch (targetHotline) {
          case "loot":
            return await handleLootHotline(hotlineRequest, updatedMemory);
          case "chicken":
            return await handleChickenHotline(hotlineRequest, updatedMemory);
          case "submit-intel":
            return await handleSubmitIntelHotline(
              hotlineRequest,
              updatedMemory
            );
          case "listen-intel":
            return await handleListenIntelHotline(
              hotlineRequest,
              updatedMemory
            );
        }
      } else if (
        input.includes("extraction") ||
        input.includes("extract") ||
        input.includes("another") ||
        input.includes("more")
      ) {
        // Request another extraction
        updatedMemory.step = "location";
        const greetingResponse =
          "Where are you topside? Give me your location and I'll help you get back to Speranza.";
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
      } else {
        // Default: offer to help with something else
        updatedMemory.step = "complete";
        return createContinueOrExitResponse(
          updatedMemory,
          "Copy that.",
          "help with another extraction"
        );
      }

    default:
      // Return to main menu with natural Shani response
      return createExitResponse(updatedMemory);
  }
}
