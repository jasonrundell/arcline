import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { generateShaniResponse } from "../ai/shaniresponse";
import { isRepeatRequest } from "../utils/repeat";
import {
  createExitResponse,
  isEndCallRequest,
  createEndCallResponse,
  isMenuNavigationRequest,
} from "../utils/exit";
import { handleExtractionHotline } from "./extraction";
import { handleLootHotline } from "./loot";
import { handleIntelHotline } from "./intel";
import { detectHotlineType } from "../utils/hotline-detection";
import { supabase } from "../supabase";

// Scripted responses for standard flows (greeting, exit, fallback)
const SCRIPTED_RESPONSES = {
  greeting:
    "Scrappy isn't back yet from his latest run. I can relay your message to him when he gets back. What's your message?",
  exit: "Copy that. What else do you need, Raider?",
  default: "What do you need, Raider?",
};

export async function handleChickenHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const input = request.CurrentInput.toLowerCase().trim();
  const step = (memory.step as string) || "greeting";
  const updatedMemory: Record<string, unknown> = {
    ...memory,
    hotlineType: "chicken",
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
          listen: true,
          remember: updatedMemory,
        },
      ],
    };
  }

  switch (step) {
    case "greeting":
      // Scripted greeting - always use this for consistency
      updatedMemory.step = "listening";
      updatedMemory.lastResponse = SCRIPTED_RESPONSES.greeting;
      return {
        actions: [
          {
            say: SCRIPTED_RESPONSES.greeting,
            listen: true,
            remember: updatedMemory,
          },
        ],
      };

    case "listening":
      // Only check for end call or menu navigation - don't allow hotline switching while giving message
      if (isEndCallRequest(input)) {
        // User wants to end the call
        return createEndCallResponse(updatedMemory);
      } else if (isMenuNavigationRequest(input)) {
        // User wants to return to menu
        return createExitResponse(updatedMemory);
      }

      // Save message to Scrappy to database
      const messageContent = request.CurrentInput.trim();
      if (!messageContent) {
        // Empty message - ask again
        const emptyResponse =
          "Didn't catch that. What message would you like me to relay to Scrappy?";
        updatedMemory.lastResponse = emptyResponse;
        return {
          actions: [
            {
              say: emptyResponse,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      }

      // Try to save the message
      try {
        const { error: saveError } = await supabase
          .from("scrappy_messages")
          .insert({
            content: messageContent,
            faction: "Scrappy's Hotline",
            verified: false,
          });

        if (saveError) {
          throw saveError;
        }

        // Message saved successfully - confirm and transition to message_saved step
        updatedMemory.step = "message_saved";
        const confirmationResponse =
          "I'll make sure Scrappy gets that message. Is there anything else you need?";
        updatedMemory.lastResponse = confirmationResponse;

        return {
          actions: [
            {
              say: confirmationResponse,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      } catch (error) {
        // Log error and inform user
        console.error("Error saving message to Scrappy:", error);
        const errorResponse =
          "Had trouble saving your message. Try again, or say 'menu' to go back.";
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

    case "message_saved":
      // Now that message is saved, allow hotline switching and other navigation
      const targetHotline = detectHotlineType(input);
      if (targetHotline && targetHotline !== "chicken") {
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
          case "loot":
            return await handleLootHotline(hotlineRequest, updatedMemory);
          case "intel":
            return await handleIntelHotline(hotlineRequest, updatedMemory);
        }
      } else if (isEndCallRequest(input)) {
        // User wants to end the call
        return createEndCallResponse(updatedMemory);
      } else if (isMenuNavigationRequest(input)) {
        // User wants to return to menu
        return createExitResponse(updatedMemory);
      } else {
        // User wants to send another message or continue conversation
        // Check if they want to send another message
        if (
          input.includes("message") ||
          input.includes("scrappy") ||
          input.includes("tell") ||
          input.includes("relay")
        ) {
          updatedMemory.step = "listening";
          const anotherMessageResponse =
            "What message would you like me to relay to Scrappy?";
          updatedMemory.lastResponse = anotherMessageResponse;
          return {
            actions: [
              {
                say: anotherMessageResponse,
                listen: true,
                remember: updatedMemory,
              },
            ],
          };
        } else {
          // Default: ask what they need
          const defaultResponse = "What else do you need, Raider?";
          updatedMemory.lastResponse = defaultResponse;
          return {
            actions: [
              {
                say: defaultResponse,
                listen: true,
                remember: updatedMemory,
              },
            ],
          };
        }
      }

    default:
      // Return to main menu with natural Shani response
      return createExitResponse(updatedMemory);
  }
}
