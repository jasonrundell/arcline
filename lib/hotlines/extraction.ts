import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { supabase } from "../supabase";
import { isRepeatRequest } from "../utils/repeat";
import {
  createExitResponse,
  createContinueOrExitResponse,
  isEndCallRequest,
  createEndCallResponse,
} from "../utils/exit";

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
      updatedMemory.step = "confirm";

      // Store extraction request in database
      try {
        const phoneNumber = (memory.phoneNumber as string) || "unknown";
        await supabase.from("extraction_requests").insert({
          phone_number: phoneNumber,
          location: location,
          status: "pending",
        });
      } catch (error) {
        console.error("Error storing extraction request:", error);
      }

      const locationResponse = `Copy that. Extraction request logged for ${location}. I've marked your position and routed it to the nearest hatch. Watch your six—ARC activity's unpredictable topside. Stay low, stay fast, and make it back to Speranza. Request acknowledged.`;
      updatedMemory.step = "complete";
      updatedMemory.lastResponse = locationResponse;
      return createContinueOrExitResponse(
        updatedMemory,
        locationResponse,
        "help with another extraction"
      );

    case "complete":
      // After completing extraction request, allow user to request another or return to menu
      if (
        input.includes("menu") ||
        input.includes("back") ||
        input.includes("main") ||
        input.includes("other") ||
        input.includes("different") ||
        input.includes("loot") ||
        input.includes("scrappy") ||
        input.includes("intel") ||
        input.includes("news")
      ) {
        // Return to main menu
        return createExitResponse(updatedMemory);
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
