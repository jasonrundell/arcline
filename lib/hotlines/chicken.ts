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
      // Check if user wants to switch to another hotline
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
      }

      // Use AI to generate dynamic response for user questions
      // This handles unexpected inputs and provides varied, contextual responses
      updatedMemory.step = "listening";

      try {
        // Generate AI response with context about Scrappy
        const aiResponse = await generateShaniResponse({
          context:
            "Scrappy's hotline is where Shani can relay a message to Scrappy. Scrappy is a rooster that collects materials topside in the video game ARC Raiders by Embark Studios.",
          userInput: request.CurrentInput,
          additionalContext:
            "Scrappy is a rooster that collects materials for Raiders. He's been around a long time and has good instincts for avoiding ARC threats. Shani monitors his operations and relays his status.",
        });

        // Append follow-up question to keep conversation flowing
        const response = `${aiResponse} Anything else you need to know about Scrappy's operations?`;
        updatedMemory.lastResponse = response;

        return {
          actions: [
            {
              say: response,
              listen: true,
              remember: updatedMemory,
            },
          ],
        };
      } catch (error) {
        // Fallback to scripted response if AI fails
        console.error("Error generating AI response, using fallback:", error);
        const fallbackResponse =
          "That rooster's been busy topside.. brought back standard salvage. No ARC contact detected during his run. Anything else you need to know about Scrappy's operations?";
        updatedMemory.lastResponse = fallbackResponse;
        return {
          actions: [
            {
              say: fallbackResponse,
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
