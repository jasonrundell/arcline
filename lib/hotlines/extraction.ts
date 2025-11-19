import {
  ConversationRelayRequest,
  ConversationRelayResponse,
} from "../../types/twilio";
import { supabase } from "../supabase";

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

  switch (step) {
    case "greeting":
      updatedMemory.step = "location";
      return {
        actions: [
          {
            say: "Where are you topside? Give me your location and I'll help you get back to Speranza.",
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

      return {
        actions: [
          {
            say: `Copy that. Extraction request logged for ${location}. I've marked your position and routed it to the nearest hatch. Watch your six—ARC activity's unpredictable topside. Stay low, stay fast, and make it back to Speranza. Request acknowledged.`,
            listen: false,
            remember: updatedMemory,
          },
        ],
      };

    default:
      updatedMemory.step = "greeting";
      return {
        actions: [
          {
            say: "Extraction coordination closed. Stay safe out there, Raider. Speranza Security out.",
            listen: false,
            remember: updatedMemory,
          },
        ],
      };
  }
}
