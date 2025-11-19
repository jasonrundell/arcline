import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { generateShaniResponse } from "../ai/shaniresponse";

// Scripted responses for standard flows (greeting, exit, fallback)
const SCRIPTED_RESPONSES = {
  greeting:
    "Scrappy isn't back yet from his latest run. I can relay your message to him when he gets back. What do you need to know?",
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

  switch (step) {
    case "greeting":
      // Scripted greeting - always use this for consistency
      updatedMemory.step = "listening";
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
      // Check if user wants to exit - scripted response
      if (
        input.includes("bye") ||
        input.includes("exit") ||
        input.includes("goodbye") ||
        input.includes("done") ||
        input.includes("finished")
      ) {
        updatedMemory.step = "complete";
        return {
          actions: [
            {
              say: SCRIPTED_RESPONSES.exit,
              listen: false,
              remember: updatedMemory,
            },
          ],
        };
      }

      // Use AI to generate dynamic response for user questions
      // This handles unexpected inputs and provides varied, contextual responses
      updatedMemory.step = "listening";

      try {
        // Generate AI response with context about Scrappy
        const aiResponse = await generateShaniResponse({
          context:
            "Scrappy's material collection channel - monitoring and relaying updates about a rooster that collects materials topside",
          userInput: request.CurrentInput,
          additionalContext:
            "Scrappy is a rooster that collects materials for Raiders. He's been around a long time and has good instincts for avoiding ARC threats. Shani monitors his operations and relays his status.",
        });

        // Append follow-up question to keep conversation flowing
        const response = `${aiResponse} Anything else you need to know about Scrappy's operations?`;

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
          "Scrappy's reporting successful material collection. That rooster's been busy topside—brought back standard salvage. No ARC contact detected during his run. Anything else you need to know about Scrappy's operations?";
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
      // Scripted default response
      updatedMemory.step = "greeting";
      return {
        actions: [
          {
            say: SCRIPTED_RESPONSES.default,
            listen: true,
            remember: updatedMemory,
          },
        ],
      };
  }
}
