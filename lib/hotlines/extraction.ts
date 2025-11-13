import { ConversationRelayRequest, ConversationRelayResponse } from "@/types/twilio";
import { supabase } from "@/lib/supabase";

export async function handleExtractionHotline(
  request: ConversationRelayRequest,
  memory: Record<string, unknown>
): Promise<ConversationRelayResponse> {
  const input = request.CurrentInput.toLowerCase().trim();
  const step = (memory.step as string) || "greeting";

  // Initialize hotline type in memory
  const updatedMemory: Record<string, unknown> = { ...memory, hotlineType: "extraction" };

  switch (step) {
    case "greeting":
      updatedMemory.step = "location";
      return {
        actions: [
          {
            say: "Welcome to the Extraction Request Hotline. This is an automated system. Please provide your current location for extraction.",
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
        const phoneNumber = memory.phoneNumber as string || "unknown";
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
            say: `Extraction request received for location: ${location}. Your request has been logged. An extraction team will be dispatched shortly. Stay safe out there.`,
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
            say: "Thank you for using the Extraction Request Hotline. Goodbye.",
            listen: false,
            remember: updatedMemory,
          },
        ],
      };
  }
}

